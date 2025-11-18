// sidebar.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ModalComponent } from "../modal/modal.component";

interface MenuItem {
  label: string;
  icon: string;
  link: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, ModalComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  isOpen = true; 
  isMobileMenuOpen = false; 
  role: string | null = null; 
  menus: MenuItem[] = [];

  isModalOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.role = this.authService.getUserRole();
  }

  ngOnInit(): void {
  this.role = this.authService.getUserRole();
  console.log('[Sidebar] Rol recibido del AuthService:', this.role);

  this.setMenus();
}

setMenus() {
  const normalizedRole = this.role?.toUpperCase();

  if (normalizedRole === 'ADMINISTRADOR' || normalizedRole === 'ADMIN') {
    this.menus = [
      { label: 'Dashboard', icon: 'dashboard', link: '/admin/dashboard' },
      { label: 'Usuarios', icon: 'people', link: '/admin/users' },
      { label: 'Horarios', icon: 'schedule', link: '/admin/schedules' },
      { label: 'Registrar Usuario', icon: 'face', link: '/admin/register-face' },
      { label: 'Reportes', icon: 'report', link: '/admin/reports' },
      { label: 'Perfil', icon: 'person', link: '/admin/profile' },
    ];
  } else if (normalizedRole === 'TRABAJADOR' || normalizedRole === 'USER') {
    this.menus = [
      { label: 'Historial', icon: 'history', link: '/worker/history' },
      { label: 'Perfil', icon: 'person', link: '/worker/profile' },
    ];
  }

  console.log('[Sidebar] Menús cargados:', this.menus);
}


  toggleSidebar() {
    this.isOpen = !this.isOpen;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  modalLogout() {
    this.isModalOpen = true;
  }

  // ✅ Cerrar modal
  closeModal() {
    this.isModalOpen = false;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
