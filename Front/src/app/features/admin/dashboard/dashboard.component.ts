import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { DashboardMockService, Activity, QuickAction } from '../../../core/services/dashboard-mock.service';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderComponent, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  stats = this.mockService.getStats();
  recentActivities: Activity[] = this.mockService.getRecentActivities();
  quickActions: QuickAction[] = this.mockService.getQuickActions();
  attendanceChart: any[] = [];
  selectedRange: '7D' | '15D' = '7D';

  private readonly maxValues = [150, 100, 20, 10];
  private readonly trends = ['+12%', '+8%', '+15%', '-5%'];

  role: string;

  constructor(
    private mockService: DashboardMockService,
    private authService: AuthService
  ) {
    // Asignar un valor por defecto si getUserRole() retorna null
    this.role = this.authService.getUserRole() ?? 'defaultRole';
    this.refreshChart();
  }

  /** Refresca los datos del gráfico según el rango seleccionado */
  refreshChart() {
    const baseChart = this.mockService.getAttendanceChart().map(item => ({
      ...item,
      value: Math.max(item.value, 10) // mínimo visible
    }));

    this.attendanceChart = this.selectedRange === '7D'
      ? baseChart.slice(0, 7)
      : Array.from({ length: 15 }, (_, i) => baseChart[i % baseChart.length]);
  }

  /** Cambia el rango (7D o 15D) y refresca el gráfico */
  setRange(range: '7D' | '15D') {
    if (this.selectedRange !== range) {
      this.selectedRange = range;
      this.refreshChart();
    }
  }

  /** Calcula el porcentaje de progreso de cada métrica */
  getProgressWidth(value: number, index: number): string {
    const maxValue = this.maxValues[index] ?? 100;
    return `${Math.min((value / maxValue) * 100, 100)}%`;
  }

  /** Devuelve el porcentaje de tendencia */
  getTrendPercentage(index: number): string {
    return this.trends[index] ?? '0%';
  }

  /** Acción rápida ejecutada */
  onQuickAction(actionId: string) {
    console.log('Acción ejecutada:', actionId);
  }
}
