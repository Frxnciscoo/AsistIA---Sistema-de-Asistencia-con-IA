import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaceDetection, Results } from '@mediapipe/face_detection';
import { Camera } from '@mediapipe/camera_utils';
import { HttpClient } from '@angular/common/http';  // Para peticiones públicas

@Component({
  selector: 'app-reconocimiento-facial',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reconocimiento-facial.component.html'
})
export class ReconocimientoFacialComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement', { static: true }) videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private camera?: Camera;
  private faceDetector?: FaceDetection;
  public statusMessage: string = 'Iniciando cámara...';
  public isProcessing = false;

  private readonly MIN_FACE_AREA = 0.03;
  private readonly CENTER_TOLERANCE = 0.2;
  private validFrameCount = 0;
  private readonly REQUIRED_FRAMES = 45;
  private isReady = false;
  private recentDetections: number[] = [];
  private lastValidationTime = 0;

  constructor(private http: HttpClient) {}  // Solo HttpClient para peticiones públicas

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
      minDetectionConfidence: 0.2
    });

    this.faceDetector.onResults(this.onResults.bind(this));
  }

  private startCamera() {
    const video = this.videoRef.nativeElement;
    this.camera = new Camera(video, {
      onFrame: async () => {
        if (this.faceDetector && !this.isProcessing) {
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

    if (!results.detections || results.detections.length === 0) {
      this.statusMessage = 'No se detecta ningún rostro';
      this.resetValidation();
      this.recentDetections = [];
      return;
    }

    const detection = results.detections[0];
    const box = this.getBox(detection, canvas.width, canvas.height);
    
    if (!box || box.width <= 0 || box.height <= 0) {
      this.statusMessage = 'Error en detección del rostro';
      this.resetValidation();
      return;
    }

    const area = (box.width * box.height) / (canvas.width * canvas.height);
    
    if (area < 0.005 || isNaN(area)) {
      this.statusMessage = 'No se detecta ningún rostro';
      this.resetValidation();
      this.recentDetections = [];
      return;
    }

    if (area < this.MIN_FACE_AREA) {
      this.statusMessage = 'Acércate más a la cámara';
      this.resetValidation();
      if (area < 0.015) this.recentDetections = [];
      this.drawBox(ctx, box, 'yellow');
      return;
    }

    if (area > 0.4) {
      this.statusMessage = 'Aléjate un poco de la cámara';
      this.resetValidation();
      this.drawBox(ctx, box, 'orange');
      return;
    }

    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;
    const frameX = canvas.width / 2;
    const frameY = canvas.height / 2;
    
    const diffX = Math.abs(centerX - frameX) / canvas.width;
    const diffY = Math.abs(centerY - frameY) / canvas.height;

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

    const confidence = (detection as any).score?.[0] || 0;
    
    this.recentDetections.push(area);
    if (this.recentDetections.length > 6) {
      this.recentDetections.shift();
    }
    
    const isConsistentDetection = this.recentDetections.length >= 4;
    const areaVariance = isConsistentDetection 
      ? Math.max(...this.recentDetections) - Math.min(...this.recentDetections)
      : 1;
    
    const hasGoodSize = area > 0.06 && area < 0.5;
    const isStable = areaVariance < 0.05;
    const hasReasonableShape = box.width > 40 && box.height > 40;
    
    if (confidence === 0 && isConsistentDetection && isStable && hasGoodSize && hasReasonableShape) {
      // Continuar sin rechazar
    } else if (confidence > 0 && confidence < 0.2) {
      this.statusMessage = 'Descubre tu rostro completamente';
      this.resetValidation();
      this.drawBox(ctx, box, 'red');
      return;
    } else if (confidence === 0 && !isConsistentDetection) {
      const buildingHistory = this.recentDetections.length;
      this.statusMessage = `Detectando rostro... ${buildingHistory}/4`;
      this.resetValidation();
      this.drawBox(ctx, box, 'yellow');
      return;
    }

    const aspectRatio = box.width / box.height;
    if (aspectRatio < 0.5 || aspectRatio > 2.0) {
      this.statusMessage = 'Ajusta la posición de tu rostro';
      this.resetValidation();
      this.drawBox(ctx, box, 'orange');
      return;
    }

    this.validFrameCount++;
    this.lastValidationTime = Date.now();
    
    const secondsRemaining = Math.max(0, (this.REQUIRED_FRAMES - this.validFrameCount) / 30);
    
    if (this.validFrameCount >= this.REQUIRED_FRAMES) {
      this.isReady = true;
      this.statusMessage = '¡Perfecto! Procesando asistencia...';
      this.drawBox(ctx, box, 'lime', 4);
      this.processAttendance();
    } else {
      this.statusMessage = `Mantén la posición ${secondsRemaining.toFixed(1)}s`;
      this.drawBox(ctx, box, 'lightgreen', 2);
    }
  }

  private resetValidation() {
    this.validFrameCount = 0;
    this.isReady = false;
    this.lastValidationTime = 0;
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

  private async processAttendance() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    const video = this.videoRef.nativeElement;
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    
    // Enviar imagen al backend para reconocimiento (público, sin token)
    this.recognizeAndMarkAttendance(dataUrl);
  }

  // ... (código existente)

private recognizeAndMarkAttendance(imageDataUrl: string) {
  // Endpoint público para reconocimiento facial (sin token)
  const formData = new FormData();
  formData.append('image', this.dataURLToBlob(imageDataUrl), 'face.jpg');

  // ← CAMBIADO: Usar ruta relativa para que el proxy la redirija a http://localhost:8083/asistencias/reconocimiento-facial
  this.http.post('/api/asistencia/reconocimiento-facial', formData).subscribe({
    next: (response: any) => {
      this.statusMessage = '¡Asistencia marcada exitosamente!';
      setTimeout(() => this.resetForNext(), 3000);
    },
    error: (error) => {
      console.error('Error en procesamiento:', error);
      if (error.status === 400) {
        this.statusMessage = 'Rostro no reconocido o error en procesamiento';
      } else {
        this.statusMessage = 'Error al marcar asistencia';
      }
      this.resetForNext();
    }
  });
}

// ... (código existente)

  private dataURLToBlob(dataURL: string): Blob {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  private resetForNext() {
    this.isProcessing = false;
    this.resetValidation();
    this.statusMessage = 'Listo para el siguiente usuario';
  }

  ngOnDestroy() {
    this.camera?.stop();
    (this.faceDetector as any)?.close?.();
  }
}