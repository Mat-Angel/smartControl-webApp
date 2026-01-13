import { Component, input } from '@angular/core';
import { GraphicPoint } from '../../../layouts/smart-control-layout/smart-control-layout';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'months-graphic',
  imports: [CurrencyPipe],
  templateUrl: './months-graphic.html',
})
export class MonthsGraphic {

  graphicData = input.required<GraphicPoint[]>();


}
