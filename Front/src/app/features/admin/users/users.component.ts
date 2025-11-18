import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { UserService, User } from '../../../core/services/user.service';
import { HttpClient } from '@angular/common/http';  // Agregar para subir imagen

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [SidebarComponent, CommonModule, FormsModule, HeaderComponent],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
})
export class UsersComponent implements OnInit {
  users: User[] = [];

  searchTerm = '';
  roleFilter = '';
  statusFilter = '';
  roles: string[] = [];

  page = 1;
  pageSize = 8;

  selectedUser: User | null = null;
  deleting = false;
  loading = false;
  error: string | null = null;
  isEditing = false;
  
  // Para cambio de contraseña
  showChangePassword = false;
  newPassword = '';
  defaultActiveFilter = true;

  constructor(private userService: UserService, private http: HttpClient) {}  // Inyectar HttpClient

  ngOnInit() {
    this.refreshData();
  }

  refreshData() {
    this.loading = true;
    this.error = null;
    
    this.roles = ['Administrador', 'Empleado', 'Supervisor'];
    
    this.userService.getUsersForComponent().subscribe({
      next: (users) => {
        this.users = users;
        const userRoles = Array.from(new Set(this.users.map(u => u.role)));
        this.roles = Array.from(new Set([...this.roles, ...userRoles]));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.error = 'Error al cargar usuarios';
        this.loading = false;
      }
    });
  }

  filteredUsers(): User[] {
    return this.users.filter(u => {
      const matchesSearch = (u.name + ' ' + u.email).toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesRole = this.roleFilter ? u.role === this.roleFilter : true;
      // Modificar filtro de estado para incluir por defecto activos
      const matchesStatus = this.statusFilter 
        ? (this.statusFilter === 'active' ? u.isActive : !u.isActive) 
        : (this.defaultActiveFilter ? u.isActive : true);  // ← CAMBIADO: Por defecto, solo activos
      return matchesSearch && matchesRole && matchesStatus;
    });
  }

  totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredUsers().length / this.pageSize));
  }

  pagedUsers(): User[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredUsers().slice(start, start + this.pageSize);
  }

  goToPage(p: number) {
    this.page = Math.min(Math.max(1, p), this.totalPages());
  }

  onAddUser() {
    this.selectedUser = {
      id: -1,
      name: '',
      lastName: '',
      email: '',
      dni: '',
      password: '',
      role: this.roles[0] ?? 'Empleado',
      lastAttendance: new Date(),
      isActive: true,
    };
    this.isEditing = false;
    this.deleting = false;
    this.showChangePassword = false;
    this.newPassword = '';
    this.error = null;
  }

  handleSave() {
    if (this.isEditing) {
      this.saveUser();
    } else {
      this.saveNewUser();
    }
  }

  saveNewUser() {
    if (this.selectedUser) {
      if (!this.selectedUser.name || !this.selectedUser.name.trim()) {
        this.error = 'El nombre es obligatorio';
        return;
      }
      if (!this.selectedUser.lastName || !this.selectedUser.lastName.trim()) {
        this.error = 'El apellido es obligatorio';
        return;
      }
      if (!this.selectedUser.email || !this.selectedUser.email.trim()) {
        this.error = 'El correo es obligatorio';
        return;
      }
      if (!this.selectedUser.dni || !this.selectedUser.dni.trim()) {
        this.error = 'El DNI es obligatorio';
        return;
      }
      const dniPattern = /^\d{8,10}$/;
      if (!dniPattern.test(this.selectedUser.dni.trim())) {
        this.error = 'El DNI debe tener entre 8 y 10 dígitos';
        return;
      }
      if (!this.selectedUser.password || this.selectedUser.password.length < 8) {
        this.error = 'La contraseña debe tener al menos 8 caracteres';
        return;
      }
      if (!this.selectedUser.role) {
        this.error = 'El rol es obligatorio';
        return;
      }
      const emailExists = this.users.some(user => 
        user.email.toLowerCase() === this.selectedUser!.email.toLowerCase()
      );
      if (emailExists) {
        this.error = 'Ya existe un usuario con este correo electrónico';
        return;
      }
      const dniToCheck = this.selectedUser.dni.trim();
      const dniExists = this.users.some(user => 
        user.dni && user.dni === dniToCheck
      );
      if (dniExists) {
        this.error = 'Ya existe un usuario con este DNI';
        return;
      }
      
      this.loading = true;
      this.error = null;
      
      const usuarioDto = this.userService.userToUsuarioCreateDto(this.selectedUser);
      
      this.userService.createUser(usuarioDto).subscribe({
        next: (usuarioCreado) => {
          const userCreado = this.userService.usuarioToUser(usuarioCreado);
          this.users.push(userCreado);
          
          // Subir imagen si hay una seleccionada
          if (this.selectedUser!.imageFile) {
            this.uploadUserImage(userCreado.id);
          } else {
            this.selectedUser = null;
            this.loading = false;
          }
        },
        error: (error) => {
          console.error('Error al crear usuario:', error);
          this.error = 'Error al crear usuario';
          this.loading = false;
        }
      });
    }
  }

  onEditUser(user: User) {
    this.selectedUser = { ...user };
    this.isEditing = true;
    this.deleting = false;
    this.showChangePassword = false;
    this.newPassword = '';
    this.error = null;
  }

  saveUser() {
    if (!this.selectedUser) {
      console.error('No hay usuario seleccionado');
      return;
    }
    
    if (!this.selectedUser.id || this.selectedUser.id <= 0) {
      console.error('Usuario sin ID válido para editar:', this.selectedUser);
      this.error = 'El usuario no tiene un ID válido para editar.';
      return;
    }
    
    if (!this.selectedUser.name || !this.selectedUser.name.trim()) {
      this.error = 'El nombre es obligatorio';
      return;
    }
    
    if (!this.selectedUser.lastName || !this.selectedUser.lastName.trim()) {
      this.error = 'El apellido es obligatorio';
      return;
    }
    
    if (this.showChangePassword && (!this.newPassword || this.newPassword.length < 8)) {
      this.error = 'La nueva contraseña debe tener al menos 8 caracteres';
      return;
    }
    
    const emailExists = this.users.some(user => {
      const isSameEmail = user.email.toLowerCase() === this.selectedUser!.email.toLowerCase();
      const isDifferentUser = user.id !== this.selectedUser!.id;
      return isSameEmail && isDifferentUser;
    });
    
    if (emailExists) {
      this.error = 'Ya existe otro usuario con este correo electrónico. Por favor, usa otro correo.';
      return;
    }
    
    this.loading = true;
    this.error = null;
    
    if (this.showChangePassword && this.newPassword) {
      this.selectedUser.password = this.newPassword;
    }
    
    const usuario = this.userService.userToUsuario(this.selectedUser);
    
    this.userService.updateUser(this.selectedUser.id, usuario).subscribe({
      next: (usuarioActualizado) => {
        const userActualizado = this.userService.usuarioToUser(usuarioActualizado);
        const index = this.users.findIndex(u => u.id === this.selectedUser!.id);
        if (index > -1) {
          this.users[index] = userActualizado;
        }
        
        // Subir imagen si hay una seleccionada
        if (this.selectedUser!.imageFile) {
          this.uploadUserImage(userActualizado.id);
        } else {
          this.selectedUser = null;
          this.isEditing = false;
          this.showChangePassword = false;
          this.newPassword = '';
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error al actualizar usuario:', error);
        this.error = 'Error al actualizar el usuario';
        this.loading = false;
      }
    });
  }

  confirmDelete(user: User) {
    this.selectedUser = user;
    this.deleting = true;
  }

  deleteUser() {
    if (!this.selectedUser) {
      console.error('No hay usuario seleccionado');
      return;
    }
    
    if (!this.selectedUser.id || this.selectedUser.id <= 0) {
      console.error('Usuario sin ID válido:', this.selectedUser);
      this.error = 'El usuario no tiene un ID válido para eliminar.';
      this.deleting = false;
      return;
    }
    
    this.loading = true;
    
    this.userService.deleteUser(this.selectedUser.id).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== this.selectedUser!.id);
        this.selectedUser = null;
        this.deleting = false;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al eliminar usuario:', error);
        this.error = 'Error al eliminar usuario';
        this.loading = false;
      }
    });
  }

  // Método para manejar selección de imagen
  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo y tamaño
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {  // 5MB
        alert('La imagen es demasiado grande. Máximo 5MB.');
        return;
      }

      // Crear preview
      this.selectedUser!.imagePreview = URL.createObjectURL(file);
      this.selectedUser!.imageFile = file;  // Guardar archivo para subir
    }
  }

  // Método para subir imagen
  private uploadUserImage(userId: number) {
    const formData = new FormData();
    formData.append('imagen', this.selectedUser!.imageFile!);

    this.http.post(`http://localhost:8081/Usuarios/${userId}/imagen`, formData).subscribe({
      next: () => {
        console.log('Imagen subida exitosamente');
        this.selectedUser = null;
        this.isEditing = false;
        this.showChangePassword = false;
        this.newPassword = '';
        this.loading = false;
        alert('Usuario e imagen guardados exitosamente.');
      },
      error: (error) => {
        console.error('Error al subir imagen:', error);
        this.selectedUser = null;
        this.isEditing = false;
        this.showChangePassword = false;
        this.newPassword = '';
        this.loading = false;
        alert('Usuario guardado, pero error al subir imagen. Intenta nuevamente.');
      }
    });
  }

  // Método para obtener URL de imagen de usuario
  getImageUrl(id: number): string {
    return `http://localhost:8081/Usuarios/${id}/imagen`;
  }

  // Método para manejar error en imagen (evitar loop infinito)
  onImageError(event: any) {
    const img = event.target;
    // Evitar loop cambiando solo si no es ya el placeholder
    if (!img.src.includes('default-avatar')) {
      // Usar un placeholder base64 para evitar más errores
      img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNFNUU3RUIiLz4KPHBhdGggZD0iTTIwIDIwQzIyLjc2MTQgMjAgMjUgMTcuNzYxNCAyNSAxNUMyNSAxMi4yMzg2IDIyLjc2MTQgMTAgMjAgMTBDMTcuMjM4NiAxMCAxNSAxMi4yMzg2IDE1IDE1QzE1IDE3Ljc2MTQgMTcgMjAgMjBaIiBmaWxsPSIjOUNBM0FGIi8+CjxjaXJjbGUgY3g9IjIwIiBjeT0iMTUiIHI9IjMiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTMwIDI4QzMwIDI0LjY4NjMgMjYuNDI3MSAyMiAyMiAyMkgxOEMxMy41NzI5IDIyIDEwIDI0LjY4NjMgMTAgMjhWMzBIMzBWMjhaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=';
      img.alt = 'Sin imagen';
    }
  }

  trackById(_i: number, u: User) {
    return u.id;
  }
}