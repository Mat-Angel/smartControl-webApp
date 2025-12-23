import { inject } from '@angular/core';
import { CanMatchFn, Route, Router, UrlSegment } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NavigationService } from '@services/navigation.service';

export const IsAuthenticatedGuard: CanMatchFn = async (
  route: Route,
  segments: UrlSegment[]
) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const navigationService = inject(NavigationService);
  const isAuthenticated = await firstValueFrom( authService.checkAuthStatus());

  const mode = route.data?.['mode'] ?? 'require-auth';

  if (mode === 'require-auth') {
    if (isAuthenticated) {
      return true;    // deja pasar
    }

    // si NO está logueado → manda a login
    return router.parseUrl('/auth/login');
  }

  if (isAuthenticated) {
    return false;
  }

  return true;



}
