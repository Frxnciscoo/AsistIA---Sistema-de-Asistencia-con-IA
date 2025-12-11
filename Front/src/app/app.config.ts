import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { DateAdapter, CalendarUtils } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { tokenInterceptor } from './core/interceptors/token-functional.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([tokenInterceptor])  // ✅ SOLO el funcional
    ),
    { provide: DateAdapter, useFactory: adapterFactory },
    CalendarUtils
  ]
};