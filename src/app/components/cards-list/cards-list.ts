import { Component, input, output } from '@angular/core';
import { PaymentMethod } from '@interfaces/payment-methods.interface';
import { RouterLink } from "@angular/router";
import { FormUtils } from '../../utils/form-utils';

@Component({
  selector: 'cards-list',
  imports: [RouterLink],
  templateUrl: './cards-list.html',
})
export class CardsList {
  cardsData = input.required<PaymentMethod[]>();
  errorMessage = input<string | unknown | null>();
  isLoading = input<boolean>(false);
  isEmpty = input<boolean>(false);
  formUtils = FormUtils;

  selectedCard = output<PaymentMethod>();


  selectCard(cardInfo: PaymentMethod) {
    console.log('selected card: ', cardInfo);
    this.selectedCard.emit(cardInfo);
  }


}
