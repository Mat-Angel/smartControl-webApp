import { Component, effect, inject } from '@angular/core';
import { AutomatedPaymentsTable } from "../../components/automated-payments-table/automated-payments-table";
import { rxResource } from '@angular/core/rxjs-interop';
import { AuthService } from '../../auth/services/auth.service';
import { TransactionsDataService } from '@services/transactions-data.service';
import { of } from 'rxjs';
import { LoadingScreenService } from '@shared/loading-screen/loading-screen.service';
import { AlertService } from '@shared/alert-message/alert.service';

@Component({
  selector: 'app-automated-payments-page',
  imports: [AutomatedPaymentsTable],
  templateUrl: './automated-payments-page.html',
})
export default class AutomatedPaymentsPage {
  authService = inject(AuthService);
  transactionsDataService = inject(TransactionsDataService);
  loadingScreenService = inject(LoadingScreenService);
  alertService = inject(AlertService);

  transactionsResource = rxResource({
    params: () => ({ token: this.authService.token(), userId: this.authService.userId() }),
    stream: ({ params }) => {
      if (!params.token || !params.userId) return of([]);
      return this.transactionsDataService.loadAutomatedPayments(params.token, params.userId);
    },
  });

    setLoadingStateEffect = effect(() => {
    this.loadingScreenService.setLoadingState(this.transactionsResource.isLoading())
  });

    deleteMovement(id: string) {
    return this.transactionsDataService.deleteAutomatedPaymen(id).subscribe({
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
