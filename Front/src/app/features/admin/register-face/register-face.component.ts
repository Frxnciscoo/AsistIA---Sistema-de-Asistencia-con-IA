import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { ModalCamaraComponent } from '../../../shared/components/ModalCamara/modal-camara.component';
import { UserService } from '../../../core/services/user.service';  // ← AGREGAR
import { HttpClient } from '@angular/common/http';  // ← AGREGAR

@Component({
  selector: 'app-register-face',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    SidebarComponent, 
    HeaderComponent, 
    ModalCamaraComponent
  ],
  templateUrl: './register-face.component.html',
})
export class RegisterFaceComponent {
  // Datos del usuario
  employeeData = {
    name: '',
    lastname: '',
    email: '',
    dni: '',
    position: ''
  };

  // Preview de la foto subida o tomada
  facePreview: string = '';
  showModal: boolean = false;

  // Estados
  loading = false;  // ← AGREGAR
  error: string | null = null;  // ← AGREGAR

  constructor(
    private userService: UserService,  // ← AGREGAR
    private http: HttpClient  // ← AGREGAR
  ) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.facePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  handlePhoto(photoDataUrl: string) {
    this.facePreview = photoDataUrl;
    this.closeModal();
  }

  registerFace() {
    // Validaciones
    if (!this.employeeData.name.trim() || !this.employeeData.lastname.trim() ||
        !this.employeeData.email.trim() || !this.employeeData.position.trim()) {
      this.error = 'Por favor llena todos los datos del usuario.';
      return;
    }
    if (!this.facePreview) {
      this.error = 'Debes subir o tomar una foto del rostro.';
      return;
    }

    this.loading = true;
    this.error = null;

    // Crear DTO para el usuario
    const userDto = this.userService.userToUsuarioCreateDto({
      id: -1,
      name: this.employeeData.name,
      lastName: this.employeeData.lastname,
      email: this.employeeData.email,
      dni: this.employeeData.dni,
      password: 'temporal123',  // Contraseña temporal
      role: this.employeeData.position,  // Usar position como rol
      lastAttendance: new Date(),
      isActive: true
    });

    // Crear usuario primero
    this.userService.createUser(userDto).subscribe({
      next: (usuarioCreado) => {
        console.log('Usuario creado:', usuarioCreado);
        
        // Convertir imagen base64 a File y subir
        const imageFile = this.base64ToFile(this.facePreview, 'face.jpg');
        this.uploadUserImage((usuarioCreado as any).idUsuario || usuarioCreado.id, imageFile);
      },
      error: (error) => {
        console.error('Error creando usuario:', error);
        this.error = 'Error al crear el usuario. Intenta nuevamente.';
        this.loading = false;
      }
    });
  }

  // Método para convertir base64 a File
  private base64ToFile(base64: string, filename: string): File {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  // Método para subir imagen
  private uploadUserImage(userId: number, imageFile: File) {
    const formData = new FormData();
    formData.append('imagen', imageFile);

    this.http.post(`http://localhost:8081/Usuarios/${userId}/imagen`, formData).subscribe({
      next: () => {
        console.log('Imagen subida exitosamente');
        this.loading = false;
        alert('Usuario y foto registrados con éxito.');
        
        // Limpiar formulario
        this.employeeData = { name: '', lastname: '', email: '', position: '', dni: '' };
        this.facePreview = '';
      },
      error: (error) => {
        console.error('Error subiendo imagen:', error);
        this.error = 'Usuario creado, pero error al subir la imagen. Intenta editar el usuario después.';
        this.loading = false;
      }
    });
  }
}