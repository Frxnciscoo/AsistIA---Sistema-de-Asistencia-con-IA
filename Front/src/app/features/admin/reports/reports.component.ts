import { ReportsMockService, Report } from './../../../core/services/reports-mock.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from "../../../shared/components/sidebar/sidebar.component";
import { HeaderComponent } from "../../../shared/components/header/header.component";

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderComponent],
  templateUrl: './reports.component.html',
})
export class ReportsComponent implements OnInit {
  reports: Report[] = [];
  selectedReport: Report | null = null;

  constructor(private reportsService: ReportsMockService) {}

  ngOnInit(): void {
    this.reports = this.reportsService.getReports();
  }

  openDetails(report: Report) {
    this.selectedReport = report;
  }

  closeDetails() {
    this.selectedReport = null;
  }

  exportReports() {
  if (!this.reports.length) return;

  // Encabezados
  const headers = ['Empleado', 'Días Trabajados', 'Horas totales', 'Faltas'];

  // Filas CSV usando ; como separador
  const rows = this.reports.map(r => [
    `"${r.userName}"`,
    `"${r.totalDays}"`,
    `"${r.totalHours}"`,
    `"${r.absences}"`
  ].join(';')); 

  const csvContent = [headers.join(';'), ...rows].join('\n');

  const bom = "\uFEFF";

  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", "reportes.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
}
