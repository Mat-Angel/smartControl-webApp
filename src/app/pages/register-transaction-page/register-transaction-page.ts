import { Component, inject, signal, effect, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { TransactionsDataService } from '../../services/transactions-data.service';
import { PeriodType, Transactions, PaymentType } from '../../interfaces/transactions.interface';
import { NgxMaskDirective } from 'ngx-mask';
import { FormTextHelperComponent } from "@shared/form-text-helper/form-text-helper.component";
import { AlertService } from '@shared/alert-message/alert.service';
import { Utils } from '../../utils/utils';
import { FormUtils } from '../../utils/form-utils';
import { AuthService } from '../../auth/services/auth.service';
import { finalize, map, of, switchMap, tap } from 'rxjs';
import { PaymentMethod } from '@interfaces/payment-methods.interface';
import { LoadingScreenService } from '@shared/loading-screen/loading-screen.service';
import { toSignal } from '@angular/core/rxjs-interop';


@Component({
  selector: 'app-register-transaction-page',
  imports: [ReactiveFormsModule, RouterLink, NgxMaskDirective, FormTextHelperComponent],
  templateUrl: './register-transaction-page.html',
})
export default class RegisterTransaction implements AfterViewInit {
  private fb = inject(FormBuilder);
  private transactionsDataService = inject(TransactionsDataService);
  private alertService = inject(AlertService);
  private loadingScreenService = inject(LoadingScreenService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  readonly utils = Utils;
  readonly formUtils = FormUtils

  paymentPlanSelected = signal<string | null>(null);

  installments = [3, 6, 12, 18, 24, 36, 48, 60] as const;

  cardsData = signal<PaymentMethod[]>([]);
  filteredCardsData = signal<PaymentMethod[]>([]);

  availablePaymentTypes = signal<PaymentType[]>([]);
  availableBanks = signal<string[]>([]);
  availableCards = signal<string[]>([]);

  queryId = toSignal(this.activatedRoute.params.pipe(map(params => params['id'])));
  movementData = signal<Transactions | null>(null);

  transactionForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.pattern(FormUtils.alphanumericAndSpacesPattern), Validators.maxLength(20)]],
    description: ['', [Validators.required, Validators.pattern(FormUtils.alphanumericAndSpacesPattern), Validators.maxLength(50)]],
    amount: ['', [Validators.required, Validators.min(0.01), Validators.maxLength(14)]],
    transactionType: ['', [Validators.required]],
    category: ['', [Validators.required]],
    operationDate: [this.utils.currentDate],
  });

  periodicityForm: FormGroup = this.fb.group({
    hasPeriodicity: [false],
    isActive: [null],
    paymentPlanType: [{ value: '', disabled: true }],
    periodicity: [''],
    startDatePeriodicity: [this.utils.currentDate],
    every: [''],
    totalInstallment: [''],
    currentInstallment: [''],
  });

  paymentInfoForm: FormGroup = this.fb.group({
    paymentType: ['', [Validators.required]],
    bankName: [{ value: '', disabled: true }, [Validators.required]],
    paymentTitle: [{ value: '', disabled: true }, [Validators.required]]
  });


  ngAfterViewInit(): void {
    if (this.queryId()) {
      this.loadTransactionById(this.queryId());
    }
  }

  onChangePeriodicityToggle(value: boolean) {
    this.periodicityForm.get('paymentPlanType')?.enable();

    if (!value) {
      this.periodicityForm.reset({ paymentPlanType: '' });
      this.periodicityForm.get('paymentPlanType')?.disable();
    }
  };

  onFormChanged = effect((onCleanup) => {
    const paymentSubscription = this.onPaymentChanged();
    const bankSubscription = this.onBankChanged();

    onCleanup(() => {
      paymentSubscription.unsubscribe();
      bankSubscription.unsubscribe();
    })
  })

  onPaymentChanged() {
    return this.paymentInfoForm.get('paymentType')!.valueChanges
      .pipe(
        tap(() => {
          this.paymentInfoForm.get('bankName')!.setValue('');
          this.paymentInfoForm.get('paymentTitle')!.setValue('');
          this.paymentInfoForm.get('paymentTitle')!.disable()
        }),
      )
      .subscribe((value) => {
        if (value) {
          this.paymentInfoForm.get('bankName')?.enable();
          this.filteredCardsData.set(this.cardsData().filter(m => m.accInfo.paymentType.includes(value)));
          this.availableBanks.set([...new Set(this.filteredCardsData().flatMap(m => m.accInfo.bankName))]);
        }
      });
  }

  onBankChanged() {
    return this.paymentInfoForm.get('bankName')!.valueChanges
      .pipe(
        tap(() => {
          this.paymentInfoForm.get('paymentTitle')!.setValue('');
        }),
      )
      .subscribe((value) => {
        if (value) {
          this.paymentInfoForm.get('paymentTitle')?.enable();
          const filteredBanks = [...new Set(this.filteredCardsData().filter(m => m.accInfo.bankName.includes(value)))];
          this.availableCards.set([...new Set(filteredBanks.flatMap(m => m.accInfo.productName))]);
        }
      });
  }

