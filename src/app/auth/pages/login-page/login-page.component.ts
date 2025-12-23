import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormUtils } from '../../../utils/form-utils';

import { EncryptionService } from '../../services/encryption.service';
import { AlertService } from '@shared/alert-message/alert.service';
import { AuthService } from '../../services/auth.service';
import { NavigationService } from '@services/navigation.service';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule],
  templateUrl: './login-page.component.html',
})
export class LoginPageComponent {
  private alertService = inject(AlertService);
  encryptionService = inject(EncryptionService);
  authService = inject(AuthService);
  fb = inject(FormBuilder);
  private navigationService = inject(NavigationService);
  formUtils = FormUtils;

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.pattern(FormUtils.emailPattern)]],
    password: ['', [Validators.required]]
  })


  onSubmit() {
    if (this.loginForm.invalid) {
      this.alertService.showAlert('Datos ingresados incorrectos')
    }

    const { email = '', password = '' } = this.loginForm.value;
    this.authService.login(email, password).
      then(() => {
        console.log("Inicio de sesion exitoso");
        this.alertService.showAlert('Inicio de sesion exitoso', 'success');
        this.navigationService.redirectToOrigin();
      })
      .catch((err) => {
        console.error("Error en Inicio de sesion:") //, err)
        this.alertService.showAlert('Error al iniciar sesion: Verifique email/contraseña', 'error');
    });
  }


}
