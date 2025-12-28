import { Component, computed, ElementRef, input, output, signal, viewChild } from '@angular/core';
import { Transactions } from '../../interfaces/transactions.interface';
import { CurrencyPipe, I18nPluralPipe } from '@angular/common';
import { RouterLink } from "@angular/router";
import { MovementDetailInfo } from "../movement-detail-info/movement-detail-info";
import { Pagination } from "@shared/pagination/pagination";

@Component({
  selector: 'transactions-table',
  imports: [CurrencyPipe, RouterLink, MovementDetailInfo, I18nPluralPipe, Pagination],
  templateUrl: './transactions-table.html',
})
export class TransactionsTable {
  movementDetailModal = viewChild<ElementRef<HTMLDialogElement>>('movementDetail')
  transactionsList = input.required<Transactions[]>();
  monthOffset = input.required<number>();
  errorMessage = input<string | unknown | null>();
  isLoading = input<boolean>(false);
  isEmpty = input<boolean>(false);
  deleteMovement = output<string>();

  monthMap = signal({
    '=0': 'actual',
    '=1': 'anterior',
    '=2': 'previo al anterior',
    other: 'desconocido'
  })

  selectedMovement = signal<Transactions | null>(null);

  onSelectedMovement(transaction: Transactions) {
    console.log('transaction selected: ', { transaction });
    this.selectedMovement.set(transaction);
  }

  onDeleteMovement(id: string) {
    this.deleteMovement.emit(id);
    this.movementDetailModal()?.nativeElement.close();
  }

  pageSize = signal(10);

  currentPage = signal(1);

  totalItems = computed(() => {
    const total = this.transactionsList().length;
    return total;
  });

  // Items visibles en la página actual
  paginatedItems = computed(() => {
    const items = this.transactionsList();
    const page = this.currentPage();
    const size = this.pageSize();

    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;

    return items.slice(startIndex, endIndex);
  });

}