loadTransactionById(movementId: string) {
  this.loadingScreenService.setLoadingState(true);

  this.transactionsDataService.getTransactionById(movementId).pipe(
    switchMap(tx => tx ? of(tx) : this.transactionsDataService.getPaymentById(movementId)),
    finalize(() => this.loadingScreenService.setLoadingState(false))
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

      this.movementData.set(resp);
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

  setFormsData(transactionData: Transactions) {
    this.transactionForm.get('title')!.setValue(transactionData?.title);
    this.transactionForm.get('description')!.setValue(transactionData?.description);
    this.transactionForm.get('amount')!.setValue(transactionData?.amount);
    this.transactionForm.get('transactionType')!.setValue(transactionData?.transactionType);
    this.transactionForm.get('category')!.setValue(transactionData?.category);
    this.transactionForm.get('operationDate')!.setValue(transactionData?.operationDate);

    this.periodicityForm.get('hasPeriodicity')!.setValue(transactionData?.periodicTransaction?.hasPeriodicity);
    this.onChangePeriodicityToggle(this.periodicityForm.get('hasPeriodicity')!.value);
    this.periodicityForm.get('paymentPlanType')!.setValue(transactionData?.periodicTransaction?.paymentPlanType ?? '');
    this.periodicityForm.get('isActive')!.setValue(transactionData?.periodicTransaction?.isActive);
    this.periodicityForm.get('periodicity')!.setValue(transactionData?.periodicTransaction?.periodicity);
    this.periodicityForm.get('startDatePeriodicity')!.setValue(transactionData?.periodicTransaction?.startDatePeriodicity);
    this.periodicityForm.get('every')!.setValue(transactionData?.periodicTransaction?.every);
    this.periodicityForm.get('totalInstallment')!.setValue(transactionData?.periodicTransaction?.installment.total);
    this.periodicityForm.get('currentInstallment')!.setValue(transactionData?.periodicTransaction?.installment.current);
    // this.paymentInfoForm.get('paymentType')!.setValue(transactionData?.paymentInfo.type);
    // this.paymentInfoForm.get('bankName')!.setValue(transactionData?.paymentInfo.bankName);
    // this.paymentInfoForm.get('paymentTitle')!.setValue(transactionData?.paymentInfo.title);
  }

  loadPaymentData() {
    if (this.availablePaymentTypes().length > 0) return;

    this.loadingScreenService.setLoadingState(true);
    this.transactionsDataService.loadCards(this.authService.token() ?? '', this.authService.userId() ?? '')
      .subscribe({
        next: (resp) => {
          this.cardsData.set(resp);
          this.availablePaymentTypes.set([...new Set(this.cardsData().flatMap(m => m.accInfo.paymentType))]);
          this.loadingScreenService.setLoadingState(false);

          if (this.availablePaymentTypes().length === 0) {
            this.paymentInfoForm.get('paymentType')?.markAsTouched();
            this.alertService.showAlert('No hay tarjetas registradas, registre un medio de pago', 'warning');
          }
        },
        error: () => {
          this.loadingScreenService.setLoadingState(false);
          this.alertService.showAlert('Hubo un problema al cargar la información. Intente de nuevo', 'error');
        }
      });
  }


  onSubmit() {
    this.transactionForm.markAllAsTouched();
    const isvalid = this.transactionForm.valid && this.periodicityForm.valid && this.paymentInfoForm.valid;
    if (!isvalid) return;

    const transactionData = this.transactionForm.value;
    const periodicityData = this.periodicityForm.value;
    const paymentInfoData = this.paymentInfoForm.value;

    const data: Transactions = {
      id: this.movementData() ? this.queryId() : '',
      title: transactionData?.title,
      description: transactionData?.description,
      amount: transactionData?.amount,
      transactionType: transactionData?.transactionType,
      category: transactionData?.category,
      operationDate: transactionData?.operationDate ? transactionData?.operationDate : this.utils.currentDate,

      periodicTransaction: {
        hasPeriodicity: periodicityData.hasPeriodicity,
        paymentPlanType: periodicityData.paymentPlanType,
        isActive: periodicityData.isActive,
        periodicity: periodicityData.periodicity,
        periodType: PeriodType.day,
        startDatePeriodicity: periodicityData.startDatePeriodicity,
        every: periodicityData.every,
        installment: {
          total: periodicityData.totalInstallment,
          current: periodicityData.currentInstallment
        }
      },
      paymentInfo: {
        bankName: paymentInfoData.bankName,
        title: paymentInfoData.paymentTitle,
        type: paymentInfoData.paymentType
      }
    }

    if (this.movementData()) {
      if (data.periodicTransaction?.hasPeriodicity) {
        this.transactionsDataService.updateAutomatedPayment(data, this.queryId()).subscribe({
          next: (response) => {
            this.alertService.showAlert('Se ha actualizado la transacción correctamente', 'success');
            //console.log('OK:', response);
            this.router.navigate(['/automated_payments']);
          },
          error: (err) => {
            this.alertService.showAlert('Hubo un problema al actualizar la transacción. Intente de nuevo', 'error');
            //console.error('Error:', err);
          }
        });
        return;
      }

      this.transactionsDataService.updateTransaction(data, this.queryId()).subscribe({
        next: (response) => {
          this.alertService.showAlert('Se ha actualizado la transacción correctamente', 'success');
          //console.log('OK:', response);
          this.router.navigate(['/movements']);
        },
        error: (err) => {
          this.alertService.showAlert('Hubo un problema al actualizar la transacción. Intente de nuevo', 'error');
          //console.error('Error:', err);
        }
      });
      return;
    }

    if (data.periodicTransaction?.hasPeriodicity) {
      this.transactionsDataService.saveAutomatedPayment(data).subscribe({
        next: (response) => {
          this.alertService.showAlert('Se ha guardado la transacción correctamente', 'success');
          //console.log('OK:', response);
          this.router.navigate(['/automated_payments']);
        },
        error: (err) => {
          this.alertService.showAlert('Hubo un problema al guardar la transacción. Intente de nuevo', 'error');
          //console.error('Error:', err);
        }
      });
      return;
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
  };

}
