import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { UserService, User } from '../../../core/services/user.service';
import { AttendanceService } from '../../../core/services/attendance.service';
import { forkJoin } from 'rxjs';

export interface UserReport {
  userId: number;
  userName: string;
  userDni: string;
  totalDays: number;
  totalHours: number;
  absences: number;
  attendancePercentage: number;
  details: {
    presentDays: number;
    lateDays: number;
    absentDays: number;
    averageHoursPerDay: number;
  };
}

export interface ReportFilters {
  startDate: string;
  endDate: string;
  userId?: number;
  department?: string;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  reports: UserReport[] = [];
  selectedReport: UserReport | null = null;
  users: User[] = [];
  
  // Filtros
  filters: ReportFilters = {
    startDate: this.getFirstDayOfMonth(),
    endDate: this.getTodayString()
  };
  
  // Estados
  loading = false;
  error: string | null = null;
  
  // Paginación
  page = 1;
  pageSize = 10;
  totalPages = 0;

  // 📊 Propiedades calculadas para el template
  get averageAttendance(): number {
    if (this.reports.length === 0) return 0;
    const sum = this.reports.reduce((acc, r) => acc + r.attendancePercentage, 0);
    return Math.round(sum / this.reports.length);
  }

  get totalHours(): number {
    return this.reports.reduce((sum, r) => sum + r.totalHours, 0);
  }

  get totalAbsences(): number {
    return this.reports.reduce((sum, r) => sum + r.absences, 0);
  }

  get activeEmployeesCount(): number {
    return this.reports.reduce((acc, r) => acc + (r.attendancePercentage > 80 ? 1 : 0), 0);
  }

  // 📖 Paginación
  get pagedReports(): UserReport[] {
    const start = (this.page - 1) * this.pageSize;
    return this.reports.slice(start, start + this.pageSize);
  }

  get pages(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  // 🧮 Utilidades para template
  Math = Math;

  constructor(
    private userService: UserService,
    private attendanceService: AttendanceService
  ) {}

  ngOnInit() {
    this.loadUsers();
    this.loadReports();
  }

  // 📅 Métodos de fechas
  private getFirstDayOfMonth(): string {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    return firstDay.toISOString().split('T')[0];
  }

  private getTodayString(): string {
    return new Date().toISOString().split('T')[0];
  }

  // 👥 Cargar usuarios
  loadUsers() {
    this.userService.getUsersForComponent().subscribe({
      next: (users) => {
        this.users = users.filter(u => u.isActive);
        console.log('[Reports] 👥 Usuarios cargados:', this.users.length);
      },
      error: (error) => {
        console.error('[Reports] ❌ Error cargando usuarios:', error);
        this.error = 'Error al cargar la lista de usuarios';
      }
    });
  }

  // 📊 Cargar reportes
  loadReports() {
    this.loading = true;
    this.error = null;
    
    console.log('[Reports] 📊 Generando reportes del', this.filters.startDate, 'al', this.filters.endDate);
    
    // Obtener usuarios y asistencias en paralelo
    forkJoin({
      users: this.userService.getUsersForComponent(),
      attendances: this.attendanceService.getAttendances()
    }).subscribe({
      next: ({ users, attendances }) => {
        // Validar que attendances sea un array
        const validAttendances = Array.isArray(attendances) ? attendances : [];
        const validUsers = Array.isArray(users) ? users : [];
        
        console.log('[Reports] 📋 Datos obtenidos - Usuarios:', validUsers.length, 'Asistencias:', validAttendances.length);
        
        // Generar reportes para cada usuario
        this.reports = validUsers
          .filter(user => user.isActive)
          .map(user => this.generateUserReport(user, validAttendances))
          .sort((a, b) => b.totalDays - a.totalDays); // Ordenar por días trabajados
        
        this.updatePagination();
        this.loading = false;
        
        console.log('[Reports] ✅ Reportes generados:', this.reports.length);
      },
      error: (error) => {
        console.error('[Reports] ❌ Error generando reportes:', error);
        this.error = 'Error al generar los reportes. Intenta de nuevo.';
        this.loading = false;
      }
    });
  }

  // 📈 Generar reporte individual
  private generateUserReport(user: User, allAttendances: any[]): UserReport {
    const userAttendances = allAttendances.filter(att => {
      const userId = att.user?.id || att.userId || att.idusuario;
      const attDate = new Date(att.date || att.fecha || att.fechaasistencia);
      const startDate = new Date(this.filters.startDate);
      const endDate = new Date(this.filters.endDate);
      
      return userId === user.id && attDate >= startDate && attDate <= endDate;
    });

    // Calcular estadísticas
    const presentAttendances = userAttendances.filter(att => 
      att.status === 'Presente' || att.estado === 'Presente' || 
      att.statusAsistencia === 'Presente'
    );
    
    const lateAttendances = userAttendances.filter(att => 
      att.status === 'Tarde' || att.estado === 'Tarde' ||
      att.statusAsistencia === 'Tarde'
    );
    
    // Calcular días únicos trabajados
    const workedDates = new Set(
      [...presentAttendances, ...lateAttendances]
        .map(att => (att.date || att.fecha || att.fechaasistencia).split('T')[0])
    );
    
    // Calcular horas totales
    const totalHours = this.calculateTotalHours(presentAttendances, lateAttendances);
    
    // Calcular días laborales (asumiendo lunes a viernes)
    const startDate = new Date(this.filters.startDate);
    const endDate = new Date(this.filters.endDate);
    const workingDays = this.calculateWorkingDays(startDate, endDate);
    
    const totalDays = workedDates.size;
    const absences = Math.max(0, workingDays - totalDays);
    
    return {
      userId: user.id || 0,
      userName: `${user.name} ${user.lastName}`.trim(),
      userDni: user.dni || '',
      totalDays,
      totalHours,
      absences,
      attendancePercentage: workingDays > 0 ? Math.round((totalDays / workingDays) * 100) : 0,
      details: {
        presentDays: presentAttendances.length,
        lateDays: lateAttendances.length,
        absentDays: absences,
        averageHoursPerDay: totalDays > 0 ? Math.round((totalHours / totalDays) * 100) / 100 : 0
      }
    };
  }

  // ⏰ Calcular horas totales trabajadas
  private calculateTotalHours(presentAttendances: any[], lateAttendances: any[]): number {
    const allWorkAttendances = [...presentAttendances, ...lateAttendances];
    
    let totalMinutes = 0;
    
    allWorkAttendances.forEach(att => {
      const entryTime = att.entryTime || att.horaEntrada || att.horaentrada;
      const exitTime = att.exitTime || att.horaSalida || att.horasalida;
      
      if (entryTime && exitTime) {
        const entry = this.parseTime(entryTime);
        const exit = this.parseTime(exitTime);
        
        if (entry && exit) {
          let diffMinutes = (exit.getTime() - entry.getTime()) / (1000 * 60);
          
          // Si la hora de salida es menor que la de entrada, asumimos que cruza medianoche
          if (diffMinutes < 0) {
            diffMinutes += 24 * 60; // Agregar 24 horas
          }
          
          totalMinutes += Math.max(0, diffMinutes);
        }
      } else {
        // Si no hay horas específicas, asumir 8 horas por día trabajado
        totalMinutes += 8 * 60;
      }
    });
    
    return Math.round((totalMinutes / 60) * 100) / 100; // Redondear a 2 decimales
  }

  // 🕒 Parsear tiempo en formato HH:mm:ss o HH:mm
  private parseTime(timeStr: string): Date | null {
    try {
      const today = new Date();
      const [hours, minutes, seconds] = timeStr.split(':').map(Number);
      
      if (isNaN(hours) || isNaN(minutes)) return null;
      
      const time = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 
                           hours, minutes, seconds || 0);
      return time;
    } catch {
      return null;
    }
  }

