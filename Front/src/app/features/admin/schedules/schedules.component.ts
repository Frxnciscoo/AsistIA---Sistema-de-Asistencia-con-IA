import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceService, Schedule, AttendanceRecord, ScheduleDisplay, UserScheduleRelation } from '../../../core/services/attendance.service';
import { UserService, Usuario } from '../../../core/services/user.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { HeaderComponent } from "../../../shared/components/header/header.component";

@Component({
  selector: 'app-schedules',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderComponent, FormsModule], 
  templateUrl: './schedules.component.html',
})
export class SchedulesComponent implements OnInit {
  schedules: Schedule[] = [];
  workSchedules: ScheduleDisplay[] = []; // Nueva propiedad para horarios de trabajo
  filteredSchedules: Schedule[] = [];
  filteredWorkSchedules: ScheduleDisplay[] = []; // Para filtrar horarios de trabajo
  usuarios: Usuario[] = [];
  loading = false;
  error: string | null = null;
  searchTerm = '';
  
  // Selector de vista: 'users' para usuarios individuales, 'shifts' para turnos
  viewMode: 'users' | 'shifts' = 'shifts';
  
  // Paginación
  page = 1;
  itemsPerPage = 10;
  
  // Modal de marcado de asistencia
  showAttendanceModal = false;
  selectedEmployeeId: number = 0;
  selectedEmployeeName: string = '';
  attendanceType: 'ENTRADA' | 'SALIDA' = 'ENTRADA';

  constructor(
    private attendanceService: AttendanceService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loadWorkSchedules(); // Cambiar para cargar horarios de trabajo primero
    this.loadSchedules();
    this.loadUsers();
    
    // Debug: probar conectividad con backend
    this.testBackendConnection();
  }

  // Método temporal para probar la conectividad con el backend
  testBackendConnection() {
    console.log('Probando conectividad con backend de asistencias...');
    this.attendanceService.getAttendances().subscribe({
      next: (attendances) => {
        console.log('✅ Backend conectado exitosamente. Asistencias obtenidas:', attendances);
      },
      error: (error) => {
        console.error('❌ Error conectando con backend de asistencias:', error);
      }
    });
  }

  // Cargar horarios de trabajo (turnos) con estadísticas
  loadWorkSchedules() {
    this.loading = true;
    this.error = null;
    
    console.log('🕐 Cargando horarios de trabajo...');
    
    this.attendanceService.getSchedulesWithAttendanceStats().subscribe({
      next: (workSchedules) => {
        this.workSchedules = workSchedules;
        this.filteredWorkSchedules = [...workSchedules];
        this.loading = false;
        console.log('✅ Horarios de trabajo cargados:', workSchedules);
      },
      error: (error) => {
        console.error('❌ Error al cargar horarios de trabajo:', error);
        this.error = 'Error al cargar los horarios de trabajo';
        this.loading = false;
      }
    });
  }

