import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    console.log('[TokenInterceptor] URL:', request.url);
    console.log('[TokenInterceptor] Token presente:', !!token);
    
    if (token) {
      console.log('[TokenInterceptor] Agregando Bearer token a la petición');
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    } else {
      console.log('[TokenInterceptor] No hay token disponible');
    }
    return next.handle(request);
  }
}