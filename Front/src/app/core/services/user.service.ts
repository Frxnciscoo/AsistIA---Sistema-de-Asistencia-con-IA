import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface Usuario {
  id?: number;
  nombre: string;
  apellido?: string;
  correo: string;
  dni?: string;
  nombreRol?: string; // Para mostrar en la lista
  estado: boolean;
  fechaCreacion?: string;
  imagen?: string;
}

// DTO para crear usuarios (coincide con UsuarioCreateDto del backend)
export interface UsuarioCreateDto {
  nombre: string;
  apellido: string;
  correo: string;
  dni: string;
  contrasena: string;
  idRol: number;
}

export interface Rol {
  id: number;
  nombreRol: string;
  codigoRol: string;
  descripcion?: string;
  estado?: boolean;
}

// Interfaz compatible con el componente actual
export interface User {
  id: number;
  name: string;
  lastName?: string;
  email: string;
  dni?: string;
  password?: string; // Solo para crear/editar usuarios
  role: string;
  roleId?: number; // ID del rol para el backend
  lastAttendance: Date;
  isActive: boolean;
  // Agregar estas propiedades para manejar imágenes
  imagePreview?: string;  // Para mostrar preview de la imagen seleccionada
  imageFile?: File;       // Para almacenar el archivo de imagen seleccionado
}

