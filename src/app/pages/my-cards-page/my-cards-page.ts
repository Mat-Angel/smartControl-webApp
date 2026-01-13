import { Component, effect, ElementRef, inject, signal, ViewChild } from '@angular/core';
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

@Component({
  selector: 'app-my-cards-page',
  imports: [CardsList, RouterModule, CurrencyPipe],
  templateUrl: './my-cards-page.html',
})
export default class MyCardsPage {
  transactionsDataService = inject(TransactionsDataService);
  authService = inject(AuthService);
  loadingScreenService = inject(LoadingScreenService);
  iconsService = inject(IconsService);
  srcMatIcon = Utils.getSvgImage('MAT_WHITE_ICON');
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

  getCutoffDate(day: number){
    const today = new Date();
    const cutOffDate = new Date(today.getFullYear(), today.getMonth(), day);
    return `${day} de ${new Intl.DateTimeFormat('es-MX', { month: 'short' }).format(cutOffDate)}`;
  }

  getPaymentDate(cutoffDay: number, daysToPay: number){
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


  dataMT = [
    {day:'lunes' ,value: 'dgsfhjsd'},
    {day:'martes' ,value: 'dgsfhjsd'},
    {day:'miercoles' ,value: 'dgsfhjsd'},
    {day:'jueves' ,value: 'dgsfhjsd'},
    {day:'viernes' ,value: 'dgsfhjsd'}
  ];

  activityBlocks = [
    {level:0},
    {level:2},
    {level:3},
    {level:4},
    {level:5},
  ];

data = [
  { x: 0, y: 80, label: 'Lun' },
  { x: 50, y: 20, label: 'Mar' },
  { x: 100, y: 60, label: 'Mie' },
  { x: 150, y: 40, label: 'Jue' },
  { x: 200, y: 90, label: 'Vie' }
];

get points(): string {
  return this.data.map(d => `${d.x},${100 - d.y}`).join(' ');
}



}
