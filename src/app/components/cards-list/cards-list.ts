import { Component, ElementRef, inject, input, output, viewChild } from '@angular/core';
import { PaymentMethod } from '@interfaces/payment-methods.interface';
import { RouterLink } from "@angular/router";
import { FormUtils } from '../../utils/form-utils';
import { Utils } from '../../utils/utils';
import { IconsService } from '@services/icons.service';

@Component({
  selector: 'cards-list',
  imports: [RouterLink],
  templateUrl: './cards-list.html',
})
export class CardsList {
  cardsData = input.required<PaymentMethod[]>();
  iconsService = inject(IconsService);
  errorMessage = input<string | unknown | null>();
  isLoading = input<boolean>(false);
  isEmpty = input<boolean>(false);
  selectedCard = output<PaymentMethod>();
  deleteCard = output<string>();
  formUtils = FormUtils;

  readonly srcMatIcon = Utils.getSvgImage('MAT_ICON');

  selectCard(cardInfo: PaymentMethod) {
    this.selectedCard.emit(cardInfo);
  }

  onDeleteCard(id: string) {
    this.deleteCard.emit(id);
  }

}