  // 📅 Calcular días laborales (lunes a viernes)
  private calculateWorkingDays(startDate: Date, endDate: Date): number {
    let workingDays = 0;
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      // 1 = lunes, 5 = viernes (excluir sábado=6 y domingo=0)
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        workingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return workingDays;
  }

  // 🔍 Métodos de filtros y búsqueda
  applyFilters() {
    console.log('[Reports] 🔍 Aplicando filtros:', this.filters);
    this.loadReports();
  }

  resetFilters() {
    this.filters = {
      startDate: this.getFirstDayOfMonth(),
      endDate: this.getTodayString()
    };
    this.loadReports();
  }

  // 📄 Métodos de modal
  openDetails(report: UserReport) {
    console.log('[Reports] 👁️ Abriendo detalles de:', report.userName);
    this.selectedReport = report;
  }

  closeDetails() {
    this.selectedReport = null;
  }

  // 📊 Método de exportación
  exportReports() {
    console.log('[Reports] 📤 Exportando reportes...');
    
    // Crear contenido CSV
    const csvContent = this.generateCSVContent();
    
    // Crear y descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte-asistencias-${this.filters.startDate}-${this.filters.endDate}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('[Reports] ✅ Reporte exportado');
  }

  private generateCSVContent(): string {
    const headers = ['Empleado', 'DNI', 'Días Trabajados', 'Horas Totales', 'Faltas', '% Asistencia'];
    const csvRows = [headers.join(',')];
    
    this.reports.forEach(report => {
      const row = [
        `"${report.userName}"`,
        report.userDni,
        report.totalDays,
        report.totalHours,
        report.absences,
        `${report.attendancePercentage}%`
      ];
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  }

  // 📖 Métodos de paginación
  updatePagination() {
    this.totalPages = Math.ceil(this.reports.length / this.pageSize);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.page = page;
    }
  }

  // 🎨 Métodos de estilo para el template
  getAttendanceClass(percentage: number): string {
    if (percentage >= 90) return 'text-green-600 font-bold';
    if (percentage >= 80) return 'text-yellow-600 font-semibold';
    if (percentage >= 70) return 'text-orange-600';
    return 'text-red-600 font-bold';
  }

  // 🔗 TrackBy para optimización de rendimiento
  trackByUserId(index: number, report: UserReport): number {
    return report.userId;
  }
}
