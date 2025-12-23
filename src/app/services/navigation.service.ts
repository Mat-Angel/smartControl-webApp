import { inject, Injectable, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  private _originUrl = signal<string>('');
  readonly originUrl = this._originUrl.asReadonly();

  navigatePrevious(){
    // console.log('this.previousUrl()', this.previousUrl());

   // this.router.navigate([this.previousUrl()]);
  }

  saveOriginRoute(optionalUrl?: string){

    if (optionalUrl){
      console.log('Guardando optionalUrl', optionalUrl);
      this._originUrl.set(optionalUrl);
      return;
    }

    console.log('Guardo originRoute', this.router.url);
    if (this.router.url === '/' || this.router.url === '' ) return;
    this._originUrl.set(this.router.url);
  }

  redirectToOrigin(){
    this.router.navigate([this.originUrl()]);
  }

  navigateLogin(){
    this.saveOriginRoute();
    this.router.navigate(['/auth/login']);
  }





}
