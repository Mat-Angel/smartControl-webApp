import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormUtils } from '../../../utils/form-utils';

import { EncryptionService } from '../../services/encryption.service';
import { AlertService } from '@shared/alert-message/alert.service';
import { AuthService } from '../../services/auth.service';
import { LoadingScreenService } from '@shared/loading-screen/loading-screen.service';
import { Router } from '@angular/router';
import { IconsService } from '@services/icons.service';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule],
  templateUrl: './login-page.component.html',
})
export class LoginPageComponent {
  private alertService = inject(AlertService);
  private loadingScreenService = inject(LoadingScreenService);
  encryptionService = inject(EncryptionService);
  authService = inject(AuthService);
  iconsService = inject(IconsService);
  fb = inject(FormBuilder);
  private router = inject(Router);
  formUtils = FormUtils;

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.pattern(FormUtils.emailPattern)]],
    password: ['', [Validators.required]]
  })


  onSubmit() {
    if (this.loginForm.invalid) {
      this.alertService.showAlert('Datos ingresados incorrectos')
    }
    this.loadingScreenService.setLoadingState(true)

    const { email = '', password = '' } = this.loginForm.value;
    this.authService.login(email, password).
    then(() => {
        this.loadingScreenService.setLoadingState(false)
        console.log("Inicio de sesion exitoso");
        this.alertService.showAlert('Inicio de sesion exitoso', 'success');
        this.router.navigate(['/movements']);      })
      .catch((err) => {
        this.loadingScreenService.setLoadingState(false)
        console.error("Error en Inicio de sesion:") //, err)
        this.alertService.showAlert('Error al iniciar sesion: Verifique email/contraseña', 'error');
    });
  }


}
