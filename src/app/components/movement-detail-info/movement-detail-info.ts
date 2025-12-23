import { Component, input } from '@angular/core';
import { Transactions } from '@interfaces/transactions.interface';
import { FormUtils } from '../../utils/form-utils';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'movement-detail-info',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './movement-detail-info.html',
})
export class MovementDetailInfo {
  detailData = input.required<Transactions|null>();

  formUtils = FormUtils;


}
