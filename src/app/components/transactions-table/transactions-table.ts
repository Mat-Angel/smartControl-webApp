import { Component, ElementRef, input, output, signal, viewChild } from '@angular/core';
import { Transactions } from '../../interfaces/transactions.interface';
import { CurrencyPipe, I18nPluralPipe } from '@angular/common';
import { RouterLink } from "@angular/router";
import { MovementDetailInfo } from "../movement-detail-info/movement-detail-info";

@Component({
  selector: 'transactions-table',
  imports: [CurrencyPipe, RouterLink, MovementDetailInfo, I18nPluralPipe],
  templateUrl: './transactions-table.html',
})
export class TransactionsTable {
  movementDetailModal = viewChild<ElementRef<HTMLDialogElement>>('movementDetail')
  transactionsList = input.required<Transactions[]>();
  monthOffset = input.required<number>();
  errorMessage = input<string | unknown | null>();
  isLoading = input<boolean>(false);
  isEmpty = input<boolean>(false);

  monthMap = signal({
    '=0': 'actual',
    '=1': 'anterior',
    '=2': 'previo al anterior',
    other: 'desconocido'
  })

  deleteMovement = output<string>();

  selectedMovement = signal<Transactions | null>(null);


  onSelectedMovement(transaction: Transactions) {
    console.log('transaction selected: ', { transaction });
    this.selectedMovement.set(transaction);
  }

  onDeleteMovement(id: string) {
    this.deleteMovement.emit(id);
    this.movementDetailModal()?.nativeElement.close();
  }

}
