import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  
  console.log('[TokenFunctionalInterceptor] URL:', req.url);
  console.log('[TokenFunctionalInterceptor] Token presente:', !!token);
  
  // ← AGREGADO: Redirigir URLs que empiecen con /api al backend
  let url = req.url;
  if (url.startsWith('/api')) {
    url = url.replace('/api', 'http://localhost:8083');
    console.log('[TokenFunctionalInterceptor] URL redirigida a:', url);
  }
  
  if (token) {
    console.log('[TokenFunctionalInterceptor] Agregando Bearer token a la petición');
    const authReq = req.clone({
      url: url,  // ← AGREGADO: Usar la URL modificada
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  } else {
    console.log('[TokenFunctionalInterceptor] No hay token disponible');
    const authReq = req.clone({
      url: url  // ← AGREGADO: Usar la URL modificada incluso sin token
    });
    return next(authReq);
  }
};