import { Injectable, signal } from '@angular/core';
import { StyleClass } from '@interfaces/utils.interface';

@Injectable({
  providedIn: 'root'
})
export class LoadingScreenService {
  isLoading = signal<boolean>(false);

  setLoadingState(state: boolean){
    this.isLoading.set(state)
  }

}
