import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  
  console.log('[TokenFunctionalInterceptor] URL:', req.url);
  console.log('[TokenFunctionalInterceptor] Token presente:', !!token);
  
  if (token) {
    console.log('[TokenFunctionalInterceptor] Agregando Bearer token a la petición');
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  } else {
    console.log('[TokenFunctionalInterceptor] No hay token disponible');
    return next(req);
  }
};
