import { Component, input } from '@angular/core';

@Component({
  selector: 'alert-title-desc',
  imports: [],
  templateUrl: './alert-title-desc.component.html',
})
export class AlertTitleDescComponent {
  title = input.required();
  description = input.required();
}
