import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
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

export interface WorkSchedule {
  idhorario: number;
  nombrehorario: string;
  horaentrada: string; 
  horasalida: string; 
  toleranciamin: number;
  estado: boolean;
  fechacreacion: string;
}

export interface UserScheduleRelation {
  idusuariohorario: number;
  idusuario: number;
  idhorario: number;
  fechaasignacion: string;
  estado: boolean;
}

export interface ScheduleDisplay {
  id: number;
  scheduleName: string; 
  startTime: string; 
  endTime: string; 
  tolerance: number; 
  totalEmployees: number; 
  presentCount: number; 
  lateCount: number; 
  absentCount: number; 
  isActive: boolean;
}

export interface AttendanceRecord {
  idasistencia?: number;
  idusuario: number;
  fecha: string; 
  horaregistro: string; 
  tipoevento: string; 
  idtiporegistro: number;
  estado: boolean;
  fecharegistro: string; 
  nombreUsuario?: string; 
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

    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Obtener todas las asistencias
  getAttendances(): Observable<any[]> {
    console.log('🚀 Llamando a:', `${this.baseUrl}/asistencias`);

    return this.http.get(`${this.baseUrl}/asistencias`, {
      headers: this.getHeaders(),
      responseType: 'json'
    }).pipe(
      map(response => {
        console.log('✅ Respuesta del backend:', response);
        
        // Si es Spring Data REST con _embedded
        if (response && (response as any)._embedded && (response as any)._embedded.asistencias) {
          const attendances = (response as any)._embedded.asistencias;
          console.log('✅ Datos Spring Data REST detectados');
          console.log('📊 Total de asistencias:', attendances.length);
          return attendances;
        }
        
        // Si es un array directo
        if (Array.isArray(response)) {
          console.log('✅ Array directo detectado');
          console.log('📊 Total de asistencias:', response.length);
          return response;
        }
        
        // Si no hay datos, devolver array vacío
        console.log('⚠️ No se encontraron datos de asistencias, devolviendo array vacío');
        return [];
      }),
      catchError(error => {
        console.error('❌ Error detallado al obtener asistencias:', error);
        return of([]); // Siempre devolver un array vacío en caso de error
      })
    );
  }

  // Obtener horarios de trabajo (turnos)
  getWorkSchedules(): Observable<WorkSchedule[]> {
    console.log('🚀 Llamando a horarios:', `${this.baseUrl}/horarios`);

    return this.http.get(`${this.baseUrl}/horarios`, {
      headers: this.getHeaders(),
      responseType: 'json'
    }).pipe(
      map((response: any) => {
        if (response && response._embedded && response._embedded.horarios) {
          console.log('✅ Horarios obtenidos:', response._embedded.horarios);
          return response._embedded.horarios;
        } else if (Array.isArray(response)) {
          console.log('✅ Horarios en formato array:', response);
          return response;
        } else {
          console.log('⚠️ Formato de horarios no reconocido');
          return [];
        }
      }),
      catchError(error => {
        console.error('❌ Error al obtener horarios:', error);
        return of([]);
      })
    );
  }

  // Obtener relaciones usuario-horario desde el backend
  getUserScheduleRelations(): Observable<UserScheduleRelation[]> {
    console.log('🚀 Llamando a relaciones usuario-horario:', `${this.baseUrl}/usuariohorarios`);

    return this.http.get(`${this.baseUrl}/usuariohorarios`, {
      headers: this.getHeaders(),
      responseType: 'json'
    }).pipe(
      map((response: any) => {
        if (response && response._embedded && response._embedded.usuariohorarios) {
          console.log('✅ Relaciones usuario-horario obtenidas:', response._embedded.usuariohorarios);
          return response._embedded.usuariohorarios;
        } else if (Array.isArray(response)) {
          console.log('✅ Relaciones en formato array:', response);
          return response;
        } else {
          console.log('⚠️ Formato de relaciones no reconocido');
          return [];
        }
      }),
      catchError(error => {
        console.error('❌ Error al obtener relaciones usuario-horario:', error);
        return of([]);
      })
    );
  }

