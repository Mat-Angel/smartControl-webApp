import { Component, computed, effect, inject } from '@angular/core';
import { TransactionsDataService } from '../../services/transactions-data.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { TransactionsTable } from '../../components/transactions-table/transactions-table';
import { of } from 'rxjs';
import { Balance } from '../../interfaces/transactions.interface';
import { CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from "@angular/router";
import { AuthService } from '../../auth/services/auth.service';
import { LoadingScreenService } from '@shared/loading-screen/loading-screen.service';
import { AlertService } from '@shared/alert-message/alert.service';


@Component({
  selector: 'app-smart-acontrol-layout',
  imports: [TransactionsTable, CurrencyPipe, RouterLink],
  templateUrl: './smart-control-layout.html',
})
export default class SmartControlLayout {
  transactionsDataService = inject(TransactionsDataService);
  authService = inject(AuthService);
  loadingScreenService = inject(LoadingScreenService);
  private alertService = inject(AlertService);
  private router = inject(Router);


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

  deleteMovement(id:string){
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
