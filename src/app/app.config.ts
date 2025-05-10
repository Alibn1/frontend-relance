import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import {provideHttpClient, withFetch, withInterceptors} from '@angular/common/http';
import {jwtInterceptor} from './interceptors/jwt.interceptor';
import {provideAnimations} from '@angular/platform-browser/animations';
import {MATERIAL_PROVIDERS} from './material';
import {provideNativeDateAdapter} from '@angular/material/core';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideHttpClient(
    withInterceptors([jwtInterceptor]), // Intercepteur JWT
    withFetch()),
    provideClientHydration(),provideAnimations(),
    provideNativeDateAdapter(),
    ...MATERIAL_PROVIDERS
  ]
};
