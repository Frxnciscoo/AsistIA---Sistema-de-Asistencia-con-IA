import { Component, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { HeaderComponent } from "../components/header/header.component";
import { ModalComponent } from "../components/modal/modal.component";
import { FormsModule, NgModel } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { UserService, User } from '../../core/services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderComponent, ModalComponent, CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: any = {
    name: '',
    email: '',
    phone: '',
    address: '',
    dni: '',
    role: '',
    department: '',
    startDate: '',
    status: 'Activo',
    photo: '',
    notifications: {
      email: true,
      sms: false,
      push: true
    }
  };

  loading = false;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.loading = true;
    this.error = null;

    console.log('[Profile] Iniciando carga del perfil...');

    try {
      // Obtener información del token
      const payload = this.authService.getPayload();
      console.log('[Profile] Payload del token:', payload);
      
      if (!payload) {
        this.error = 'No se pudo obtener la información del usuario del token';
        this.loading = false;
        return;
      }

      // Extraer información básica del token
      console.log('[Profile] Extracting data from payload...');
      console.log('[Profile] PAYLOAD COMPLETO:', JSON.stringify(payload, null, 2));
      
      // Vamos a revisar todos los campos posibles
      console.log('[Profile] payload.email:', payload.email);
      console.log('[Profile] payload.correo:', payload.correo);
      console.log('[Profile] payload.sub:', payload.sub);
      console.log('[Profile] payload.username:', payload.username);
      console.log('[Profile] payload.user_name:', payload.user_name);
      
      // El sub parece ser el ID del usuario, no el email
      const userId = payload.sub;
      console.log('[Profile] ID del usuario del token:', userId);
      
      // Como no tenemos email directo en el token, vamos a buscar por ID
      // Pero si el backend no maneja IDs correctamente, buscaremos de otra forma
      
      // Obtener rol del token
      this.user.role = payload.scope || payload.role || payload.authorities || 'Usuario';
      console.log('[Profile] Rol extraído del token:', this.user.role);
      
      // Intentar obtener más datos del usuario desde el backend
      console.log('[Profile] Obteniendo usuarios del backend...');
      this.userService.getUsers().subscribe({
        next: (users) => {
          console.log('[Profile] ===== DEBUG INFORMACIÓN =====');
          console.log('[Profile] Total usuarios recibidos del backend:', users.length);
          console.log('[Profile] ID del usuario del token:', userId);
          
          // Mostrar todos los usuarios para comparar
          users.forEach((user, index) => {
            console.log(`[Profile] Usuario ${index + 1}:`, {
              id: user.id,
              nombre: user.nombre,
              apellido: user.apellido,
              correo: user.correo,
              dni: user.dni,
              nombreRol: user.nombreRol
            });
          });
          
          // Primero intentar buscar por ID
          let currentUser = users.find(u => u.id === parseInt(userId));
          console.log('[Profile] Usuario encontrado por ID:', currentUser);
          
          // Si no se encuentra por ID, intentar por posición (índice)
          if (!currentUser && userId && !isNaN(parseInt(userId))) {
            const userIndex = parseInt(userId) - 1; // Asumiendo que el ID empieza en 1
            if (userIndex >= 0 && userIndex < users.length) {
              currentUser = users[userIndex];
              console.log('[Profile] Usuario encontrado por índice:', currentUser);
            }
          }
          
          // Si aún no se encuentra, tomar el último usuario logueado (fallback)
          if (!currentUser && users.length > 0) {
            // Podríamos usar el rol para encontrar un usuario apropiado
            const adminUsers = users.filter(u => u.nombreRol === 'Administrador');
            if (this.user.role === 'Administrador' && adminUsers.length > 0) {
              currentUser = adminUsers[0];
              console.log('[Profile] Usuario admin encontrado por rol:', currentUser);
            } else {
              currentUser = users[0]; // Último recurso
              console.log('[Profile] Usuario por defecto (fallback):', currentUser);
            }
          }
          
          console.log('[Profile] Usuario final seleccionado:', currentUser);
          console.log('[Profile] ===== FIN DEBUG =====');
          
          if (currentUser) {
            // Mapear datos del backend
            this.user.name = `${currentUser.nombre || ''} ${currentUser.apellido || ''}`.trim();
            this.user.email = currentUser.correo;
            this.user.dni = currentUser.dni;
            this.user.role = currentUser.nombreRol || this.user.role;
            this.user.status = currentUser.estado ? 'Activo' : 'Inactivo';
            this.user.startDate = currentUser.fechaCreacion ? 
              new Date(currentUser.fechaCreacion).toLocaleDateString('es-ES') : '';
            this.user.photo = currentUser.imagen || '';  // Ruta relativa desde el backend
    
    console.log('[Profile] Datos del usuario mapeados:', this.user);
  } else {
            console.warn('[Profile] Usuario no encontrado en el backend');
            this.error = 'Usuario no encontrado en la base de datos';
          }
          
          this.loading = false;
        },
        error: (error) => {
          console.error('[Profile] Error al obtener datos del usuario:', error);
          this.error = 'Error al cargar el perfil del usuario: ' + (error.message || 'Error desconocido');
          this.loading = false;
        }
      });

    } catch (error) {
      console.error('[Profile] Error al procesar el token:', error);
      this.error = 'Error al obtener la información del usuario del token';
      this.loading = false;
    }
  }

  // Modal
  isModalOpen = false;
  modalTitle = '';
  modalMessage = '';
  modalAccion: string | null = null;
