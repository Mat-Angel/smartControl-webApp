import { TitleCasePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet, UrlSegment } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { filter, map } from 'rxjs';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, TitleCasePipe],
  templateUrl: './auth-layout.component.html',
})
export class AuthLayoutComponent {
  router = inject(Router);
  readonly baseUrl = environment.gitRawUrl;

  paths = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),  // Filtra los eventos para dejar pasar solo los de tipo NavigationEnd, sirve para actualizar una vez por navegación, cuando ya se tiene la URL definitiva)
      map(() => this.router.url.split('/').filter(Boolean))
    ),
    { initialValue: this.router.url.split('/').filter(Boolean) }
  );

  authType = computed<string>(() => this.paths()[1] ?? '');

}
