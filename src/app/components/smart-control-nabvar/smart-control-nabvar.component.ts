import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ProfileInfoComponent } from "@shared/profile-info/profile-info.component";
import { RouterModule } from "@angular/router";
import { routes } from '../../app.routes';

@Component({
  selector: 'smart-control-navbar',
  imports: [ProfileInfoComponent, RouterModule],
  templateUrl: './smart-control-nabvar.component.html',
})
export class SmartControlNabvarComponent {
  baseUrl = environment.gitRawUrl;

  routes = routes
  .map((route) => ({
    title: route.title ?? '',
    path: route.path ?? ''
  }))
  .filter((route) => route && route.path && route.title);  //* Excluye laas rutas que no tengan path

}

