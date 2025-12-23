import { Component, input } from '@angular/core';

@Component({
  selector: 'rounded-icon',
  imports: [],
  templateUrl: './rounded-icon.component.html',
})
export class RoundedIconComponent {
  url = input<string | null>(null)
  faIconId = input.required<string>()
}
