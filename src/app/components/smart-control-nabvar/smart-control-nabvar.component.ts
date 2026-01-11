import { Component, effect, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { NavigationEnd, Router, RouterModule } from "@angular/router";
import { routes } from '../../app.routes';
import { ProfileInfoComponent } from '@shared/profile-info/profile-info.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { IconsService } from '@services/icons.service';

@Component({
  selector: 'smart-control-navbar',
  imports: [ProfileInfoComponent, RouterModule],
  templateUrl: './smart-control-nabvar.component.html',
})
export class SmartControlNabvarComponent {
  router = inject(Router);
  iconsService = inject(IconsService);

  baseUrl = environment.gitRawUrl;
  private readonly routesWithoutNavbar = ['/auth/login', '/'];


  showNavbar = signal<boolean>(false);

  currentUrl = toSignal(
  this.router.events.pipe(
    filter(e => e instanceof NavigationEnd),
    map((e: NavigationEnd) => e.urlAfterRedirects)
  ),
  { initialValue: this.router.url }
);

showNavbarEffect = effect(() => {
  this.showNavbar.set(
    !this.routesWithoutNavbar.includes(this.currentUrl())
  );
});

  menuRoutes = routes
    .map(route => ({
      title: route.title ?? '',
      path: route.path ?? '',
      onMenu: route.data?.['onMenu'] ?? false,
    }))
    .filter(route => route.onMenu); //* Filtra las rutas que esten seteadas en onMenu

}

