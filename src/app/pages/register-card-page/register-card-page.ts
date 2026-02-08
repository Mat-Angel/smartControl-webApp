import { AfterViewInit, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormTextHelperComponent } from "@shared/form-text-helper/form-text-helper.component";
import { Location } from '@angular/common';
import { FormUtils } from '../../utils/form-utils';
import { ActivatedRoute, Router } from "@angular/router";
import { NgxMaskDirective } from 'ngx-mask';
import { TransactionsDataService } from '@services/transactions-data.service';
import { PaymentMethod } from '@interfaces/payment-methods.interface';
import { AlertService } from '@shared/alert-message/alert.service';
import { Utils } from '../../utils/utils';
import { IconsService } from '@services/icons.service';
import { LoadingScreenService } from '@shared/loading-screen/loading-screen.service';
import { map, tap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-register-card-page',
  imports: [FormTextHelperComponent, ReactiveFormsModule, NgxMaskDirective],
  templateUrl: './register-card-page.html',

})
export default class RegisterCardPage implements AfterViewInit {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private location = inject(Location);
  private transactionsDataService = inject(TransactionsDataService);
  private alertService = inject(AlertService);
  private loadingScreenService = inject(LoadingScreenService);
  private activatedRoute = inject(ActivatedRoute);
  readonly iconsService = inject(IconsService);

  readonly formUtils = FormUtils;
  readonly utils = Utils;

  private readonly queryId = toSignal(this.activatedRoute.params.pipe(map(params => params['id'])));
  cardData = signal<PaymentMethod | null>(null);

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


  ngAfterViewInit(): void {
    if (this.queryId()) {
      this.loadCardById(this.queryId());
    }
  }

  loadCardById(cardId: string) {
    this.loadingScreenService.setLoadingState(true);
    this.transactionsDataService.getCardById(cardId).pipe(
      tap(() => this.loadingScreenService.setLoadingState(false))
    )
      .subscribe({
        next: (resp) => {
          if (!resp) {
            this.alertService.showAlert(
              'Hubo un problema al cargar la información. Intente de nuevo',
              'error'
            );
            return;
          }
          this.cardData.set(resp);
          this.setFormsData(resp);
        },
        error: () => {
          this.alertService.showAlert(
            'Hubo un problema al cargar la información. Intente de nuevo',
            'error'
          );
        }
      });
  }


  setFormsData(cardData: PaymentMethod) {
    this.cardForm.get('paymentType')!.setValue(cardData?.accInfo.paymentType);
    this.cardForm.get('bankName')!.setValue(cardData?.accInfo.bankName);
    this.cardForm.get('productName')!.setValue(cardData?.accInfo.productName);
    this.cardForm.get('titularName')!.setValue(cardData?.accInfo.titularName);
    this.cardForm.get('balance')!.setValue(cardData?.balanceInfo.balance);
    this.cardForm.get('creditLine')!.setValue(cardData?.balanceInfo.creditLine);
    this.cardForm.get('cutoffDay')!.setValue(cardData?.balanceInfo.cutoffDay);
    this.cardForm.get('daysToPay')!.setValue(cardData?.balanceInfo.daysToPay);
    this.cardForm.get('color')!.setValue(cardData?.accSettings.color);
  }


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
        id: this.cardData() ? this.queryId() : '',
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

    if (this.cardData()) {
      this.transactionsDataService.updateCard(data, this.queryId()).subscribe({
        next: (response) => {
          this.alertService.showAlert('Se ha actualizado la transacción correctamente', 'success');
          //console.log('OK:', response);
          this.router.navigate(['/my_cards']);
        },
        error: (err) => {
          this.alertService.showAlert('Hubo un problema al actualizar la transacción. Intente de nuevo', 'error');
          //console.error('Error:', err);
        }
      });
      return;
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
