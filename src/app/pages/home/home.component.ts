import { Component, inject, OnInit } from '@angular/core';
import { tns } from 'tiny-slider/src/tiny-slider';
import { ProductService } from '../../core/services/product/product.service';
import { IProduct } from '../../core/models/product.model';
import { CommonModule } from '@angular/common';
import { IShop } from '../../core/models/seller.model';
import { SellerService } from '../../core/services/seller/seller.service';
import { RouterLink } from '@angular/router';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { forkJoin, map, Observable, switchMap } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslationService } from '../../core/services/translation/translation.service';

export interface TopCategory {
  category: string;
  product_count: number;
  products?: IProduct[];
}

interface CategoryProductResult {
  category: string;
  products: IProduct[];
}

interface HeroSlide {
  image: string;
  titleKey: string;
  subtitleKey: string;
  buttonTextKey: string;
  buttonLink: string;
}

@Component({
  selector: 'flexnkentpay-home',
  standalone: true,
  imports: [CommonModule, RouterLink, CarouselModule, TranslateModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  recentProducts: IProduct[] = [];
  topRatedShops: IShop[] = [];
  topCategories: TopCategory[] = [];
  isLoading = true;
  activeTabIndex = 0; // Pour le système d'onglets des catégories
  currentLang = 'fr';

  heroSlides: HeroSlide[] = [
    {
      image: 'assets/images/hero/slider-bg1.jpg',
      titleKey: 'HOME.HERO.SLIDE1.TITLE',
      subtitleKey: 'HOME.HERO.SLIDE1.SUBTITLE',
      buttonTextKey: 'HOME.HERO.SLIDE1.BUTTON',
      buttonLink: '/products',
    },
    {
      image: 'assets/images/hero/slider-bg2.jpg',
      titleKey: 'HOME.HERO.SLIDE2.TITLE',
      subtitleKey: 'HOME.HERO.SLIDE2.SUBTITLE',
      buttonTextKey: 'HOME.HERO.SLIDE2.BUTTON',
      buttonLink: '/products',
    },
    {
      image: 'assets/images/hero/slider-bg3.jpg',
      titleKey: 'HOME.HERO.SLIDE3.TITLE',
      subtitleKey: 'HOME.HERO.SLIDE3.SUBTITLE',
      buttonTextKey: 'HOME.HERO.SLIDE3.BUTTON',
      buttonLink: '/contact',
    },
  ];

  customOptions: OwlOptions = {
    autoWidth: true,
    loop: true,
    center: false,
    margin: 20,
    nav: true,
    navText: [],
    dots: false,
    smartSpeed: 400,
    autoplay: true,
    autoplayTimeout: 15000,
    autoplayHoverPause: true,
    responsive: {
      0: { items: 1, nav: true },
      576: { items: 2, nav: true },
      768: { items: 3, nav: true },
      992: { items: 3, nav: true },
      1200: { items: 4 },
      1800: { items: 6 },
    },
  };

  private productService = inject(ProductService);
  private sellerService = inject(SellerService);
  private translateService = inject(TranslateService);
  private translationService = inject(TranslationService);

  ngOnInit(): void {
    this.isLoading = true;

    // S'abonner aux changements de langue
    this.translationService.currentLang$.subscribe((lang) => {
      this.currentLang = lang;
    });

    // Get recent products
    this.productService.getRecentProducts().subscribe({
      next: (products: IProduct[]) => {
        this.recentProducts = products;
      },
      error: (error: any) => {
        console.error('Error fetching recent products:', error);
      },
    });

    // Get top rated shops
    this.sellerService.getTopRatedShops().subscribe({
      next: (shops: IShop[]) => {
        this.topRatedShops = shops;
      },
      error: (error: any) => {
        console.error('Error fetching top rated shops:', error);
      },
    });

    // Get top categories with products in a single request
    this.productService.getTopCategoriesWithProducts(5, 10).subscribe({
      next: (categoriesWithProducts: TopCategory[]) => {
        this.topCategories = categoriesWithProducts;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error fetching top categories with products:', error);
        this.isLoading = false;
      },
    });
  }

  ngAfterViewInit(): void {
    // Initialize hero slider
    tns({
      container: '.hero-slider',
      items: 1,
      slideBy: 'page',
      autoplay: true,
      autoplayButtonOutput: false,
      mouseDrag: true,
      gutter: 0,
      nav: true,
      controls: true,
      controlsText: ['<i ></i>', '<i ></i>'],
    });
  }
}
