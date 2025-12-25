import { Component, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Router, RouterModule } from "@angular/router";
import { routes } from '../../app.routes';
import { ProfileInfoComponent } from '@shared/profile-info/profile-info.component';

@Component({
  selector: 'smart-control-navbar',
  imports: [ProfileInfoComponent, RouterModule],
  templateUrl: './smart-control-nabvar.component.html',
})
export class SmartControlNabvarComponent {
  router = inject(Router);
  baseUrl = environment.gitRawUrl;
  private readonly routesWithoutNavbar = ['/auth/login', '/'];

  showNavbar(): boolean {
    console.log(this.router.url);
    return !this.routesWithoutNavbar.includes(this.router.url);
  }

  routes = routes
    .map((route) => ({
      title: route.title ?? '',
      path: route.path ?? ''
    }))
    .filter((route) => route && route.path && route.title);  //* Excluye las rutas que no tengan path


}

