import { Component, inject } from '@angular/core';

import { AvatarImagePipe } from '../../pipes/avatarImage.pipe';
import { AuthService } from '../../auth/services/auth.service';
import { NavigationService } from '@services/navigation.service';

@Component({
  selector: 'profile-info',
  imports: [ AvatarImagePipe],
  templateUrl: './profile-info.component.html',
})
export class ProfileInfoComponent {
  authService = inject(AuthService);
  navigationService = inject(NavigationService);

}