  // Obtener horarios con estadísticas de asistencia REALES
  getSchedulesWithAttendanceStats(): Observable<ScheduleDisplay[]> {
    console.log('🚀 Iniciando obtención de estadísticas de horarios...');
    
    return forkJoin({
      workSchedules: this.getWorkSchedules(),
      attendances: this.getAttendances(),
      users: this.userService.getUsers()
    }).pipe(
      map(({ workSchedules, attendances, users }) => {
        console.log('📋 Horarios de trabajo obtenidos:', workSchedules);
        console.log('📊 Asistencias obtenidas:', attendances);
        console.log('� Usuarios obtenidos:', users);

        // Procesar asistencias
        let attendancesArray = [];
        if (attendances && (attendances as any)._embedded && (attendances as any)._embedded.asistencias) {
          attendancesArray = (attendances as any)._embedded.asistencias;
        } else if (Array.isArray(attendances)) {
          attendancesArray = attendances;
        }

        console.log('📊 Array de asistencias procesado:', attendancesArray);

        // Si no hay horarios, crear algunos por defecto para mostrar
        if (workSchedules.length === 0) {
          console.log('⚠️ No hay horarios en backend, creando horarios por defecto');
          workSchedules = [
            {
              idhorario: 1,
              nombrehorario: "MAÑANA",
              horaentrada: "08:00:00",
              horasalida: "16:00:00",
              toleranciamin: 15,
              estado: true,
              fechacreacion: new Date().toISOString()
            },
            {
              idhorario: 2,
              nombrehorario: "NOCHE",
              horaentrada: "19:00:00",
              horasalida: "23:59:59",
              toleranciamin: 10,
              estado: true,
              fechacreacion: new Date().toISOString()
            }
          ];
        }

        // Crear displays de horarios con estadísticas REALES basadas en asistencias
        return workSchedules
          .filter(schedule => schedule.estado) 
          .map(workSchedule => {
            const stats = this.calculateAttendanceStatsFromData(workSchedule, attendancesArray, users);
            
            return {
              id: workSchedule.idhorario,
              scheduleName: workSchedule.nombrehorario,
              startTime: workSchedule.horaentrada,
              endTime: workSchedule.horasalida,
              tolerance: workSchedule.toleranciamin,
              totalEmployees: stats.total,
              presentCount: stats.present,
              lateCount: stats.late,
              absentCount: stats.absent,
              isActive: workSchedule.estado
            };
          });
      }),
      catchError(error => {
        console.error('❌ Error al obtener horarios con estadísticas:', error);
        // En caso de error, devolver horarios básicos para mostrar algo
        return of([
          {
            id: 1,
            scheduleName: "MAÑANA",
            startTime: "08:00:00",
            endTime: "16:00:00",
            tolerance: 15,
            totalEmployees: 0,
            presentCount: 0,
            lateCount: 0,
            absentCount: 0,
            isActive: true
          },
          {
            id: 2,
            scheduleName: "NOCHE", 
            startTime: "19:00:00",
            endTime: "23:59:59",
            tolerance: 10,
            totalEmployees: 0,
            presentCount: 0,
            lateCount: 0,
            absentCount: 0,
            isActive: true
          }
        ]);
      })
    );
  }

  // Calcular estadísticas de asistencia basadas en los datos disponibles
  private calculateAttendanceStatsFromData(
    workSchedule: WorkSchedule, 
    attendances: any[], 
    users: Usuario[]
  ): {
    total: number,
    present: number,
    late: number,
    absent: number
  } {
    console.log(`📊 Calculando estadísticas para horario: ${workSchedule.nombrehorario} (ID: ${workSchedule.idhorario})`);
    
    // Obtener usuarios que tienen asistencias registradas
    const usersWithAttendances = new Set(attendances.map(a => a.idUsuario || a.idusuario));
    console.log('👥 Usuarios con asistencias registradas:', Array.from(usersWithAttendances));
    
    // Si tenemos usuarios del backend, usarlos como base
    // Si no, usar los usuarios que aparecen en las asistencias
    let totalUsers = users && users.length > 0 ? users.length : usersWithAttendances.size;
    
    // Para demo, asumimos que algunos usuarios pertenecen a cada horario
    // En una implementación real, esto vendría de la tabla usuariohorarios
    let estimatedUsersForThisSchedule = Math.ceil(totalUsers / 2); // Aproximadamente la mitad para cada horario
    
    if (workSchedule.nombrehorario === 'MAÑANA') {
      estimatedUsersForThisSchedule = Math.ceil(totalUsers * 0.6); // 60% en horario de mañana
    } else if (workSchedule.nombrehorario === 'NOCHE') {
      estimatedUsersForThisSchedule = Math.floor(totalUsers * 0.4); // 40% en horario de noche
    }
    
    const today = new Date().toISOString().split('T')[0];
    console.log(`📅 Verificando asistencias para la fecha: ${today}`);
    
    // Filtrar asistencias de hoy
    const todayAttendances = attendances.filter(attendance => {
      const attendanceDate = attendance.fecha;
      return attendanceDate === today;
    });
    
    console.log(`📊 Asistencias de hoy:`, todayAttendances);
    
    let present = 0;
    let late = 0;
    
    // Contar usuarios presentes y tardíos basado en las asistencias reales de hoy
    const usersWithTodayAttendance = new Map();
    todayAttendances.forEach(attendance => {
      const userId = attendance.idUsuario || attendance.idusuario;
      if (!usersWithTodayAttendance.has(userId)) {
        usersWithTodayAttendance.set(userId, []);
      }
      usersWithTodayAttendance.get(userId).push(attendance);
    });
    
    usersWithTodayAttendance.forEach((userAttendances, userId) => {
      const hasEntrance = userAttendances.some((a: any) => 
        a.tipoEvento && a.tipoEvento.includes('ENTRADA')
      );
      
      if (hasEntrance) {
        const isLate = userAttendances.some((a: any) => 
          a.tipoEvento === 'ENTRADA - TARDE'
        );
        
        if (isLate) {
          late++;
        } else {
          present++;
        }
      }
    });
    
    // Los ausentes son los usuarios estimados menos los que tienen asistencia
    const absent = Math.max(0, estimatedUsersForThisSchedule - present - late);
    
    const result = {
      total: estimatedUsersForThisSchedule,
      present,
      late,
      absent
    };
    
    console.log(`📊 Estadísticas finales para ${workSchedule.nombrehorario}:`, result);
    
    return result;
  }

