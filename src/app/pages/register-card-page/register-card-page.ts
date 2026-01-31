import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormTextHelperComponent } from "@shared/form-text-helper/form-text-helper.component";
import { Location } from '@angular/common';
import { FormUtils } from '../../utils/form-utils';
import { Router } from "@angular/router";
import { NgxMaskDirective } from 'ngx-mask';
import { TransactionsDataService } from '@services/transactions-data.service';
import { PaymentMethod } from '@interfaces/payment-methods.interface';
import { AlertService } from '@shared/alert-message/alert.service';
import { Utils } from '../../utils/utils';
import { IconsService } from '@services/icons.service';

@Component({
  selector: 'app-register-card-page',
  imports: [FormTextHelperComponent, ReactiveFormsModule, NgxMaskDirective],
  templateUrl: './register-card-page.html',

})
export default class RegisterCardPage {
  private fb = inject(FormBuilder);
  private location = inject(Location);
  private transactionsDataService = inject(TransactionsDataService);
  private alertService = inject(AlertService);
  private router = inject(Router);

  readonly iconsService = inject(IconsService);
  readonly formUtils = FormUtils;
  readonly utils = Utils;


  cardForm: FormGroup = this.fb.group({
    paymentType: ['', [Validators.required]],
    bankName: ['', [Validators.required, Validators.pattern(FormUtils.alphanumericAndSpacesPattern), Validators.maxLength(20)]],
    productName: ['', [Validators.required, Validators.pattern(FormUtils.alphanumericAndSpacesPattern), Validators.maxLength(30)]],
    titularName: ['', [Validators.required, Validators.pattern(FormUtils.alphanumericAndSpacesPattern), Validators.maxLength(30)]],
    balance: ['0'],
    creditLine: ['', [Validators.min(0.01), Validators.maxLength(14)]],
    cutoffDay: [''],
    daysToPay: [''],
    color: ['', [Validators.required]]
  });

  onChangePaymenTypeOptions(value: string) {
    if (value === "credit") {
      this.cardForm.get('daysToPay')!.reset('20');
      return;
    }

    this.cardForm.get('creditLine')?.setValue('');
    this.cardForm.get('cutoffDay')?.setValue('');
    this.cardForm.get('daysToPay')?.setValue('');
  }

  onSubmit() {
    this.cardForm.markAllAsTouched();
    const isvalid = this.cardForm.valid;

    if (!isvalid) return;
    const cardData = this.cardForm.value;

    const data: PaymentMethod = {
      accInfo: {
        bankName: cardData.bankName,
        productName: cardData.productName,
        titularName: cardData.titularName,
        paymentType: cardData.paymentType
      },
      balanceInfo: {
        balance: cardData.balance,
        creditLine: cardData.creditLine,
        cutoffDay: cardData.cutoffDay,
        daysToPay: cardData.daysToPay
      },
      accSettings: {
        color: cardData.color
      }
    }

    this.transactionsDataService.saveCard(data).subscribe({
      next: (response) => {
        this.alertService.showAlert('Se ha guardado la información correctamente', 'success');
        //console.log('OK:', response);
        this.router.navigate(['/my_cards'])
      },
      error: (err) => {
        this.alertService.showAlert('Hubo un problema al guardar la información. Intente de nuevo', 'error');
        //console.error('Error:', err);
      }
    });

  };

  goBack() {
    this.location.back();  //* Esta función, propia de @angular-common, nos pormite navegar entre localizaciones, en este caso nos regresa a la ruta anterior
  }

}
