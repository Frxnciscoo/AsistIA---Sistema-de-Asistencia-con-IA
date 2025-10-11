import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SchedulesMockService, Schedule } from '../../../core/services/schedules-mock.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { HeaderComponent } from "../../../shared/components/header/header.component";

@Component({
  selector: 'app-schedules',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderComponent], 
  templateUrl: './schedules.component.html',
})
export class SchedulesComponent {
  schedules: Schedule[] = [];

  constructor(private schedulesService: SchedulesMockService) {
    this.schedules = this.schedulesService.getSchedules();
  }

  editarHorario(schedule: Schedule) {
    console.log("Editar horario de:", schedule.employee);
  }

  eliminarHorario(schedule: Schedule) {
    console.log("Eliminar horario de:", schedule.employee);
  }

  exportSchedules() {
  if (!this.schedules.length) return;

  // Encabezados
  const headers = ['Empleado', 'Fecha', 'Entrada', 'Salida'];


  const rows = this.schedules.map(s => [
    `"${s.employee}"`,
    `"${new Date(s.date).toLocaleDateString()}"`,
    `"${s.checkIn}"`,
    `"${s.checkOut}"`
  ].join(';')); 

  const csvContent = [headers.join(';'), ...rows].join('\n');

  const bom = "\uFEFF";

  const blob = new Blob([ bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", "horarios.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}



}
