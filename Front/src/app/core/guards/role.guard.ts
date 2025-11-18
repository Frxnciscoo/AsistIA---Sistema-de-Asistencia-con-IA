// src/app/core/guards/role.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Obtener el rol del usuario desde el token
  const userRole = authService.getUserRole();  
  // Roles permitidos desde las rutas
  const allowedRoles = route.data?.['roles'] as string[];

  // Si no está autenticado → redirige al login
  if (!authService.isAuthenticated()) {
    console.warn('[roleGuard] Usuario no autenticado. Redirigiendo a login...');
    router.navigate(['/auth/login']);
    return false;
  }

  if (userRole && allowedRoles) {
    // Normalizar roles para evitar errores por mayúsculas/minúsculas o espacios
    const normalizedUserRole = userRole.trim().toUpperCase();
    const normalizedAllowedRoles = allowedRoles.map(r => r.trim().toUpperCase());

    // Verificar si el rol del usuario está dentro de los roles permitidos
    if (normalizedAllowedRoles.includes(normalizedUserRole)) {
      console.log('[roleGuard] ✅ Acceso permitido');
      return true;
    }
  }

  // Si llega aquí → el rol no está autorizado
  console.warn('[roleGuard] ❌ Acceso denegado. Redirigiendo a /not-found (403)');
  router.navigate(['/not-found'], { state: { errorCode: 403 } });
  return false;
};
