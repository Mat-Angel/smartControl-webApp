import { Component, computed, effect, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TransactionsDataService } from '../../services/transactions-data.service';
import { of } from 'rxjs';
import { CardsList } from "../../components/cards-list/cards-list";
import { AuthService } from '../../auth/services/auth.service';
import { LoadingScreenService } from '@shared/loading-screen/loading-screen.service';
import { PaymentMethod } from '@interfaces/payment-methods.interface';
import { RouterModule } from "@angular/router";
import { FormUtils } from '../../utils/form-utils';
import { IconsService } from '@services/icons.service';
import { Utils } from '../../utils/utils';
import { CurrencyPipe } from '@angular/common';
import { AlertService } from '@shared/alert-message/alert.service';

@Component({
  selector: 'app-my-cards-page',
  imports: [CardsList, RouterModule, CurrencyPipe],
  templateUrl: './my-cards-page.html',
})
export default class MyCardsPage {
  transactionsDataService = inject(TransactionsDataService);
  authService = inject(AuthService);
  alertService = inject(AlertService);
  loadingScreenService = inject(LoadingScreenService);
  iconsService = inject(IconsService);
  srcMatIcon = Utils.getSvgImage('MAT_ICON');
  formUtils = FormUtils;

  @ViewChild('card3D', { static: false }) card3D!: ElementRef<HTMLElement>;

  goToSection() {
    const timeout = setTimeout(() => {
      this.card3D.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 5)
  }

  getCutoffDate(day: number) {
    const today = new Date();
    const cutOffDate = new Date(today.getFullYear(), today.getMonth(), day);
    return `${day} de ${new Intl.DateTimeFormat('es-MX', { month: 'short' }).format(cutOffDate)}`;
  }

  getPaymentDate(cutoffDay: number, daysToPay: number) {
    const today = new Date();
    const cutOffDate = new Date(today.getFullYear(), today.getMonth(), cutoffDay);
    const paymentDate = new Date(cutOffDate);
    paymentDate.setDate(paymentDate.getDate() + daysToPay);
    return `${paymentDate.getDate()} de ${new Intl.DateTimeFormat('es-MX', { month: 'short' }).format(paymentDate)}`;
  }

  cardInfo = signal<PaymentMethod | null>(null);

  cardsResource = rxResource({
    params: () => ({ token: this.authService.token(), userId: this.authService.userId() }),
    stream: ({ params }) => {
      if (!params.token || !params.userId) return of([]);
      return this.transactionsDataService.loadCards(params.token, params.userId);
    },
  });

  setLoadingStateEffect = effect(() => {
    this.loadingScreenService.setLoadingState(this.cardsResource.isLoading())
  });

  deleteCard(id: string) {
    return this.transactionsDataService.deleteCard(id).subscribe({
      next: (response) => {
        this.cardsResource.reload();
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
