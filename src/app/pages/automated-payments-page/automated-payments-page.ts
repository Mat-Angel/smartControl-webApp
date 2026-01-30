import { Component, inject } from '@angular/core';
import { AutomatedPaymentsTable } from "../../components/automated-payments-table/automated-payments-table";
import { rxResource } from '@angular/core/rxjs-interop';
import { AuthService } from '../../auth/services/auth.service';
import { TransactionsDataService } from '@services/transactions-data.service';
import { of } from 'rxjs';

@Component({
  selector: 'app-automated-payments-page',
  imports: [AutomatedPaymentsTable],
  templateUrl: './automated-payments-page.html',
})
export default class AutomatedPaymentsPage {
  authService = inject(AuthService);
  transactionsDataService = inject(TransactionsDataService);

  transactionsResource = rxResource({
    params: () => ({ token: this.authService.token(), userId: this.authService.userId() }),
    stream: ({ params }) => {
      if (!params.token || !params.userId) return of([]);
      return this.transactionsDataService.loadAutomatedPayments(params.token, params.userId);
    },
  });


}
