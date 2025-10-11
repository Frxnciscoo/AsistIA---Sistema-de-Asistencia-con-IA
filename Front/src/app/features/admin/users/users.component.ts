import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { UsersMockService, User } from '../../../core/services/users-mock.service';
import { HeaderComponent } from "../../../shared/components/header/header.component";

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [SidebarComponent, CommonModule, FormsModule, HeaderComponent],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
})
export class UsersComponent {
  users: User[] = [];

  searchTerm = '';
  roleFilter = '';
  statusFilter = '';
  roles: string[] = [];

  page = 1;
  pageSize = 8;

  selectedUser: User | null = null;
  deleting = false; // bandera para modal de eliminar

  constructor(private mockUsers: UsersMockService) {
    this.refreshData();
  }

  refreshData() {
    this.users = this.mockUsers.getUsers();
    this.roles = Array.from(new Set(this.users.map(u => u.role)));
  }

  // 🔍 Filtrado
  filteredUsers(): User[] {
    return this.users.filter(u => {
      const matchesSearch = (u.name + ' ' + u.email).toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesRole = this.roleFilter ? u.role === this.roleFilter : true;
      const matchesStatus = this.statusFilter
        ? this.statusFilter === 'active'
          ? u.isActive
          : !u.isActive
        : true;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }

  // 📄 Paginación
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

  // ➕ Crear usuario
  onAddUser() {
    this.selectedUser = {
      id: this.users.length + 1,
      name: '',
      email: '',
      role: this.roles[0] ?? 'Usuario',
      lastAttendance: new Date(),
      isActive: true,
    };
    this.deleting = false; // asegúrate de que no abra el modal de eliminar
  }

  saveNewUser() {
    if (this.selectedUser) {
      this.users.push({ ...this.selectedUser });
      this.selectedUser = null; // cierra modal
    }
  }

  // ✏️ Editar usuario
  onEditUser(user: User) {
    this.selectedUser = { ...user };
    this.deleting = false; // evita conflicto con modal eliminar
  }

  saveUser() {
    if (this.selectedUser) {
      const index = this.users.findIndex(u => u.id === this.selectedUser!.id);
      if (index > -1) this.users[index] = this.selectedUser!;
    }
    this.selectedUser = null; // cierra modal
  }

  // 🗑️ Eliminar usuario
  confirmDelete(user: User) {
    this.selectedUser = user;
    this.deleting = true;
  }

  deleteUser() {
    if (this.selectedUser) {
      this.users = this.users.filter(u => u.id !== this.selectedUser!.id);
    }
    this.selectedUser = null;
    this.deleting = false;
  }

  trackById(_i: number, u: User) {
    return u.id;
  }
}
