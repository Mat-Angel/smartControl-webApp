import { booleanAttribute, Component, input } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'avatar-card',
  imports: [],
  templateUrl: './avatar-card.component.html',
})
export class AvatarCardComponent {
  baseUrl = environment.gitRawUrl;

  name = input.required();
  avatarId = input.required();
  description = input.required();
  deferDescription = input<string | null>(null);
  lockedCard = input(false, { transform: booleanAttribute });

}
