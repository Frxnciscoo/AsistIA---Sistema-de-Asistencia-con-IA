import { Injectable } from '@angular/core';

export interface Schedule {
  id: number;
  userId: number;
  employee: string;   // 👈 nuevo
  date: Date;
  checkIn: string;
  checkOut: string;
}

@Injectable({ providedIn: 'root' })
export class SchedulesMockService {
  constructor() {}

  getSchedules(): Schedule[] {
    return [
      { id: 1, userId: 1, employee: 'Juan Pérez', date: new Date(2025, 7, 25), checkIn: '08:00', checkOut: '17:00' },
      { id: 2, userId: 2, employee: 'María López', date: new Date(2025, 7, 25), checkIn: '09:00', checkOut: '18:00' },
      { id: 3, userId: 3, employee: 'Carlos Díaz', date: new Date(2025, 7, 25), checkIn: '08:30', checkOut: '17:30' },
      { id: 4, userId: 1, employee: 'Juan Pérez', date: new Date(2025, 7, 26), checkIn: '08:00', checkOut: '17:00' },
    ];
  }
}