// 🔧 INTERFAZ UserResponseDto CORREGIDA (BASADA EN EL BACKEND UserResponseDto.java)
export interface UserResponseDto {
  idUsuario: number;  // Campo del backend
  nombre: string;
  correo: string;
  dni: string;
  estado: boolean;
  fechaCreacion: string;
  nombreRol: string;
  imagen?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8081/Usuarios';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    
    if (token) {
      return new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      });
    }
    
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  // Listar todos los usuarios
  getUsers(): Observable<Usuario[]> {
    const headers = this.getHeaders();
    
    return this.http.get<any[]>(this.apiUrl, { headers }).pipe(
      map((response: any[]) => {
        return response.map(userDto => this.userResponseDtoToUsuario(userDto));
      })
    );
  }

  // Crear usuario
  createUser(usuarioDto: UsuarioCreateDto): Observable<Usuario> {
    const headers = this.getHeaders();
    return this.http.post<Usuario>(this.apiUrl, usuarioDto, { headers });
  }

  // 🔧 ACTUALIZAR USUARIO CORREGIDO: ENVIAR idRol EN LUGAR DE OBJETO rol
  updateUser(id: number, usuario: Usuario): Observable<Usuario> {
    const headers = this.getHeaders();
    
    // 🔧 CAMBIAR: Enviar idRol en lugar de objeto rol
    const userUpdateDto = {
      nombre: usuario.nombre,
      apellido: usuario.apellido || '',
      dni: usuario.dni,
      rol: {  // ← ENVIAR OBJETO Rol COMPLETO
        idRol: this.getRoleIdByName(usuario.nombreRol || 'Empleado'),
        nombreRol: usuario.nombreRol || 'Empleado',
        codigoRol: 'DEFAULT',  // Necesitas agregar estos campos
        descripcion: '',
        estado: true
      }
    };
    
    console.log('[UserService] Actualizando usuario ID:', id);
    console.log('[UserService] URL:', `${this.apiUrl}/${id}`);
    console.log('[UserService] Datos a enviar:', userUpdateDto);
    
    return this.http.put<any>(`${this.apiUrl}/${id}`, userUpdateDto, { headers }).pipe(
      map((response: any) => this.userResponseDtoToUsuario(response)),
      tap(updated => console.log('[UserService] Usuario actualizado:', updated))
    );
  }

  // Eliminar usuario
  deleteUser(id: number): Observable<void> {
    const headers = this.getHeaders();
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
  }

  // Obtener usuario por ID
  getUserById(id: number): Observable<Usuario> {
    const headers = this.getHeaders();
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`, { headers });
  }

  // Métodos de conversión entre interfaces
  usuarioToUser(usuario: Usuario): User {
    console.log('[UserService] Convirtiendo Usuario a User:', {id: usuario.id, nombre: usuario.nombre, apellido: usuario.apellido});
    
    const user: User = {
      id: usuario.id || 0, // Debe tener ID real del backend
      name: usuario.nombre,
      lastName: usuario.apellido || '', // Puede estar vacío si UserResponseDto no lo tiene
      email: usuario.correo,
      dni: usuario.dni || '',
      role: usuario.nombreRol || 'Sin rol',
      lastAttendance: usuario.fechaCreacion ? new Date(usuario.fechaCreacion) : new Date(),
      isActive: usuario.estado
    };
    
    console.log('[UserService] User convertido:', {id: user.id, name: user.name, lastName: user.lastName});
    return user;
  }

  userToUsuario(user: User): Usuario {
    return {
      id: user.id,
      nombre: user.name,
      apellido: user.lastName || '',
      correo: user.email,
      dni: user.dni || '',
      nombreRol: user.role,
      estado: user.isActive,
      fechaCreacion: user.lastAttendance.toISOString()
    };
  }

  // Método para convertir User a UsuarioCreateDto (para crear usuarios)
  userToUsuarioCreateDto(user: User): UsuarioCreateDto {
    const roleId = user.roleId || this.getRoleIdByName(user.role);
    console.log('[UserService] Rol del usuario:', user.role);
    console.log('[UserService] ID del rol calculado:', roleId);
    
    const dto = {
      nombre: user.name,
      apellido: user.lastName || '',
      correo: user.email,
      dni: user.dni || '',
      contrasena: user.password || 'temporal123', // Contraseña temporal
      idRol: roleId
    };
    
    console.log('[UserService] DTO completo a enviar:', dto);
    return dto;
  }

  // 🔧 MÉTODO userResponseDtoToUsuario CORREGIDO: USAR idUsuario DEL BACKEND
  private userResponseDtoToUsuario(responseDto: any): Usuario {
    console.log('[UserService] 🔍 Convirtiendo UserResponseDto:', responseDto);
    console.log('[UserService] 🔍 ID recibido del backend:', responseDto.idUsuario, 'Tipo:', typeof responseDto.idUsuario);
    
    // 🔧 CAMBIAR: Usar idUsuario en lugar de id
    let realId = responseDto.idUsuario;
    
    // Si es string, convertir a number
    if (typeof realId === 'string') {
      realId = parseInt(realId, 10);
    }
    
    // NO usar fallbacks - si no hay ID válido, usar 0 y mostrar error
    if (!realId || realId <= 0) {
      console.error('[UserService] ❌ ID NO VÁLIDO DEL BACKEND:', realId);
      console.error('[UserService] ❌ El backend NO está enviando IDs reales');
      console.error('[UserService] ❌ Verificar UsuarioMapper.toResponseDto()');
      realId = 0; // Mantener como 0 para que falle claramente
    }
    
    const usuario: Usuario = {
      id: realId,
      nombre: responseDto.nombre || '',
      apellido: '', // UserResponseDto no tiene apellido
      correo: responseDto.correo || '',
      dni: responseDto.dni || '',
      nombreRol: responseDto.nombreRol || '',
      estado: responseDto.estado !== undefined ? responseDto.estado : true,
      fechaCreacion: responseDto.fechaCreacion || new Date().toISOString()
    };
    
    console.log('[UserService] ✅ Usuario convertido:', {id: usuario.id, nombre: usuario.nombre, dni: usuario.dni});
    return usuario;
  }

  // Método helper para obtener ID del rol por nombre
  private getRoleIdByName(roleName: string): number {
    // Mapeo CORREGIDO basado en TU base de datos real
    const roleMapping: { [key: string]: number } = {
      'Administrador': 2,  // ← CAMBIADO: De 1 a 2 (ID real en DB)
      'ADMIN': 2,          // ← CAMBIADO: De 1 a 2
      'Admin': 2,          // ← CAMBIADO: De 1 a 2
      'ADMINISTRADOR': 2,  // ← CAMBIADO: De 1 a 2
      'Supervisor': 3,     // ← YA CORRECTO
      'SUPERVISOR': 3,     // ← YA CORRECTO
      'Empleado': 4,       // ← USAR ID=4 (que es "ADMIN" en tu DB, pero puedes mapearlo aquí)
      'EMPLEADO': 4,
      'Employee': 4,
      'User': 4
    };
    
    const roleId = roleMapping[roleName];
    
    if (!roleId) {
      console.warn('[UserService] Rol no encontrado:', roleName, '- Usando Administrador por defecto');
      return 2; // Default: Administrador (ID=2)
    }
    
    return roleId;
  }

  // 🔍 MÉTODO SIMPLE PARA VER QUÉ VIENE DEL BACKEND
  verQueVieneDelBackend() {
    console.log('[UserService] 🔍 VERIFICANDO QUÉ VIENE DEL BACKEND...');
    
    this.http.get(this.apiUrl, { headers: this.getHeaders() }).subscribe(
      (response: any) => {
        console.log('[UserService] 📦 RESPUESTA COMPLETA DEL BACKEND:');
        console.log(response);
        
        if (Array.isArray(response) && response.length > 0) {
          console.log('[UserService] 👤 PRIMER USUARIO RECIBIDO:');
          console.log(response[0]);
          console.log('[UserService] 🔢 ID del primer usuario:', response[0].idUsuario);  // ← CORREGIDO
          console.log('[UserService] 📝 Tipo del ID:', typeof response[0].idUsuario);
        }
      },
      (error) => {
        console.error('[UserService] ❌ Error:', error);
      }
    );
  }

  // 🔧 getUsersForComponent CORREGIDO: MAPEAR idUsuario CORRECTAMENTE
  getUsersForComponent(): Observable<User[]> {
    return this.http.get<UserResponseDto[]>(`${this.apiUrl}`, { headers: this.getHeaders() }).pipe(
      map((userResponseDtos: UserResponseDto[]) => {
        console.log('🔍 [UserService] JSON CRUDO DEL BACKEND:', userResponseDtos);  // ← LOG PARA DIAGNOSTICAR
        return userResponseDtos.map(userResponseDto => {
          // 🔧 MAPEAR UserResponseDto A User (USANDO idUsuario DIRECTAMENTE)
          const user: User = {
            id: userResponseDto.idUsuario || 0,  // ✅ USAR idUsuario DIRECTAMENTE
            name: userResponseDto.nombre,
            lastName: '',  // No hay apellido en UserResponseDto
            email: userResponseDto.correo,
            dni: userResponseDto.dni,
            role: userResponseDto.nombreRol,
            lastAttendance: new Date(userResponseDto.fechaCreacion || Date.now()),
            isActive: userResponseDto.estado
          };
          
          // 🔍 LOG PARA VER SI EL ID LLEGA
          console.log(`[UserService] 👤 Usuario mapeado: ID=${user.id}, Nombre=${user.name}`);
          
          return user;
        });
      })
    );
  }

  // 🔍 MÉTODO DE DEBUGGING OPCIONAL - LLAMAR MANUALMENTE SI QUIERES
  debugBackendManually() {
    console.log('[UserService] 🔍 DEBUGGING MANUAL: Verificando backend...');
    
    this.http.get(this.apiUrl, { headers: this.getHeaders() }).subscribe({
      next: (response) => {
        console.log('[UserService] 🔍 Respuesta del backend:', response);
        
        if (Array.isArray(response) && response.length > 0) {
          console.log('[UserService] 🔍 Primer usuario:', response[0]);
          console.log('[UserService] 🔍 ID del primer usuario:', response[0].idUsuario);  // ← CORREGIDO
        }
      },
      error: (error) => {
        console.error('[UserService] ❌ Error:', error);
      }
    });
  }

  // 🔍 MÉTODO PARA DIAGNOSTICAR IDs DEL BACKEND - CORREGIDO
  checkBackendIdsIssue() {
    console.log('[UserService] 🔍 DIAGNOSTICANDO IDs DEL BACKEND...');
    
    this.http.get(this.apiUrl, { headers: this.getHeaders() }).subscribe(
      (response: any) => {
        console.log('[UserService] 📊 ANÁLISIS DE IDs RECIBIDOS:');
        
        if (!Array.isArray(response)) {
          console.error('[UserService] ❌ Respuesta no es un array:', response);
          return;
        }
        
        console.log('[UserService] 📊 Total usuarios:', response.length);
        
        let validIds = 0;
        let invalidIds = 0;
        
        response.forEach((user, index) => {
          const id = user.idUsuario;  // ← CORREGIDO: Usar idUsuario
          const isValid = id !== null && id !== undefined && !isNaN(id) && id > 0;
          
          if (isValid) {
            validIds++;
            console.log(`[UserService] ✅ Usuario ${index}: ID=${id} (VÁLIDO)`);
          } else {
            invalidIds++;
            console.error(`[UserService] ❌ Usuario ${index}: ID=${id} (INVÁLIDO) - Nombre: ${user.nombre}`);
          }
        });
        
        console.log(`[UserService] 📊 Resumen: ${validIds} válidos, ${invalidIds} inválidos`);
        
        if (invalidIds > 0) {
          console.error('[UserService] ❌ PROBLEMA: El backend no está enviando IDs reales');
          console.error('[UserService] ❌ Revisar: UsuarioMapper.toResponseDto()');
          console.error('[UserService] ❌ La entidad Usuario debe tener @Id y el mapper debe mapearlo');
        } else {
          console.log('[UserService] ✅ Todos los IDs son válidos');
        }
      },
      (error) => {
        console.error('[UserService] ❌ Error al verificar IDs:', error);
      }
    );
  }
}