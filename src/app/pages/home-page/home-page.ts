import { Component, inject } from '@angular/core';
import { RouterLink } from "@angular/router";
import { environment } from '../../../environments/environment';
import { IconsService } from '@services/icons.service';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink],
  templateUrl: './home-page.html',
})
export default class HomePage {
  iconsService = inject(IconsService);
  baseUrl = environment.gitRawUrl;
}
