import { Injectable } from '@angular/core';

export interface Report {
  id: number;
  userName: string;
  totalDays: number;
  totalHours: number;
  absences: number;
}

@Injectable({ providedIn: 'root' })
export class ReportsMockService {
  constructor() {}

  getReports(): Report[] {
    return [
      { id: 1, userName: 'Juan Pérez', totalDays: 20, totalHours: 160, absences: 2 },
      { id: 2, userName: 'María García', totalDays: 22, totalHours: 176, absences: 0 },
      { id: 3, userName: 'Carlos Sánchez', totalDays: 18, totalHours: 144, absences: 4 },
    ];
  }
}
