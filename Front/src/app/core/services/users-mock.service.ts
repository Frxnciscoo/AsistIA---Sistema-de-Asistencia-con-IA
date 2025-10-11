// src/app/core/services/users-mock.service.ts
import { Injectable } from '@angular/core';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  lastAttendance: Date;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class UsersMockService {
  constructor() {}

  getUsers(): User[] {
    return [
      { id: 1, name: 'Juan Pérez', email: 'juan@example.com', role: 'Administrador', lastAttendance: new Date(), isActive: true },
      { id: 2, name: 'María Gómez', email: 'maria@example.com', role: 'Usuario', lastAttendance: new Date(), isActive: true },
      { id: 3, name: 'Carlos Ruiz', email: 'carlos@example.com', role: 'Usuario', lastAttendance: new Date(), isActive: false },
      { id: 4, name: 'Lucía Fernández', email: 'lucia@example.com', role: 'Administrador', lastAttendance: new Date(), isActive: true },
      { id: 5, name: 'Ana Torres', email: 'ana@example.com', role: 'Usuario', lastAttendance: new Date(), isActive: true },
    ];
  }
}
