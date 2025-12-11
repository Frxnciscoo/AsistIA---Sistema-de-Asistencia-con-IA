import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  
  // 📍 Log inicial
  console.log('[🔄 TokenInterceptor] Interceptando:', req.method, req.url);
  
  // ============================================
  // 1️⃣ RUTAS PÚBLICAS (SIN TOKEN, pero CON REDIRECCIÓN si es /api)
  // ============================================
  const publicRoutes = [
    '/Auth-Service/auth/token',                    // Login endpoint
    'localhost:9999',                              // Auth service completo
    '/asistencia/reconocimiento-facial',           // Facial recognition
    '/api/asistencia/reconocimiento-facial',       // Facial recognition (con proxy)
  ];

  const isPublicRoute = publicRoutes.some(route => req.url.includes(route));

  if (isPublicRoute) {
    console.log('[🟢 TokenInterceptor] Ruta pública - SIN token');
    
    // ← AGREGADO: Redirigir /api a localhost:8083 incluso en rutas públicas
    let finalUrl = req.url;
    if (req.url.startsWith('/api')) {
      finalUrl = req.url.replace('/api', 'http://localhost:8083');
      console.log('[📍 TokenInterceptor] Ruta /api redirigida a:', finalUrl);
      return next(req.clone({ url: finalUrl }));  // ← Redirigir y pasar
    }
    
    return next(req);  // ✅ Pasar tal cual, sin tocar nada
  }

  // ============================================
  // 2️⃣ RUTAS PRIVADAS (CON TOKEN)
  // ============================================
  
  // 🔄 Redirigir /api a localhost:8083
  let finalUrl = req.url;
  if (req.url.startsWith('/api')) {
    finalUrl = req.url.replace('/api', 'http://localhost:8083');
    console.log('[📍 TokenInterceptor] Ruta /api redirigida a:', finalUrl);
  }

  // ✅ Agregar token si existe
  if (token) {
    console.log('[✅ TokenInterceptor] Token disponible - Agregando Bearer');
    const authReq = req.clone({
      url: finalUrl,
      setHeaders: {
        'Authorization': `Bearer ${token}`
      }
    });
    return next(authReq);
  } else {
    console.log('[⚠️ TokenInterceptor] SIN token en ruta privada');
    const authReq = req.clone({
      url: finalUrl
    });
    return next(authReq);
  }
};