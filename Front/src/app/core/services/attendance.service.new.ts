import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { UserService, Usuario } from './user.service';

// Interfaces para horarios y asistencias
export interface Schedule {
  id: number;
  userId: number;
  employee: string;
  date: Date;
  checkIn: string;
  checkOut: string;
  status?: 'present' | 'absent' | 'late';
  role?: string;
}

export interface AttendanceRecord {
  idasistencia?: number;
  idusuario: number;
  fecha: string; // YYYY-MM-DD
  horaregistro: string; // HH:mm:ss.SSS
  tipoevento: string; // 'ENTRADA', 'ENTRADA - TARDE', 'ENTRADA - PUNTUAL', 'SALIDA', etc.
  idtiporegistro: number;
  estado: boolean;
  fecharegistro: string; // ISO string completo
  nombreUsuario?: string; // Para mostrar en la UI
}

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private readonly baseUrl = '/api';
  private readonly storageService = { getItem: (key: string) => localStorage.getItem(key) };
  
  constructor(
    private http: HttpClient, 
    private authService: AuthService,
    private userService: UserService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.storageService.getItem('token');
    
    if (!token) {
      console.error('❌ No hay token disponible');
      return new HttpHeaders({ 'Content-Type': 'application/json' });
    }

    console.log('🔐 Token disponible para asistencias:', token ? 'SÍ' : 'NO');
    console.log('🔐 Token preview:', token ? `${token.substring(0, 50)}...` : 'N/A');
    console.log('📋 Headers enviados:', ['Content-Type', 'Authorization']);
    
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Obtener todas las asistencias
  getAttendances(): Observable<any> {
    console.log('🚀 Llamando a:', `${this.baseUrl}/asistencias`);
    console.log('🌐 URL completa debería ser: http://localhost:4200/api/asistencias');
    console.log('🔄 Proxy debe redirigir a: http://localhost:8083/asistencias');

    return this.http.get(`${this.baseUrl}/asistencias`, {
      headers: this.getHeaders(),
      responseType: 'json'
    }).pipe(
      tap(response => {
        console.log('✅ Respuesta del backend:', response);
        console.log('📊 Estructura de datos:', typeof response);
        
        if (response && (response as any)._embedded) {
          console.log('✅ Datos Spring Data REST detectados');
          console.log('📊 Total de asistencias:', (response as any)._embedded.asistencias?.length || 0);
        }
      }),
      catchError(error => {
        console.error('❌ Error detallado al obtener asistencias:', error);
        console.error('📋 Status:', error.status);
        console.error('📋 Message:', error.message);
        console.error('📋 URL:', error.url);
        
        if (error.status === 401) {
          console.error('🔒 Error 401: Token inválido o expirado');
        } else if (error.status === 403) {
          console.error('🔒 Error 403: Sin permisos para acceder');
        } else if (error.status === 0) {
          console.error('🌐 Error de CORS o backend no disponible');
        }
        
        return of([]);
      })
    );
  }

  // Obtener asistencias por usuario
  getAttendancesByUser(userId: number): Observable<AttendanceRecord[]> {
    return this.http.get<AttendanceRecord[]>(`${this.baseUrl}/asistencias/usuario/${userId}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error al obtener asistencias del usuario:', error);
        return of([]);
      })
    );
  }

  // Crear usuarios temporales basados en los datos reales de asistencias
  private createUsersFromAttendances(attendancesArray: any[]): Usuario[] {
    const userMap = new Map<number, Usuario>();
    
    // Extraer usuarios únicos de las asistencias
    attendancesArray.forEach(attendance => {
      const userId = attendance.idUsuario;
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          id: userId,
          nombre: `Usuario ${userId}`,
          apellido: 'Temporal', 
          correo: `usuario${userId}@empresa.com`,
          dni: `DNI${userId}`,
          nombreRol: this.getRoleByUserId(userId),
          estado: true,
          fechaCreacion: new Date().toISOString()
        });
      }
    });

    return Array.from(userMap.values());
  }

  // Asignar roles basados en patrón de ID (temporal hasta sincronizar backends)
  private getRoleByUserId(userId: number): string {
    const roles = ['Trabajador', 'Supervisor', 'Administrador'];
    return roles[userId % 3] || 'Trabajador';
  }

  // Generar horarios desde usuarios reales o temporales
  private generateSchedulesFromAttendances(attendancesArray: any[]): Schedule[] {
    const users = this.createUsersFromAttendances(attendancesArray);
    const today = new Date();
    
    return users.map(usuario => ({
      id: usuario.id || 0,
      userId: usuario.id || 0,
      employee: `${usuario.nombre} ${usuario.apellido || ''}`.trim(),
      date: today,
      checkIn: this.getDefaultCheckIn(usuario.nombreRol),
      checkOut: this.getDefaultCheckOut(usuario.nombreRol),
      status: 'absent' as 'present' | 'absent' | 'late',
      role: usuario.nombreRol
    }));
  }

  // Generar schedules desde usuarios del backend
  private generateSchedulesFromUsers(usuarios: Usuario[]): Schedule[] {
    const today = new Date();
    return usuarios.map(usuario => ({
      id: usuario.id || 0,
      userId: usuario.id || 0,
      employee: `${usuario.nombre} ${usuario.apellido || ''}`.trim(),
      date: today,
      checkIn: this.getDefaultCheckIn(usuario.nombreRol),
      checkOut: this.getDefaultCheckOut(usuario.nombreRol),
      status: 'absent' as 'present' | 'absent' | 'late',
      role: usuario.nombreRol
    }));
  }

  private getDefaultCheckIn(role?: string): string {
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

  private getDefaultCheckOut(role?: string): string {
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

  // Obtener horarios con estado de asistencia del día
  getSchedulesWithAttendance(): Observable<Schedule[]> {
    return this.getAttendances().pipe(
      switchMap(attendances => {
        console.log('Todas las asistencias:', attendances);
        
        // Procesar la respuesta de Spring Data REST
        let attendancesArray = [];
        if (attendances && attendances._embedded && attendances._embedded.asistencias) {
          // Datos reales del backend en formato Spring Data REST
          attendancesArray = attendances._embedded.asistencias;
          console.log('✅ Usando datos reales del backend');
        } else if (Array.isArray(attendances)) {
          // Datos en formato array directo  
          attendancesArray = attendances;
          console.log('✅ Usando datos en formato array');
        } else {
          // Sin datos reales
          console.log('⚠️ No se encontraron datos del backend');
          attendancesArray = [];
        }
        
        console.log('Array de asistencias procesado:', attendancesArray);
        
        // Intentar obtener usuarios del backend, si fallan usar usuarios basados en asistencias
        return this.userService.getUsers().pipe(
          map((usuarios: Usuario[]) => {
            console.log('👥 Usuarios obtenidos del backend:', usuarios);
            
            // Si tenemos usuarios reales, usarlos; sino crear usuarios temporales
            let schedules: Schedule[];
            if (usuarios && usuarios.length > 0) {
              schedules = this.generateSchedulesFromUsers(usuarios);
              console.log('📅 Usando usuarios reales del backend');
            } else {
              schedules = this.generateSchedulesFromAttendances(attendancesArray);
              console.log('📅 Generando usuarios temporales desde asistencias');
            }
            
            console.log('Schedules generados:', schedules);
            
            // Actualizar estado de cada schedule basándose en asistencias reales
            return schedules.map(schedule => {
              // Buscar asistencias para este usuario
              let userAttendances = attendancesArray.filter((a: any) => 
                a.idUsuario === schedule.userId || a.idusuario === schedule.userId
              );
              
              console.log(`Usuario ${schedule.employee} (ID: ${schedule.userId}) - Asistencias encontradas:`, userAttendances);
              
              let status: 'present' | 'absent' | 'late' = 'absent';
              
              if (userAttendances.length > 0) {
                // Verificar si tiene entrada (usando la estructura real del backend)
                const hasEntrance = userAttendances.some((a: any) => 
                  a.tipoEvento && a.tipoEvento.includes('ENTRADA')
                );
                console.log(`Usuario ${schedule.employee} - Tiene entrada:`, hasEntrance);
                
                if (hasEntrance) {
                  // Verificar si llegó tarde basándose en los datos reales
                  const isLate = userAttendances.some((a: any) => 
                    a.tipoEvento === 'ENTRADA - TARDE'
                  );
                  status = isLate ? 'late' : 'present';
                  console.log(`Usuario ${schedule.employee} - Estado calculado:`, status);
                }
              }
              
              return { ...schedule, status };
            });
          }),
          catchError(error => {
            console.error('❌ Error al obtener usuarios, usando usuarios temporales:', error);
            // Si falla la obtención de usuarios, generar desde asistencias
            const schedules = this.generateSchedulesFromAttendances(attendancesArray);
            
            return schedules.map(schedule => {
              let userAttendances = attendancesArray.filter((a: any) => 
                a.idUsuario === schedule.userId || a.idusuario === schedule.userId
              );
              
              let status: 'present' | 'absent' | 'late' = 'absent';
              
              if (userAttendances.length > 0) {
                const hasEntrance = userAttendances.some((a: any) => 
                  a.tipoEvento && a.tipoEvento.includes('ENTRADA')
                );
                
                if (hasEntrance) {
                  const isLate = userAttendances.some((a: any) => 
                    a.tipoEvento === 'ENTRADA - TARDE'
                  );
                  status = isLate ? 'late' : 'present';
                }
              }
              
              return { ...schedule, status };
            });
          })
        );
      }),
      catchError(error => {
        console.error('❌ Error al obtener asistencias:', error);
        return of([]);
      })
    );
  }

  // Marcar asistencia
  markAttendance(userId: number, type: 'ENTRADA' | 'SALIDA'): Observable<AttendanceRecord> {
    const attendanceDto = {
      tipoEvento: type,
      idTipoRegistro: type === 'ENTRADA' ? 1 : 2,
      estado: true
    };

    return this.http.post<AttendanceRecord>(`${this.baseUrl}/asistencias/${userId}`, attendanceDto, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error al marcar asistencia:', error);
        throw error;
      })
    );
  }
}
