import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  // Angular 10
  // helloSourceFromJS = $localize `Hello source from JS`;
  // helloKeyFromJS = $localize`:@@TIO_MYAPP_HelloKeyJS: Hello key from JS`;

  minutes = 2;
  gender = 'male'
}
