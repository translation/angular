import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  minutes = 0;
  gender = 'female';
  fly = true;
  logo = 'https://angular.io/assets/images/logos/angular/angular.png';
  name = 'Bob';
  friendNames = ['Patrick', 'Sandy'];
  items = ['book', 'glass', 'lamp'];

  localizedStrings = {
    'simple':           $localize `Text to be translated`,
    'onePlaceholder':   $localize `Hello ${this.name}.`,
    'twoPlaceholders':  $localize `You have two friends: ${this.friendNames[0]} & ${this.friendNames[1]}.`,
    'namedPlaceholder': $localize `There are ${this.items.length}:itemCount: items in your cart.`,
    'combination':      $localize `Hello ${this.name}. There are ${this.items.length}:itemCount: items in your cart.`
  };

  inc(i: number) {
    this.minutes = Math.min(5, Math.max(0, this.minutes + i));
  }
  male() { this.gender = 'male'; }
  female() { this.gender = 'female'; }
  other() { this.gender = 'other'; }
}

