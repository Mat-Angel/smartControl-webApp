import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AlertMessage } from "@shared/alert-message/alert-message";
import { LoadingScreen } from "@shared/loading-screen/loading-screen";
import { SmartControlNabvarComponent } from "./components/smart-control-nabvar/smart-control-nabvar.component";


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AlertMessage, LoadingScreen, SmartControlNabvarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('smartControl-webapp');
}
