import { Component, inject } from '@angular/core';
import { LoadingScreenService } from './loading-screen.service';
import { Utils } from '../../utils/utils';


@Component({
  selector: 'loading-screen',
  imports: [],
  template: `
    @if(loadingScreenService.isLoading()){
      <div class="fixed inset-0 bg-black/60 z-80 flex flex-col items-center justify-center">
        <div class="animate-ping mb-10"><img class="w-30" [src]="srcMatIcon"/></div>
        <div class="text-white text-lg">Cargando...</div>
      </div>
    }
  `,
})
export class LoadingScreen {
  loadingScreenService= inject(LoadingScreenService);
  srcMatIcon = Utils.getSvgImage('MAT_WHITE_ICON');
}
