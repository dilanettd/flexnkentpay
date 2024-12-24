import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './core/layouts/footer/footer.component';
import { HeaderComponent } from './core/layouts/header/header.component';
import { Router, NavigationEnd } from '@angular/router';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { AccountConfirmationComponent } from './pages/account-confirmation/account-confirmation.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    FooterComponent,
    HeaderComponent,
    NotFoundComponent,
    AccountConfirmationComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  showNotFound: boolean = false;
  showConfirmPage: boolean = false;

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.showNotFound = this.router.url === '/not-found';
        this.showConfirmPage = this.router.url === '/account/verify';
        window.scrollTo(0, 0);
      }
    });
  }
}