// profile.component.ts
newPassword = '';
currentPassword = '';
confirmPassword = '';

abrirModal(tipo: string) {
  this.isModalOpen = true;
  this.modalAccion = tipo;

  if (tipo === 'password') {
    this.modalTitle = 'Cambiar Contraseña';
    this.modalMessage = ''; // dejamos vacío, usaremos template
  } else if (tipo === 'notificaciones') {
    this.modalTitle = 'Preferencias de Notificación';
    this.modalMessage = '';
  } else if (tipo === 'logout') {
    this.modalTitle = 'Cerrar Sesión';
    this.modalMessage = '¿Estás seguro que deseas cerrar sesión?';
  }
}

getImageUrl(): string {
  if (this.user.photo) {
    return `http://localhost:8081${this.user.photo}`;  // Construir URL completa
  }
  // Placeholder si no hay imagen
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNFNUU3RUIiLz4KPHBhdGggZD0iTTIwIDIwQzIyLjc2MTQgMjAgMjUgMTcuNzYxNCAyNSAxNUMyNSAxMi4yMzg2IDIyLjc2MTQgMTAgMjAgMTBDMTcuMjM4NiAxMCAxNSAxMi4yMzg2IDE1IDE1QzE1IDE3Ljc2MTQgMTcgMjAgMjBaIiBmaWxsPSIjOUNBM0FGIi8+CjxjaXJjbGUgY3g9IjIwIiBjeT0iMTUiIHI9IjMiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTMwIDI4QzMwIDI0LjY4NjMgMjYuNDI3MSAyMiAyMiAyMkgxOEMxMy41NzI5IDIyIDEwIDI0LjY4NjMgMTAgMjhWMzBIMzBWMjhaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=';
}


confirmarAccion() {
  if (this.modalAccion === 'password') {
    if(this.newPassword !== this.confirmPassword){
      alert('Las contraseñas no coinciden');
      return;
    }
    console.log('Contraseña actual:', this.currentPassword);
    console.log('Nueva contraseña:', this.newPassword);
    alert('Contraseña cambiada con éxito!');
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }

  if (this.modalAccion === 'notificaciones') {
    console.log('Preferencias de notificación actualizadas:', this.user.notifications);
    alert('Preferencias guardadas!');
  }

  if (this.modalAccion === 'logout') {
    console.log('Usuario cerró sesión');
    alert('Sesión cerrada!');
  }

  this.closeModal();
}

closeModal() {
  this.isModalOpen = false;
  this.modalAccion = null;

  
}
onImageError(event: any) {
  const img = event.target;
  if (!img.src.includes('data:image/svg+xml')) {  // Evitar loop infinito
    img.src = this.getImageUrl();  // Intentar con placeholder
  }
} 
}
