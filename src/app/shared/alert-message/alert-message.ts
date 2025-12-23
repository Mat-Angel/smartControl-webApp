import { Component, inject } from '@angular/core';
import { AlertService } from '@shared/alert-message/alert.service';

@Component({
  selector: 'alert-message',
  imports: [],
  templateUrl: './alert-message.html',
})
export class AlertMessage {
  alertService = inject(AlertService);

}