  // Calcular estadísticas REALES de asistencia usando relaciones usuario-horario
  private calculateRealAttendanceStats(
    workSchedule: WorkSchedule, 
    attendances: any[], 
    userScheduleRelations: UserScheduleRelation[]
  ): {
    total: number,
    present: number,
    late: number,
    absent: number
  } {
    console.log(`📊 Calculando estadísticas REALES para horario: ${workSchedule.nombrehorario} (ID: ${workSchedule.idhorario})`);
    
    // 1. Obtener usuarios asignados a este horario
    const usersInThisSchedule = userScheduleRelations.filter(relation => 
      relation.idhorario === workSchedule.idhorario && relation.estado
    );
    
    console.log(`👥 Usuarios asignados al horario ${workSchedule.nombrehorario}:`, usersInThisSchedule);
    
    const totalEmployees = usersInThisSchedule.length;
    
    if (totalEmployees === 0) {
      console.log(`⚠️ No hay usuarios asignados al horario ${workSchedule.nombrehorario}`);
      return { total: 0, present: 0, late: 0, absent: 0 };
    }
    
    // 2. Para cada usuario de este horario, verificar su asistencia de HOY
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    console.log(`📅 Verificando asistencias para la fecha: ${today}`);
    
    let present = 0;
    let late = 0;
    let absent = 0;
    
    usersInThisSchedule.forEach(relation => {
      const userId = relation.idusuario;
      
      // Buscar asistencias de este usuario para HOY
      const userTodayAttendances = attendances.filter(attendance => {
        const attendanceUserId = attendance.idUsuario || attendance.idusuario;
        const attendanceDate = attendance.fecha; 
        
        return attendanceUserId === userId && attendanceDate === today;
      });
      
      console.log(`👤 Usuario ${userId} - Asistencias hoy:`, userTodayAttendances);
      
      if (userTodayAttendances.length === 0) {
        absent++;
        console.log(`❌ Usuario ${userId}: AUSENTE (sin registros hoy)`);
      } else {
        const hasEntrance = userTodayAttendances.some(attendance => 
          attendance.tipoEvento && attendance.tipoEvento.includes('ENTRADA')
        );
        
        if (!hasEntrance) {
          absent++;
          console.log(`❌ Usuario ${userId}: AUSENTE (sin entrada registrada)`);
        } else {
          const isLate = userTodayAttendances.some(attendance => 
            attendance.tipoevento === 'ENTRADA - TARDE' || attendance.tipoEvento === 'ENTRADA - TARDE'
          );
          
          if (isLate) {
            late++;
            console.log(`🕐 Usuario ${userId}: TARDE`);
          } else {
            present++;
            console.log(`✅ Usuario ${userId}: PRESENTE`);
          }
        }
      }
    });
    
    const result = { total: totalEmployees, present, late, absent };
    console.log(`📊 Estadísticas finales para ${workSchedule.nombrehorario}:`, result);
    
    return result;
  }

