import { Component } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { HeaderComponent } from "../components/header/header.component";
import { ModalComponent } from "../components/modal/modal.component";
import { FormsModule, NgModel } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderComponent, ModalComponent, CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  user = {
    name: 'Giovanni Ramírez',
    email: 'giovanni.ramirez@empresa.com',
    phone: '+51 987 654 321',
    address: 'Av. Los Ingenieros 123, Lima - Perú',
    dni: '12345678',
    role: 'Administrador',
    department: 'Sistemas',
    startDate: '2023-01-15',
    status: 'Activo',
    photo: 'https://i.pravatar.cc/120',
    notifications: {
    email: true,
    sms: false,
    push: true
  }
  };

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

}
