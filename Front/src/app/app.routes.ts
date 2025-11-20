// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';  // 👈 en minúscula
import { roleGuard } from './core/guards/role.guard';  // 👈 en minúscula
import { NotFoundComponent } from './not-found/not-found.component';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
{
    path: 'reconocimiento-facial',
    loadComponent: () =>
      import('./ReconocimientoFacial/reconocimiento-facial.component').then(
        (m) => m.ReconocimientoFacialComponent
      ),
  },
  // Auth
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },

  // Worker
  {
    path: 'worker',
    canActivate: [authGuard, roleGuard], // 👈 usa funciones
    data: { roles: ['TRABAJADOR', 'SUPERVISOR', 'ADMINISTRADOR'] },
    children: [
      { path: '', redirectTo: 'history', pathMatch: 'full' },
      {
        path: 'history',
        loadComponent: () =>
          import('./features/worker/history/history.component').then(
            (m) => m.HistoryComponent
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./shared/profile/profile.component').then(
            (m) => m.ProfileComponent
          ),
      },
      {
        path: 'schedules',
        loadComponent: () =>
          import('./features/worker/schedules/schedules.component').then(
            (m) => m.SchedulesComponent
          ),
      },
    ],
  },

  // Admin
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard], // 👈 igual acá
    data: { roles: ['ADMINISTRADOR'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/admin/users/users.component').then(
            (m) => m.UsersComponent
          ),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/admin/reports/reports.component').then(
            (m) => m.ReportsComponent
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./shared/profile/profile.component').then(
            (m) => m.ProfileComponent
          ),
      },
      {
        path: 'schedules',
        loadComponent: () =>
          import('./features/admin/schedules/schedules.component').then(
            (m) => m.SchedulesComponent
          ),
      },
      {
        path: 'register-face',
        loadComponent: () =>
          import('./features/admin/register-face/register-face.component').then(
            (m) => m.RegisterFaceComponent
          ),  
      },  
    ],
  },
  { path: 'not-found', component: NotFoundComponent, data: { errorCode: 404 } },
  { path: 'forbidden', component: NotFoundComponent, data: { errorCode: 403 } },
  // 404
  {
    path: '**',
    loadComponent: () =>
      import('./not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
  },
  

];
