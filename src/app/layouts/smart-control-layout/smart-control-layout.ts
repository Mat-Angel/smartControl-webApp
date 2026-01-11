import { Component, computed, effect, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { TransactionsDataService } from '../../services/transactions-data.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { TransactionsTable } from '../../components/transactions-table/transactions-table';
import { of } from 'rxjs';
import { Balance, Transactions } from '../../interfaces/transactions.interface';
import { CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from "@angular/router";
import { AuthService } from '../../auth/services/auth.service';
import { LoadingScreenService } from '@shared/loading-screen/loading-screen.service';
import { AlertService } from '@shared/alert-message/alert.service';
import { Utils } from '../../utils/utils';
import { IconsService } from '@services/icons.service';


@Component({
  selector: 'app-smart-acontrol-layout',
  imports: [TransactionsTable, CurrencyPipe, RouterLink],
  templateUrl: './smart-control-layout.html',
})
export default class SmartControlLayout {
  @ViewChild('transactionsTable', { static: false }) transactionsTable!: ElementRef<HTMLElement>;

  transactionsDataService = inject(TransactionsDataService);
  authService = inject(AuthService);
  loadingScreenService = inject(LoadingScreenService);
  iconsService = inject(IconsService);
  private alertService = inject(AlertService);
  private router = inject(Router);

  goToTableSection() {
    const timeout = setTimeout(() => {
      this.transactionsTable.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 5)
  }

  transactionsResource = rxResource({
    params: () => ({ token: this.authService.token(), userId: this.authService.userId() }),
    stream: ({ params }) => {
      if (!params.token || !params.userId) return of([]);
      return this.transactionsDataService.loadTransactions(params.token, params.userId);
    },
  });

  setLoadingStateEffect = effect(() => {
    this.loadingScreenService.setLoadingState(this.transactionsResource.isLoading())
  });

  balanceInfo = computed<Balance>(() => {
    const transactionInfo = this.transactionsResource.value() ?? [];

    const totalIncome: number = transactionInfo!
      .filter(t => t.transactionType === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalOutgoing: number = transactionInfo!
      .filter(t => t.transactionType === 'outgoing')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalAvailable = Number((totalIncome - totalOutgoing).toFixed(2));

    return { totalAvailable, totalIncome, totalOutgoing };
  });

  monthOffset = signal(0);   // 0 = mes actual, 1 = mes anterior, 2 = hace 2 meses...

  selectedMonth = computed(() => {
    const hoy = new Date();
    hoy.setMonth(hoy.getMonth() - this.monthOffset());

    return {
      month: hoy.getMonth(),      // 0–11
      year: hoy.getFullYear()
    };
  });


  private isSameMonth(fechaStr: string, monthIndex: number, year: number): boolean {
    // fechaStr = "2025-11-02"
    const [y, m] = fechaStr.split('-').map(Number); // y = 2025, m = 11

    // monthIndex es 0–11, pero el string trae mes 1–12, por eso m - 1
    return y === year && (m - 1) === monthIndex;
  }

  transactionsByMonth = computed<Transactions[]>(() => {
    const transactions = this.transactionsResource.value() ?? []

    const hoy = new Date();
    hoy.setMonth(hoy.getMonth() - this.monthOffset());
    const mesActual = hoy.getMonth();        // 0-11
    const anioActual = hoy.getFullYear();    // ej: 2025

    return transactions.filter(item =>
      this.isSameMonth(item.operationDate, mesActual, anioActual))
      .sort((a, b) => b.operationDate.localeCompare(a.operationDate));
  })

  onLoadMovementByPeriod(period: number) {
    this.monthOffset.set(period);
    this.goToTableSection();
  }


  deleteMovement(id: string) {
    console.log('ID para eliminar: ', id);
    return this.transactionsDataService.deleteTransaction(id).subscribe({
      next: (response) => {
        this.transactionsResource.reload();
        this.alertService.showAlert('Se ha eliminado la información correctamente', 'success');
        //console.log('OK:', response);
      },
      error: (err) => {
        this.alertService.showAlert('Hubo un problema al eliminar la información. Intente de nuevo', 'error');
        //console.error('Error:', err);
      }
    });
  }

}
