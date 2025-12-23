import { Injectable, signal } from '@angular/core';
import { StyleClass } from '@interfaces/utils.interface';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  hasAlert = signal(false);
  alertMessage = signal('');
  alertClass = signal<StyleClass>('');

  showAlert(message: string, classAlert?:StyleClass) {
    if (this.hasAlert()) return;
    this.alertMessage.set(message);
    this.alertClass.set(classAlert ?? '');
    this.hasAlert.set(true);
    // console.log('Mostrando alert');

    setTimeout(() => {
      this.hasAlert.set(false);
      this.alertMessage.set('');
      this.alertClass.set('');
      // console.log('Cerrando alert');
    }, 5000);
    return
  }

}
