import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink],
  templateUrl: './home-page.html',
})
export default class HomePage {
  baseUrl = environment.gitRawUrl;
}
