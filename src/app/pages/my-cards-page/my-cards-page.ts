import { Component, computed, effect, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { SmartControlNabvarComponent } from "../../components/smart-control-nabvar/smart-control-nabvar.component";
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

@Component({
  selector: 'app-my-cards-page',
  imports: [CardsList, RouterModule],
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


}
