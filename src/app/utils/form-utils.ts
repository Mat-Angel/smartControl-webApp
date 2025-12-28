import { AbstractControl, FormArray, FormGroup, ValidationErrors } from '@angular/forms';
import { PaymentPlan, PaymentType, Periodicity, TransactionType } from '@interfaces/transactions.interface';

export class FormUtils {
  // Expresiones regulares:
  static namePattern = '^([a-zA-Z]+) ([a-zA-Z]+)$';
  static emailPattern = '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$';
  static notOnlySpacesPattern = '^[a-zA-Z0-9]+$';
  static alphanumericPattern = '^[a-zA-Z0-9]+$';
  static alphanumericAndSpacesPattern = '^[a-zA-Z0-9 ÁÉÍÓÚáéíóúÜüÑñ]+$';

  //* Dentro de nuestra función se requerirá que se envie en los argumentos del formulario para poder tener control desde aqui:
  static isValidField(form: FormGroup, fieldName: string): boolean | null {
    return (form.controls[fieldName].errors && form.controls[fieldName].touched);
  }

  static getFieldError(form: FormGroup, fieldName: string): string | null {
    if (!form.controls[fieldName]) return null;
    const errors = form.controls[fieldName].errors ?? {};
    return FormUtils.getTextError(errors);
  }

  static isValidFieldInArray(formArray: FormArray, index: number) {
    return (formArray.controls[index].errors && formArray.controls[index].touched);
  }

  static getFieldErrorInArray(formArray: FormArray, index: number) {
    if (formArray.controls.length === 0) return null;
    const errors = formArray.controls[index].errors ?? {};
    return FormUtils.getTextError(errors);
  }

  static getTextError(errors: ValidationErrors) {
    for (const key of Object.keys(errors)) {
      switch (key) {
        case 'required':
          return 'Este campo es requerido.';

        case 'minlength':
          return `Mínimo de ${errors['minlength'].requiredLength} caracteres`;

        case 'maxlength':
          return `Has superado el límite de ${errors['maxlength'].requiredLength} caracteres`;

        case 'min':
          return `Valor mínimo de ${errors['min'].min}`;

        case 'email':
          return `Debe ingresar un email válido`;

        case 'emailTaken':
          return 'Correo electrónico ya ha sido registrado anteriormente';

        case 'invalidUser':
          return 'Nombre de usuario ya existe, intente con otro';

        case 'pattern':
          switch (errors['pattern'].requiredPattern) {
            case FormUtils.emailPattern:
              return 'El valor ingresado no es un email válido.';

            case FormUtils.namePattern:
              return 'Debe de ingresar un nombre y un apellido';

            case FormUtils.notOnlySpacesPattern:
              return 'Este campo debe contener solo de letras y números';

            case FormUtils.alphanumericAndSpacesPattern:
              return 'Este campo debe contener solo de letras y números';

            default:
              return 'Error de patron contra expresión regular';
          }

        default:
          return `Error de validación no controlado: ${key}`;
      }
    }
    return null;
  }

  static isFieldOneEqualFieldTwo(field1: string, field2: string): ValidationErrors | null {
    return (FormGroup: AbstractControl) => {
      const field1Value = FormGroup.get(field1)?.value;
      const field2Value = FormGroup.get(field2)?.value;
      return field1Value === field2Value ? null : { passwordsNotEqual: true };
    }
  }

  //* Validación asincrona
  static async checkingServerResponse(control: AbstractControl): Promise<ValidationErrors | null> {
    console.log('Validando con el servidor...');
    const formValue = control.value;
    if (formValue === 'hola@mundo.com') {
      return { emailTaken: true };
    }
    return null
  }


  //* Validación síncrona
  static validateUserName(control: AbstractControl): ValidationErrors | null {
    const UserNameValue = control.value;
    const invalidUserNames = ['gamerPro', 'noobMaster', 'mvpPlayer'];

    for (const user of invalidUserNames) {
      return user === UserNameValue ? { invalidUser: true } : null;
    }
    return null
  }


  static transactionTypeTranslations: Record<TransactionType, string> = {
    [TransactionType.outgoing]: 'gasto',
    [TransactionType.income]: 'ingreso'
  };

  static transactionTypeOptions = Object.values(TransactionType).map((value) => ({
    value,
    label: this.transactionTypeTranslations[value]
  }));


  static paymentPlanTranslations: Record<PaymentPlan, string> = {
    [PaymentPlan.recurringPayment]: 'Pago Automatico',
    [PaymentPlan.installment]: 'Pago a Meses'
  };

  static PaymentPlanOptions = Object.values(PaymentPlan).map((value) => ({
    value,
    label: this.paymentPlanTranslations[value]
  }));


  static periodicityTranslations: Record<Periodicity, string> = {
    [Periodicity.daily]: 'día',
    [Periodicity.weekly]: 'semana',
    [Periodicity.biweekly]: 'quincena',
    [Periodicity.monthly]: 'mes',
    [Periodicity.bimonthly]: 'bimestre',
    [Periodicity.quarterly]: 'cuatrimestre',
    [Periodicity.semiannual]: 'semestre',
    [Periodicity.annual]: 'año'
  };

  static periodicityOptions = Object.values(Periodicity).map((value) => ({
    value,
    label: this.periodicityTranslations[value]
  }));


  static paymentTypeTranslations: Record<PaymentType, string> = {
    [PaymentType.debit]: 'débito',
    [PaymentType.credit]: 'crédito'
  };

  static PaymentTypeOptions = Object.values(PaymentType).map((value) => ({
    value,
    label: this.paymentTypeTranslations[value]
  }));

}

