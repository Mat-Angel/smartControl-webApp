import { Component, inject, input, signal } from '@angular/core';
import { Transactions } from '@interfaces/transactions.interface';
import { IconsService } from '../../services/icons.service';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from "@angular/router";
import { FormUtils } from '../../utils/form-utils';
import { MovementDetailInfo } from "../movement-detail-info/movement-detail-info";

@Component({
  selector: 'automated-payments-table',
  imports: [CurrencyPipe, RouterLink, MovementDetailInfo],
  templateUrl: './automated-payments-table.html',
})
export class AutomatedPaymentsTable {
  paymentsList = input.required<Transactions[]>();
  iconsService = inject(IconsService);
  readonly formUtils = FormUtils;
  selectedMovement = signal<Transactions | null>(null);


  onSelectedMovement(payment: Transactions) {
    //console.log('transaction selected: ', { transaction });
    this.selectedMovement.set(payment);
  }

  monthOffset = signal<number>(0);

}
