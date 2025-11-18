import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaceDetection, Results } from '@mediapipe/face_detection';
import { Camera } from '@mediapipe/camera_utils';

@Component({
  selector: 'app-modal-camara',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-camara.component.html',
  styleUrls: ['./modal-camara.component.css']
})
export class ModalCamaraComponent implements OnInit, OnDestroy {
  @Output() close = new EventEmitter<void>();
  @Output() photoTaken = new EventEmitter<string>();

  @ViewChild('videoElement', { static: true }) videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private camera?: Camera;
  private faceDetector?: FaceDetection;
  public statusMessage: string = 'Iniciando cámara...';

  private readonly MIN_FACE_AREA = 0.03;  // 3% del área total
  private readonly CENTER_TOLERANCE = 0.2; // 20% de tolerancia para centrado más flexible
  private validFrameCount = 0;
  private readonly REQUIRED_FRAMES = 45; // ~1.5 segundos a 30fps
  private isReady = false;
  private recentDetections: number[] = []; // Guarda áreas de detección para consistencia
  private lastValidationTime = 0;

  async ngOnInit() {
    await this.initFaceDetector();
    this.startCamera();
  }

  private async initFaceDetector() {
    this.faceDetector = new FaceDetection({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`
    });

    this.faceDetector.setOptions({
      model: 'short',
      minDetectionConfidence: 0.2 // Balanceado para permitir rostros válidos
    });

    this.faceDetector.onResults(this.onResults.bind(this));
  }

  private startCamera() {
    const video = this.videoRef.nativeElement;
    this.camera = new Camera(video, {
      onFrame: async () => {
        if (this.faceDetector) {
          await this.faceDetector.send({ image: video });
        }
      },
      width: 640,
      height: 480
    });
    this.camera.start();
  }

  private onResults(results: Results) {
    const video = this.videoRef.nativeElement;
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. VALIDACIÓN BÁSICA: ¿Hay detecciones?
    if (!results.detections || results.detections.length === 0) {
      this.statusMessage = 'No se detecta ningún rostro';
      this.resetValidation();
      this.recentDetections = []; // Limpiar historial cuando no hay rostro
      console.log('❌ Sin detecciones - limpiando estado');
      return;
    }

    const detection = results.detections[0];
    const box = this.getBox(detection, canvas.width, canvas.height);
    
    if (!box || box.width <= 0 || box.height <= 0) {
      this.statusMessage = 'Error en detección del rostro';
      this.resetValidation();
      this.recentDetections = [];
      return;
    }

    // 2. VALIDACIÓN DE TAMAÑO: Calcular área una sola vez
    const area = (box.width * box.height) / (canvas.width * canvas.height);
    
    // VALIDACIÓN ANTI-FANTASMA: Solo rechazar áreas extremadamente pequeñas
    if (area < 0.005 || isNaN(area)) { // Solo menos del 0.5% es ruido
      this.statusMessage = 'No se detecta ningún rostro';
      this.resetValidation();
      this.recentDetections = [];
      return;
    }

    // ¿Está lo suficientemente cerca?
    if (area < this.MIN_FACE_AREA) {
      this.statusMessage = 'Acércate más a la cámara';
      this.resetValidation();
      // Limpiar historial si el área es muy pequeña (posible falso positivo)
      if (area < 0.015) this.recentDetections = [];
      this.drawBox(ctx, box, 'yellow');
      return;
    }

    // Área máxima (demasiado cerca)
    if (area > 0.4) {
      this.statusMessage = 'Aléjate un poco de la cámara';
      this.resetValidation();
      this.drawBox(ctx, box, 'orange');
      return;
    }

    // 3. VALIDACIÓN DE CENTRADO: ¿Está el rostro centrado?
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;
    const frameX = canvas.width / 2;
    const frameY = canvas.height / 2;
    
    const diffX = Math.abs(centerX - frameX) / canvas.width;
    const diffY = Math.abs(centerY - frameY) / canvas.height;

    // Solo validar centrado si las coordenadas son números válidos
    if (!isNaN(diffX) && !isNaN(diffY)) {
      if (diffX > this.CENTER_TOLERANCE || diffY > this.CENTER_TOLERANCE) {
        const direction = diffX > diffY 
          ? (centerX < frameX ? 'derecha' : 'izquierda')
          : (centerY < frameY ? 'abajo' : 'arriba');
        this.statusMessage = `Muévete hacia la ${direction}`;
        this.resetValidation();
        this.drawBox(ctx, box, 'orange');
        return;
      }
    }

    // 4. VALIDACIÓN ALTERNATIVA: MediaPipe a veces da confianza 0 incluso para rostros válidos
    const confidence = (detection as any).score?.[0] || 0;
    
    // Mantener historial de detecciones recientes (más corto para mayor responsividad)
    this.recentDetections.push(area);
    if (this.recentDetections.length > 6) { // Reducido de 8 a 6
      this.recentDetections.shift();
    }
    
    console.log(`Confianza: ${confidence.toFixed(3)}, Área: ${(area * 100).toFixed(1)}%, Detecciones: ${this.recentDetections.length}`);
    
    // VALIDACIÓN INTELIGENTE: Si MediaPipe detecta consistentemente un rostro del mismo tamaño
    // pero con confianza 0, probablemente es un rostro válido
    const isConsistentDetection = this.recentDetections.length >= 4; // Reducido a 4 detecciones
    const areaVariance = isConsistentDetection 
      ? Math.max(...this.recentDetections) - Math.min(...this.recentDetections)
      : 1;
    
    // Validaciones más permisivas para detección consistente
    const hasGoodSize = area > 0.06 && area < 0.5; // Más permisivo: 6%
    const isStable = areaVariance < 0.05; // Más permisivo: 5% de varianza máxima
    const hasReasonableShape = box.width > 40 && box.height > 40; // Más permisivo
    
    // Si las detecciones son consistentes Y cumplen criterios, aceptar confianza 0
    if (confidence === 0 && isConsistentDetection && isStable && hasGoodSize && hasReasonableShape) {
      console.log('✅ Aceptando por detección consistente:', {
        detecciones: this.recentDetections.length,
        varianza: areaVariance.toFixed(3),
        area: (area * 100).toFixed(1) + '%'
      });
      // Continuar sin rechazar
    } else if (confidence > 0 && confidence < 0.2) {
      // Rechazar confianza genuinamente baja
      this.statusMessage = 'Descubre tu rostro completamente';
      this.resetValidation();
      this.drawBox(ctx, box, 'red');
      return;
    } else if (confidence === 0 && !isConsistentDetection) {
      // Mostrar progreso mientras construye el historial
      const buildingHistory = this.recentDetections.length;
      this.statusMessage = `Detectando rostro... ${buildingHistory}/4`;
      this.resetValidation();
      this.drawBox(ctx, box, 'yellow');
      return;
    }

    // 5. VALIDACIÓN DE PROPORCIÓN: ¿Tiene forma de rostro?
    const aspectRatio = box.width / box.height;
    if (aspectRatio < 0.5 || aspectRatio > 2.0) {
      this.statusMessage = 'Ajusta la posición de tu rostro';
      this.resetValidation();
      this.drawBox(ctx, box, 'orange');
      return;
    }

    // ✅ TODAS LAS VALIDACIONES PASARON - Ahora validar por tiempo
    this.validFrameCount++;
    this.lastValidationTime = Date.now();
    
    // Calcular progreso en segundos (asumiendo ~30fps)
    const secondsRemaining = Math.max(0, (this.REQUIRED_FRAMES - this.validFrameCount) / 30);
    
    if (this.validFrameCount >= this.REQUIRED_FRAMES) {
      this.isReady = true;
      this.statusMessage = '¡Perfecto! Toma la foto';
      this.drawBox(ctx, box, 'lime', 4);
    } else {
      this.statusMessage = `Mantén la posición ${secondsRemaining.toFixed(1)}s`;
      this.drawBox(ctx, box, 'lightgreen', 2);
    }
  }

  private resetValidation() {
    this.validFrameCount = 0;
    this.isReady = false;
    this.lastValidationTime = 0;
    // NO limpiar recentDetections aquí - solo limpiar cuando realmente no hay rostro
  }

  private getBox(detection: any, width: number, height: number) {
    const box = detection.boundingBox || detection.locationData?.relativeBoundingBox;
    if (!box) return null;

    return {
      x: (box.xMin ?? box.x) * width,
      y: (box.yMin ?? box.y) * height,
      width: box.width * width,
      height: box.height * height
    };
  }

  private drawBox(ctx: CanvasRenderingContext2D, box: any, color: string, width = 2) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.strokeRect(box.x, box.y, box.width, box.height);
  }

  async takePhoto() {
    // Validación temporal: verificar que el rostro siga siendo válido
    const timeSinceLastValidation = Date.now() - this.lastValidationTime;
    
    if (!this.isReady) {
      alert('Espera a que se detecte tu rostro correctamente');
      return;
    }

    if (timeSinceLastValidation > 500) { // 500ms de tolerancia
      alert('Rostro no válido en este momento. Posiciónate correctamente y espera la confirmación.');
      this.resetValidation();
      return;
    }

    if (this.validFrameCount < this.REQUIRED_FRAMES) {
      alert('Mantén la posición un poco más');
      return;
    }

    const video = this.videoRef.nativeElement;
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d')!;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    this.photoTaken.emit(dataUrl);
    this.closeModal();
  }

  closeModal() {
    this.close.emit();
    this.stopCamera();
  }

  private stopCamera() {
    this.camera?.stop();
  }

  ngOnDestroy() {
    this.stopCamera();
    (this.faceDetector as any)?.close?.();
  }
}
