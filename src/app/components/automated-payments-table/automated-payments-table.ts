import { Component, ElementRef, inject, input, output, signal, viewChild } from '@angular/core';
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
  movementDetailModal = viewChild<ElementRef<HTMLDialogElement>>('movementDetail')

  paymentsList = input.required<Transactions[]>();
  isLoading = input<boolean>(false);
  isEmpty = input<boolean>(false);
  deleteMovement = output<string>();

  iconsService = inject(IconsService);
  readonly formUtils = FormUtils;
  selectedMovement = signal<Transactions | null>(null);
  monthOffset = signal<number>(0);


  onSelectedMovement(payment: Transactions) {
    //console.log('transaction selected: ', { transaction });
    this.selectedMovement.set(payment);
  }

  onDeleteMovement(id: string) {
    this.deleteMovement.emit(id);
    this.movementDetailModal()?.nativeElement.close();
  }


}
