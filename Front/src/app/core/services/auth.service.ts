import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:9999/Auth-Service/auth/token'; 

  constructor(private http: HttpClient) {}

  login(correo: string, contrasena: string): Observable<boolean> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const body = {
      grantType: 'password',
      correo,
      contrasena
    };

    console.log('[AuthService] Antes de hacer POST:', body);

    return this.http.post<any>(this.apiUrl, body, { headers }).pipe(
  tap(response => {
    console.log('[AuthService] Tipo de respuesta:', response);

    const accessToken = response?.accessToken || response?.token || response?.access_token;
    const refreshToken = response?.refreshToken || response?.refresh_token;

    if (accessToken) this.saveToken(accessToken);
    if (refreshToken) this.saveRefreshToken(refreshToken);
  }),
  map(response => !!(response?.accessToken || response?.token || response?.access_token)),
  catchError(error => {
    console.error('[AuthService] Error en login:', error);
    return of(false);
  })
);

  }

  saveToken(token: string) {
    console.log('[AuthService] Guardando token:', token);
    localStorage.setItem('token', token);
  }
  saveRefreshToken(token: string) {
    console.log('[AuthService] Guardando refreshToken:', token);
    localStorage.setItem('refreshToken', token);
  }
  getToken() {
    return localStorage.getItem('token');
  }
  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }
  logout() {
    console.log('[AuthService] Logout');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const [, payload] = token.split('.');
      const decoded = JSON.parse(atob(payload));
      const exp = decoded.exp;
      if (exp && Date.now() >= exp * 1000) {
        this.logout();
        return false;
      }
      return true;
    } catch (e) {
      console.error('[AuthService] Error al decodificar token:', e);
      return false;
    }
  }


  getUserRole(): string | null {
  const token = this.getToken();
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('[AuthService] Payload decodificado:', payload);

    // 👇 intenta obtener el rol de diferentes propiedades posibles
    let role =
      payload.role ||
      payload.roles ||
      payload.authorities?.[0] ||
      payload.codigorol ||
      payload.scope ||
      null;

    // 👇 traduce si quieres mantener coherencia con tus rutas
    if (role === 'TRABAJADOR') role = 'WORKER'; // opcional, solo si tus rutas están en inglés

    return role;
  } catch (e) {
    console.error('Error al decodificar token:', e);
    return null;
  }
}

getPayload(): any | null {
  const token = this.getToken();
  if (!token) {
    console.log('[AuthService] No hay token disponible');
    return null;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('[AuthService] Payload decodificado exitosamente:', payload);
    return payload;
  } catch (e) {
    console.error('[AuthService] Error al decodificar token:', e);
    return null;
  }
}

}