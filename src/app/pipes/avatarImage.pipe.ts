import { Pipe, type PipeTransform } from '@angular/core';
import { environment } from '../../environments/environment';

const baseUrl = environment.gitRawUrl;

@Pipe({
  name: 'avatarImage',
})
export class AvatarImagePipe implements PipeTransform {

  transform(value: string | null):string {
    return value !== "" ? `${baseUrl}avatars/${value}.png` : `${baseUrl}avatars/no-image.png`
  }

}
