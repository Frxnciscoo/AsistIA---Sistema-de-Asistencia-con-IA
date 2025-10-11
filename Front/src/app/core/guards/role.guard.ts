// src/app/core/guards/role.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const userRole = authService.getUserRole();  // puede ser string o null
  const allowedRoles = route.data?.['roles'] as string[]; // roles permitidos

  if (!authService.isAuthenticated()) {
    // No autenticado → redirige a login
    router.navigate(['/auth/login']);
    return false;
  }

  if (userRole && allowedRoles?.includes(userRole)) {
    // Rol permitido → deja pasar
    return true;
  } else {
    // Rol NO permitido → redirige a NotFoundComponent con error 403
    router.navigate(['/not-found'], { state: { errorCode: 403 } });
    return false;
  }
};
