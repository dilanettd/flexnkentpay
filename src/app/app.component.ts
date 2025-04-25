import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './core/layouts/footer/footer.component';
import { HeaderComponent } from './core/layouts/header/header.component';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from 'ngx-webstorage';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FooterComponent, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  isFullPageRoute: boolean = false;
  private readonly LANGUAGE_KEY = 'app_language';

  constructor(
    private router: Router,
    private translate: TranslateService,
    private localStorage: LocalStorageService
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isFullPageRoute =
          ['/not-found', '/account/verify', '/admin/login'].includes(
            this.router.url
          ) || this.router.url.startsWith('/admin');

        window.scrollTo(0, 0);
      }
    });

    // Initialisation des langues
    this.initializeLanguage();
  }

  ngOnInit(): void {}

  private initializeLanguage(): void {
    this.translate.addLangs(['fr', 'en']);

    this.translate.setDefaultLang('fr');
    const savedLang = this.localStorage.retrieve(this.LANGUAGE_KEY);

    if (savedLang && ['fr', 'en'].includes(savedLang)) {
      this.translate.use(savedLang);
    } else {
      this.translate.use('fr');
    }
  }
}
