// src/app/core/services/dashboard-mock.service.ts
import { Injectable } from '@angular/core';

export interface Activity {
  title: string;
  time: string;
  iconClass: string;
  bgClass: string;
}

export interface QuickAction {
  label: string;
  iconClass: string;
  bgClass: string;
  textClass: string;
  action: string;
  url ?: string;
}

@Injectable({ providedIn: 'root' })
export class DashboardMockService {
  constructor() {}

  getStats() {
    return [
      { title: 'Empleados Activos', value: 128 },
      { title: 'Asistencias Hoy', value: 115 },
      { title: 'Tardanzas Hoy', value: 8 },
      { title: 'Faltas', value: 5 },
    ];
  }

  getAttendanceChart() {
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const chart = [];

    // Generamos 30 días de ejemplo con valores entre 70 y 100%
    for (let i = 0; i < 30; i++) {
      chart.push({
        day: days[i % 7],
        value: Math.floor(Math.random() * 31) + 70 // 70-100%
      });
    }

    return chart;
  }

  getRecentActivities(): Activity[] {
    return [
      { title: 'Juan Pérez registró entrada', time: '08:03 AM', iconClass: 'fas fa-sign-in-alt text-blue-600', bgClass: 'bg-blue-100' },
      { title: 'María López registró salida', time: '05:12 PM', iconClass: 'fas fa-sign-out-alt text-blue-600', bgClass: 'bg-blue-100' },
      { title: 'Carlos Gómez tardanza registrada', time: '08:15 AM', iconClass: 'fas fa-clock text-blue-600', bgClass: 'bg-blue-100' },
      { title: 'Ana Torres justificó ausencia', time: '07:45 AM', iconClass: 'fas fa-file-alt text-blue-600', bgClass: 'bg-blue-100' },
      { title: 'Sistema actualizado', time: 'Hace 2 horas', iconClass: 'fas fa-cog text-gray-600', bgClass: 'bg-gray-100' },
    ];
  }

  getQuickActions(): QuickAction[] {
    return [
      { label: 'Registrar Usuario', iconClass: 'fas fa-sign-in-alt text-blue-600', bgClass: 'bg-blue-50 hover:bg-blue-100', textClass: 'text-blue-700', action: 'users', url: 'users' },
      { label: 'Asignar Horario', iconClass: 'fas fa-sign-out-alt text-blue-600', bgClass: 'bg-blue-50 hover:bg-blue-100', textClass: 'text-blue-700', action: 'schedules', url: 'schedules' } ,
      { label: 'Justificar Tardanza', iconClass: 'fas fa-clock text-blue-600', bgClass: 'bg-blue-50 hover:bg-blue-100', textClass: 'text-blue-700', action: 'justify-late' },
      { label: 'Reporte Diario', iconClass: 'fas fa-file-alt text-blue-600', bgClass: 'bg-blue-50 hover:bg-blue-100', textClass: 'text-blue-700', action: 'daily-report' },
      { label: 'Reporte Mensual', iconClass: 'fas fa-calendar-alt text-blue-600', bgClass: 'bg-blue-50 hover:bg-blue-100', textClass: 'text-blue-700', action: 'monthly-report' },
      { label: 'Enviar Notificación', iconClass: 'fas fa-bell text-blue-600', bgClass: 'bg-blue-50 hover:bg-blue-100', textClass: 'text-blue-700', action: 'notify-employees' },
    ];
  }
}