  loadSchedules() {
    this.loading = true;
    this.error = null;
    
    this.attendanceService.getSchedulesWithAttendance().subscribe({
      next: (schedules) => {
        this.schedules = schedules;
        this.filteredSchedules = schedules;
        this.loading = false;
        console.log('Horarios cargados con estados reales:', schedules);
      },
      error: (error) => {
        console.error('Error al cargar horarios:', error);
        this.error = 'Error al cargar los horarios';
        this.loading = false;
        // Fallback: generar horarios desde usuarios
        this.generateSchedulesFromUsers();
      }
    });
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.usuarios = users.filter(u => u.estado); // Solo usuarios activos
        console.log('Usuarios cargados:', users);
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
      }
    });
  }

  generateSchedulesFromUsers() {
    if (this.usuarios.length === 0) {
      // Si no hay usuarios cargados, intentar cargarlos
      this.loadUsers();
      return;
    }

    const today = new Date();
    this.schedules = this.usuarios.map(usuario => ({
      id: usuario.id || 0,
      userId: usuario.id || 0,
      employee: `${usuario.nombre} ${usuario.apellido || ''}`.trim(),
      date: today,
      checkIn: this.getDefaultCheckIn(usuario.nombreRol),
      checkOut: this.getDefaultCheckOut(usuario.nombreRol),
      status: 'absent' as 'present' | 'absent' | 'late',
      role: usuario.nombreRol
    }));
    
    this.filteredSchedules = [...this.schedules];
    this.loading = false;
  }

  getDefaultCheckIn(role?: string): string {
    switch (role?.toLowerCase()) {
      case 'administrador':
        return '08:00';
      case 'supervisor':
        return '08:30';
      case 'trabajador':
      case 'empleado':
        return '09:00';
      default:
        return '08:00';
    }
  }

  getDefaultCheckOut(role?: string): string {
    switch (role?.toLowerCase()) {
      case 'administrador':
        return '18:00';
      case 'supervisor':
        return '17:30';
      case 'trabajador':
      case 'empleado':
        return '17:00';
      default:
        return '17:00';
    }
  }

  filterSchedules() {
    if (this.viewMode === 'shifts') {
      // Filtrar horarios de trabajo
      if (!this.searchTerm.trim()) {
        this.filteredWorkSchedules = [...this.workSchedules];
      } else {
        this.filteredWorkSchedules = this.workSchedules.filter(schedule =>
          schedule.scheduleName.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
      }
    } else {
      // Filtrar usuarios individuales
      if (!this.searchTerm.trim()) {
        this.filteredSchedules = [...this.schedules];
      } else {
        this.filteredSchedules = this.schedules.filter(schedule =>
          schedule.employee.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          schedule.role?.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
      }
    }
    // Resetear la página al filtrar
    this.page = 1;
  }

  // Cambiar modo de vista
  switchViewMode(mode: 'users' | 'shifts') {
    this.viewMode = mode;
    this.searchTerm = '';
    this.page = 1;
    
    if (mode === 'shifts') {
      this.filteredWorkSchedules = [...this.workSchedules];
    } else {
      this.filteredSchedules = [...this.schedules];
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'present':
        return 'Presente';
      case 'late':
        return 'Tarde';
      case 'absent':
        return 'Ausente';
      default:
        return 'N/A';
    }
  }

  // Abrir modal para marcar asistencia
  openAttendanceModal(schedule: Schedule) {
    this.selectedEmployeeId = schedule.userId;
    this.selectedEmployeeName = schedule.employee;
    this.attendanceType = 'ENTRADA';
    this.showAttendanceModal = true;
  }

  // Cerrar modal
  closeAttendanceModal() {
    this.showAttendanceModal = false;
    this.selectedEmployeeId = 0;
    this.selectedEmployeeName = '';
  }

  // Marcar asistencia
  markAttendance() {
    if (this.selectedEmployeeId === 0) return;

    this.attendanceService.markAttendance(this.selectedEmployeeId, this.attendanceType).subscribe({
      next: (attendance) => {
        console.log('Asistencia marcada:', attendance);
        this.closeAttendanceModal();
        this.loadSchedules(); // Recargar para actualizar estado
        
        // Mostrar mensaje de éxito
        alert(`Asistencia de ${this.attendanceType.toLowerCase()} marcada correctamente para ${this.selectedEmployeeName}`);
      },
      error: (error) => {
        console.error('Error al marcar asistencia:', error);
        alert('Error al marcar asistencia. Por favor intente nuevamente.');
      }
    });
  }

  // Ver historial de asistencias
  viewAttendanceHistory(userId: number, employeeName: string) {
    console.log('Ver historial de:', employeeName, 'ID:', userId);
    this.attendanceService.getAttendancesByUser(userId).subscribe({
      next: (attendances) => {
        console.log('Historial de asistencias:', attendances);
        // Aquí podrías abrir un modal o navegar a otra página
        this.showAttendanceHistoryModal(employeeName, attendances);
      },
      error: (error) => {
        console.error('Error al cargar historial:', error);
        alert('Error al cargar historial de asistencias');
      }
    });
  }

  showAttendanceHistoryModal(employeeName: string, attendances: AttendanceRecord[]) {
    if (attendances.length === 0) {
      alert(`${employeeName} no tiene registros de asistencia`);
      return;
    }

    const formatTime = (timeString: string) => {
      return timeString.split('.')[0]; // Quitar los milisegundos para mostrar
    };

    const message = `Historial de ${employeeName}:\n\n${attendances
      .sort((a, b) => new Date(b.fecharegistro).getTime() - new Date(a.fecharegistro).getTime())
      .slice(0, 10) // Mostrar últimos 10 registros
      .map(a => 
        `${a.fecha} ${formatTime(a.horaregistro)} - ${a.tipoevento}`
      ).join('\n')}\n\n${attendances.length > 10 ? '(Mostrando últimos 10 registros)' : ''}`;
    
    alert(message);
  }

  // Editar horario predeterminado
  editSchedule(schedule: Schedule) {
    const newCheckIn = prompt(`Nuevo horario de entrada para ${schedule.employee}:`, schedule.checkIn);
    if (!newCheckIn) return;

    const newCheckOut = prompt(`Nuevo horario de salida para ${schedule.employee}:`, schedule.checkOut);
    if (!newCheckOut) return;

    // Actualizar localmente (en una implementación real, guardarías en backend)
    schedule.checkIn = newCheckIn;
    schedule.checkOut = newCheckOut;
    
    console.log('Horario actualizado:', schedule);
    alert('Horario actualizado correctamente');
  }

  // Refrescar datos
  refresh() {
    this.searchTerm = '';
    this.loadWorkSchedules();
    this.loadSchedules();
  }

  // Cerrar mensaje de error
  closeError() {
    this.error = null;
  }

  exportSchedules() {
    if (!this.schedules.length) {
      alert('No hay horarios para exportar');
      return;
    }

    // Encabezados
    const headers = ['Empleado', 'Rol', 'Fecha', 'Entrada', 'Salida', 'Estado'];

    const rows = this.schedules.map(s => [
      `"${s.employee}"`,
      `"${s.role || 'N/A'}"`,
      `"${new Date(s.date).toLocaleDateString()}"`,
      `"${s.checkIn}"`,
      `"${s.checkOut}"`,
      `"${this.getStatusText(s.status || '')}"`
    ].join(';')); 

    const csvContent = [headers.join(';'), ...rows].join('\n');
    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `horarios_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Métodos auxiliares para el template
  getCurrentDateTime(): string {
    return new Date().toLocaleString();
  }

  getAttendanceTypeText(): string {
    return this.attendanceType.charAt(0) + this.attendanceType.slice(1).toLowerCase();
  }

  // Métodos para estadísticas
  getTotalEmployees(): number {
    if (this.viewMode === 'shifts') {
      return this.workSchedules.reduce((total, schedule) => total + schedule.totalEmployees, 0);
    } else {
      return this.schedules.length;
    }
  }

  getPresentCount(): number {
    if (this.viewMode === 'shifts') {
      return this.workSchedules.reduce((total, schedule) => total + schedule.presentCount, 0);
    } else {
      return this.schedules.filter(s => s.status === 'present').length;
    }
  }

  getLateCount(): number {
    if (this.viewMode === 'shifts') {
      return this.workSchedules.reduce((total, schedule) => total + schedule.lateCount, 0);
    } else {
      return this.schedules.filter(s => s.status === 'late').length;
    }
  }

  getAbsentCount(): number {
    if (this.viewMode === 'shifts') {
      return this.workSchedules.reduce((total, schedule) => total + schedule.absentCount, 0);
    } else {
      return this.schedules.filter(s => s.status === 'absent').length;
    }
  }

  // Métodos de paginación
  totalPages(): number {
    const items = this.viewMode === 'shifts' ? this.filteredWorkSchedules : this.filteredSchedules;
    return Math.ceil(items.length / this.itemsPerPage);
  }

  goToPage(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages()) {
      this.page = newPage;
    }
  }

  pagedSchedules(): Schedule[] {
    const start = (this.page - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredSchedules.slice(start, end);
  }

  pagedWorkSchedules(): ScheduleDisplay[] {
    const start = (this.page - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredWorkSchedules.slice(start, end);
  }
}
