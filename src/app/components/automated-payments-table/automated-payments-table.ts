import { Component, ElementRef, inject, input, output, signal, viewChild } from '@angular/core';
import { PaymentPlan, Transactions } from '@interfaces/transactions.interface';
import { IconsService } from '../../services/icons.service';
import { CurrencyPipe, formatDate } from '@angular/common';
import { Router, RouterLink } from "@angular/router";
import { FormUtils } from '../../utils/form-utils';
import { MovementDetailInfo } from "../movement-detail-info/movement-detail-info";
import { Utils } from '../../utils/utils';
import { TransactionsDataService } from '@services/transactions-data.service';
import { AlertService } from '@shared/alert-message/alert.service';

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
  private transactionsDataService = inject(TransactionsDataService);
  private alertService = inject(AlertService);
  private router = inject(Router);

  readonly formUtils = FormUtils;
  readonly utils = Utils;
  selectedMovement = signal<Transactions | null>(null);
  monthOffset = signal<number>(0);


  onSelectedMovement(payment: Transactions) {
    // console.log('transaction selected: ', payment);
    this.selectedMovement.set(payment);
  }

  onDeleteMovement(id: string) {
    this.deleteMovement.emit(id);
    this.movementDetailModal()?.nativeElement.close();
  }

  onRegisterCharge() {
    const charge = this.selectedMovement();
    if (charge) {
      const partialAmount = (+charge.amount / charge.periodicTransaction!.installment!.total).toFixed(2);
      const isInstallment = charge.periodicTransaction?.paymentPlanType === PaymentPlan.installment;

      const data: Transactions = {
        // id: '',
        title: charge.title,
        description: `${charge.description} ${isInstallment ? ` (Mensualidad ${this.getInstallmentNumber(charge.operationDate)} de ${charge.periodicTransaction?.installment.total})` : ''}`,
        amount: isInstallment ? partialAmount.toString() : charge.amount,
        transactionType: charge.transactionType,
        category: charge.category,
        operationDate: this.getNewOperationDate(charge.operationDate, charge.periodicTransaction?.every ?? undefined),

        paymentInfo: { ...charge.paymentInfo }
      }

      this.transactionsDataService.saveTransaction(data).subscribe({
        next: (response) => {
          this.alertService.showAlert('Se ha guardado la transacción correctamente', 'success');
          //console.log('OK:', response);
          this.router.navigate(['/movements']);
        },
        error: (err) => {
          this.alertService.showAlert('Hubo un problema al guardar la transacción. Intente de nuevo', 'error');
          //console.error('Error:', err);
        }
      });
    }
  }

  getInstallmentNumber = (operationDate: string): number => {
    const currendDate = new Date();
    const date = new Date(operationDate);

    currendDate.setDate(1);
    date.setDate(1);

    let installmentNumber = (currendDate.getFullYear() - date.getFullYear()) * 12;
    installmentNumber += currendDate.getMonth() - date.getMonth();

    return installmentNumber + 1;
  };

  getNewOperationDate = (operationDate: string, cutDay?: number) => {
    const currentDate = new Date();
    const day = cutDay ? cutDay : +operationDate.split('-')[2];

    currentDate.setDate(day);

    const date = formatDate(currentDate, 'yyyy-MM-dd', 'en-US');
    return date;
  };

}

