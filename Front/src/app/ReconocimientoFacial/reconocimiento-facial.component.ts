import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaceDetection, Results } from '@mediapipe/face_detection';
import { Camera } from '@mediapipe/camera_utils';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';

interface CaptureResult {
  timestamp: Date;
  faceDetected: boolean;
  isRecognized: boolean;
  confidence: number;
  personName?: string;
  message: string;
  errorType?: 'TIMING' | 'NOT_RECOGNIZED' | 'SUCCESS' | 'ERROR';
}

@Component({
  selector: 'app-reconocimiento-facial',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reconocimiento-facial.component.html',
})
export class ReconocimientoFacialComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement', { static: true }) videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private camera?: Camera;
  private faceDetector?: FaceDetection;
  
  // Estado de la cámara
  public statusMessage: string = 'Iniciando cámara...';
  public isProcessing = false;
  public cameraReady = false;
  public cameraError = false;

  // Control de captura automática
  private captureInterval?: Subscription;
  private readonly CAPTURE_INTERVAL = 15000; // 15 segundos
  private lastCaptureTime = 0;
  private consecutiveValidFrames = 0;
  private readonly REQUIRED_VALID_FRAMES = 15;

  // Resultados de capturas
  public captureHistory: CaptureResult[] = [];
  public lastCaptureResult: CaptureResult | null = null;
  public isRecognitionEnabled = true;

  // Datos del usuario autenticado
  private currentUserName: string = 'Cargando...';
  private currentUserId: string = '';

  // Validación de rostro
  private readonly MIN_FACE_AREA = 0.04;
  private readonly MAX_FACE_AREA = 0.35;
  private readonly CENTER_TOLERANCE = 0.15;
  private recentDetections: number[] = [];
  private lastValidationTime = 0;

  constructor(private http: HttpClient) {}

  /**
   * 🔧 Obtener nombre del usuario desde el backend usando el ID del token
   */
  private async getCurrentUserName() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('[ReconocimientoFacial] ⚠️ No hay token en localStorage');
        this.currentUserName = 'Usuario';
        return;
      }

      // Decodificar JWT para obtener el ID
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.warn('[ReconocimientoFacial] ⚠️ Token con formato inválido');
        this.currentUserName = 'Usuario';
        return;
      }

      const payload = JSON.parse(atob(parts[1]));
      console.log('[ReconocimientoFacial] 📖 Payload del token:', payload);

      // Obtener ID del usuario (sub)
      const userId = payload.sub || payload.id || payload.userId;
      if (!userId) {
        console.warn('[ReconocimientoFacial] ⚠️ No se encontró ID en el token');
        this.currentUserName = 'Usuario';
        return;
      }

      this.currentUserId = userId;
      console.log('[ReconocimientoFacial] 🔑 ID del usuario:', this.currentUserId);

      // 🔧 LLAMADA AL BACKEND PARA OBTENER DATOS DEL USUARIO
      this.http.get<any>(`/api/usuarios/${userId}`).subscribe({
        next: (userResponse) => {
          console.log('[ReconocimientoFacial] ✅ Datos del usuario:', userResponse);

          // Intentar extraer nombre de diferentes campos posibles
          this.currentUserName = 
            userResponse.nombreCompleto ||
            userResponse.nombre_completo ||
            userResponse.nombre ||
            userResponse.name ||
            userResponse.fullName ||
            userResponse.full_name ||
            `${userResponse.nombre || ''} ${userResponse.apellido || ''}`.trim() ||
            userResponse.usuario ||
            userResponse.email ||
            'Usuario';

          console.log('[ReconocimientoFacial] 👤 Usuario actual:', this.currentUserName);
          
          // Actualizar mensaje de estado
          this.statusMessage = 'Cámara lista - Posiciónate frente a la cámara';
        },
        error: (error) => {
          console.error('[ReconocimientoFacial] ❌ Error al obtener datos del usuario:', error);
          this.currentUserName = 'Usuario';
          this.statusMessage = 'Cámara lista - Posiciónate frente a la cámara';
        }
      });

    } catch (error) {
      console.error('[ReconocimientoFacial] ❌ Error al decodificar token:', error);
      this.currentUserName = 'Usuario';
    }
  }

  async ngOnInit() {
    try {
      // Obtener datos del usuario primero
      await this.getCurrentUserName();
      
      await this.initFaceDetector();
      this.startCamera();
      this.setupAutoCapture();
    } catch (error) {
      console.error('[ReconocimientoFacial] Error iniciando:', error);
      this.statusMessage = 'Error al inicializar la cámara';
      this.cameraError = true;
    }
  }

  private async initFaceDetector() {
    this.faceDetector = new FaceDetection({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`
    });

    this.faceDetector.setOptions({
      model: 'short',
      minDetectionConfidence: 0.3
    });

    this.faceDetector.onResults(this.onResults.bind(this));
    console.log('[ReconocimientoFacial] ✅ Face Detector inicializado');
  }

  private startCamera() {
    const video = this.videoRef.nativeElement;
    
    try {
      this.camera = new Camera(video, {
        onFrame: async () => {
          if (this.faceDetector && !this.isProcessing) {
            await this.faceDetector.send({ image: video });
          }
        },
        width: 1280,
        height: 720
      });
      
      this.camera.start();
      this.cameraReady = true;
      this.statusMessage = 'Cámara lista - Posiciónate frente a la cámara';
      console.log('[ReconocimientoFacial] ✅ Cámara iniciada');
    } catch (error) {
      console.error('[ReconocimientoFacial] Error iniciando cámara:', error);
      this.statusMessage = 'Error al acceder a la cámara. Verifica permisos.';
      this.cameraError = true;
    }
  }

  private setupAutoCapture() {
    this.captureInterval = interval(1000).subscribe(() => {
      const now = Date.now();
      
      if (
        this.cameraReady &&
        !this.isProcessing &&
        this.isRecognitionEnabled &&
        now - this.lastCaptureTime >= this.CAPTURE_INTERVAL &&
        this.consecutiveValidFrames >= this.REQUIRED_VALID_FRAMES
      ) {
        this.captureFrame();
      }
    });
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
      this.statusMessage = '👤 No se detecta rostro';
      this.consecutiveValidFrames = 0;
      this.recentDetections = [];
      return;
    }

    const detection = results.detections[0];
    const box = this.getBox(detection, canvas.width, canvas.height);
    
    if (!box || box.width <= 0 || box.height <= 0) {
      this.statusMessage = '⚠️ Error en detección';
      this.consecutiveValidFrames = 0;
      return;
    }

    const area = (box.width * box.height) / (canvas.width * canvas.height);
    const confidence = (detection as any).score?.[0] || 0;

    if (area < 0.005 || isNaN(area)) {
      this.statusMessage = '👤 Sin rostro detectado';
      this.consecutiveValidFrames = 0;
      this.recentDetections = [];
      return;
    }

    if (area < this.MIN_FACE_AREA) {
      this.statusMessage = '📍 Acércate más a la cámara';
      this.consecutiveValidFrames = 0;
      this.drawBox(ctx, box, '#FFA500', 2);
      return;
    }

    if (area > this.MAX_FACE_AREA) {
      this.statusMessage = '📍 Aléjate un poco de la cámara';
      this.consecutiveValidFrames = 0;
      this.drawBox(ctx, box, '#FF6B6B', 2);
      return;
    }

    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;
    const frameX = canvas.width / 2;
    const frameY = canvas.height / 2;
    
    const diffX = Math.abs(centerX - frameX) / canvas.width;
    const diffY = Math.abs(centerY - frameY) / canvas.height;

    if (diffX > this.CENTER_TOLERANCE || diffY > this.CENTER_TOLERANCE) {
      const direction = diffX > diffY 
        ? (centerX < frameX ? '→ derecha' : '← izquierda')
        : (centerY < frameY ? '↓ abajo' : '↑ arriba');
      
      this.statusMessage = `📍 Muévete ${direction}`;
      this.consecutiveValidFrames = 0;
      this.drawBox(ctx, box, '#FFA500', 2);
      return;
    }

    const aspectRatio = box.width / box.height;
    if (aspectRatio < 0.6 || aspectRatio > 1.4) {
      this.statusMessage = '📍 Ajusta la posición del rostro';
      this.consecutiveValidFrames = 0;
      this.drawBox(ctx, box, '#FFA500', 2);
      return;
    }

    if (confidence > 0 && confidence < 0.25) {
      this.statusMessage = '👤 Descubre tu rostro completamente';
      this.consecutiveValidFrames = 0;
      this.drawBox(ctx, box, '#FF6B6B', 2);
      return;
    }

    // ✅ ROSTRO VÁLIDO
    this.recentDetections.push(area);
    if (this.recentDetections.length > 10) {
      this.recentDetections.shift();
    }

    this.consecutiveValidFrames++;
    this.lastValidationTime = Date.now();

    const progress = Math.min(100, (this.consecutiveValidFrames / this.REQUIRED_VALID_FRAMES) * 100);
    const secondsRemaining = Math.max(0, (this.CAPTURE_INTERVAL - (Date.now() - this.lastCaptureTime)) / 1000);

    this.statusMessage = `✅ Rostro detectado • ${progress.toFixed(0)}% • Captura en ${secondsRemaining.toFixed(0)}s`;
    this.drawBox(ctx, box, '#4CAF50', 3);
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

  private drawBox(ctx: CanvasRenderingContext2D, box: any, color: string, width: number) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.strokeRect(box.x, box.y, box.width, box.height);

    const cornerSize = 15;
    ctx.fillStyle = color;
    
    ctx.fillRect(box.x, box.y, cornerSize, width);
    ctx.fillRect(box.x, box.y, width, cornerSize);
    ctx.fillRect(box.x + box.width - cornerSize, box.y, cornerSize, width);
    ctx.fillRect(box.x + box.width - width, box.y, width, cornerSize);
    ctx.fillRect(box.x, box.y + box.height - width, cornerSize, width);
    ctx.fillRect(box.x, box.y + box.height - cornerSize, width, cornerSize);
    ctx.fillRect(box.x + box.width - cornerSize, box.y + box.height - width, cornerSize, width);
    ctx.fillRect(box.x + box.width - width, box.y + box.height - cornerSize, width, cornerSize);
  }

  private captureFrame() {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    this.lastCaptureTime = Date.now();
    this.statusMessage = '📸 Capturando rostro...';

    const video = this.videoRef.nativeElement;
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    this.recognizeAndMarkAttendance(dataUrl);
  }

  private recognizeAndMarkAttendance(imageDataUrl: string) {
  const formData = new FormData();
  formData.append('image', this.dataURLToBlob(imageDataUrl), 'face.jpg');

  console.log('[ReconocimientoFacial] 📸 Enviando imagen para reconocimiento...');
  
  this.http.post<any>('/api/asistencia/reconocimiento-facial', formData).subscribe({
    next: (response) => {
      console.log('[ReconocimientoFacial] ✅ Respuesta del backend:', response);
      
      // 🔧 NUEVO: Usar nombreUsuario del response
      const personName = response.nombreUsuario ||     // ← PRINCIPAL
                        response.personName || 
                        response.nombre || 
                        response.usuario?.nombre ||
                        response.usuario?.name ||
                        this.currentUserName;

      console.log('[ReconocimientoFacial] 👤 Nombre extraído:', personName);

      const result: CaptureResult = {
        timestamp: new Date(),
        faceDetected: true,
        isRecognized: response.estado || response.success || false,  // ← USAR estado
        confidence: response.confidence || response.matchPercentage || 0.95,
        personName: personName,
        message: response.tipoEvento || response.message || 'Asistencia registrada',  // ← USAR tipoEvento
        errorType: 'SUCCESS'
      };

      this.lastCaptureResult = result;
      this.captureHistory.unshift(result);
      
      if (this.captureHistory.length > 10) {
        this.captureHistory.pop();
      }

      this.statusMessage = `✅ ¡Bienvenido ${result.personName}!`;
      console.log('[ReconocimientoFacial] ✅ Éxito:', result.personName);

      this.consecutiveValidFrames = 0;
      this.isProcessing = false;
    },
    error: (error) => {
      console.error('[ReconocimientoFacial] ❌ Error en reconocimiento:', error);
      
      let errorMessage = 'Error en procesamiento';
      let errorType: 'TIMING' | 'NOT_RECOGNIZED' | 'ERROR' = 'ERROR';
      let personName = this.currentUserName;

      // Extraer mensaje de error
      if (error.error && typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.error?.error) {
        errorMessage = error.error.error;
      }

      console.log('[ReconocimientoFacial] 📋 Mensaje de error extraído:', errorMessage);

      // Clasificar tipo de error
      if (errorMessage.includes('demasiado temprano') || errorMessage.includes('entrada es a las')) {
        errorType = 'TIMING';
      } else if (errorMessage.includes('no existe ese usuario') || errorMessage.includes('Rostro no reconocido')) {
        errorType = 'NOT_RECOGNIZED';
        personName = 'Desconocido';
      } else {
        errorType = 'ERROR';
        personName = 'Sistema';
      }

      const result: CaptureResult = {
        timestamp: new Date(),
        faceDetected: true,
        isRecognized: false,
        confidence: 0,
        personName: personName,
        message: errorMessage,
        errorType: errorType
      };

      this.lastCaptureResult = result;
      this.captureHistory.unshift(result);
      
      if (this.captureHistory.length > 10) {
        this.captureHistory.pop();
      }

      // Mensaje según tipo de error
      if (errorType === 'TIMING') {
        this.statusMessage = `⏰ ${personName} - ${errorMessage}`;
      } else if (errorType === 'NOT_RECOGNIZED') {
        this.statusMessage = `❌ ${personName} - No reconocido`;
      } else {
        this.statusMessage = `❌ ${errorMessage}`;
      }

      this.consecutiveValidFrames = 0;
      this.isProcessing = false;
    }
  });
}

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

  toggleRecognition() {
    this.isRecognitionEnabled = !this.isRecognitionEnabled;
    this.statusMessage = this.isRecognitionEnabled 
      ? '✅ Reconocimiento activado' 
      : '⏸️ Reconocimiento pausado';
    
    setTimeout(() => {
      this.statusMessage = 'Cámara lista - Posiciónate frente a la cámara';
    }, 2000);
  }

  clearHistory() {
    this.captureHistory = [];
    this.lastCaptureResult = null;
  }

  ngOnDestroy() {
    this.captureInterval?.unsubscribe();
    this.camera?.stop();
    (this.faceDetector as any)?.close?.();
  }
}