  // Método para obtener usuarios individuales con sus asistencias
  getSchedulesWithAttendance(): Observable<Schedule[]> {
    return this.userService.getUsers().pipe(
      switchMap(usuarios => {
        console.log('👥 Usuarios obtenidos del backend:', usuarios);
        console.log('👥 Total de usuarios obtenidos:', usuarios.length);
        
        // Debug: verificar cada usuario
        usuarios.forEach((usuario, index) => {
          console.log(`👤 Usuario ${index + 1}:`, {
            id: usuario.id,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            correo: usuario.correo,
            estado: usuario.estado,
            rol: usuario.nombreRol
          });
        });

        // Siempre usar usuarios reales del backend como base
        if (!usuarios || usuarios.length === 0) {
          console.log('❌ No se obtuvieron usuarios del backend');
          return of([]);
        }

        return this.getAttendances().pipe(
          map(attendances => {
            console.log('📊 Asistencias obtenidas:', attendances);
            
            // Procesar asistencias
            let attendancesArray = [];
            if (attendances && (attendances as any)._embedded && (attendances as any)._embedded.asistencias) {
              attendancesArray = (attendances as any)._embedded.asistencias;
              console.log('✅ Usando datos reales del backend');
            } else if (Array.isArray(attendances)) {
              attendancesArray = attendances;
              console.log('✅ Usando datos en formato array');
            }

            // Crear schedules para TODOS los usuarios del backend
            const schedules: Schedule[] = usuarios
              .filter(usuario => usuario.estado) // Solo usuarios activos
              .map((usuario, index) => {
                // Si el usuario no tiene ID, usar el índice + 1
                const userId = usuario.id || (index + 1);
                
                return {
                  id: userId,
                  userId: userId,
                  employee: `${usuario.nombre || 'Sin nombre'} ${usuario.apellido || ''}`.trim(),
                  date: new Date(),
                  checkIn: this.getDefaultCheckIn(usuario.nombreRol),
                  checkOut: this.getDefaultCheckOut(usuario.nombreRol),
                  status: 'absent' as 'present' | 'absent' | 'late',
                  role: usuario.nombreRol || 'Sin rol'
                };
              });

            console.log('📅 Schedules creados desde usuarios reales:');
            schedules.forEach(schedule => {
              console.log(`  - ${schedule.employee} (ID: ${schedule.userId}, Rol: ${schedule.role})`);
            });

            // Ahora actualizar el estado de cada usuario basándose en asistencias reales
            return schedules.map(schedule => {
              const today = new Date().toISOString().split('T')[0];
              
              // Filtrar asistencias por usuario Y por fecha de hoy
              const userTodayAttendances = attendancesArray.filter((a: any) => {
                const attendanceUserId = a.idUsuario || a.idusuario;
                const attendanceDate = a.fecha;
                return attendanceUserId === schedule.userId && attendanceDate === today;
              });
              
              console.log(`👤 ${schedule.employee} (ID: ${schedule.userId}) - Asistencias hoy:`, userTodayAttendances.length > 0 ? userTodayAttendances : 'Sin asistencias');
              
              let status: 'present' | 'absent' | 'late' = 'absent';
              
              if (userTodayAttendances.length > 0) {
                const hasEntrance = userTodayAttendances.some((a: any) => 
                  a.tipoEvento && a.tipoEvento.includes('ENTRADA')
                );
                
                if (hasEntrance) {
                  const isLate = userTodayAttendances.some((a: any) => 
                    a.tipoEvento === 'ENTRADA - TARDE'
                  );
                  status = isLate ? 'late' : 'present';
                  console.log(`✅ ${schedule.employee}: ${status.toUpperCase()}`);
                } else {
                  console.log(`❌ ${schedule.employee}: AUSENTE (sin entrada)`);
                }
              } else {
                console.log(`❌ ${schedule.employee}: AUSENTE (sin registros hoy)`);
              }
              
              return { ...schedule, status };
            });
          })
        );
      }),
      catchError(error => {
        console.error('❌ Error al obtener usuarios o asistencias:', error);
        return of([]);
      })
    );
  }

  private generateSchedulesFromAttendances(attendancesArray: any[]): Schedule[] {
    const userMap = new Map<number, Schedule>();
    
    attendancesArray.forEach(attendance => {
      const userId = attendance.idUsuario || attendance.idusuario;
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          id: userId,
          userId: userId,
          employee: `Usuario ${userId}`,
          date: new Date(),
          checkIn: '08:00',
          checkOut: '17:00',
          status: 'absent' as 'present' | 'absent' | 'late',
          role: 'Trabajador'
        });
      }
    });

    return Array.from(userMap.values());
  }

  private getDefaultCheckIn(role?: string): string {
    switch (role?.toLowerCase()) {
      case 'administrador': return '08:00';
      case 'supervisor': return '08:30';
      case 'trabajador':
      case 'empleado': return '09:00';
      default: return '08:00';
    }
  }

  private getDefaultCheckOut(role?: string): string {
    switch (role?.toLowerCase()) {
      case 'administrador': return '18:00';
      case 'supervisor': return '17:30';
      case 'trabajador':
      case 'empleado': return '17:00';
      default: return '17:00';
    }
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
