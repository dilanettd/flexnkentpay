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

// Définir les interfaces pour les types complexes
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
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
}

@Component({
  selector: 'flexnkentpay-home',
  standalone: true,
  imports: [CommonModule, RouterLink, CarouselModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  recentProducts: IProduct[] = [];
  topRatedShops: IShop[] = [];
  topCategories: TopCategory[] = [];
  isLoading = true;
  activeTabIndex = 0; // Pour le système d'onglets des catégories

  heroSlides: HeroSlide[] = [
    {
      image: 'assets/images/hero/slider-bg1.jpg',
      title: 'Transform Your Payment Habits',
      subtitle:
        'Explore our innovative payment solutions that simplify and enhance your financial operations, ensuring seamless and secure transactions',
      buttonText: 'Shop Now',
      buttonLink: '/products',
    },
    {
      image: 'assets/images/hero/slider-bg2.jpg',
      title: 'Shop Now, Pay Later',
      subtitle:
        'Enjoy the flexibility of installment payments on all your favorite products',
      buttonText: 'Explore Products',
      buttonLink: '/products',
    },
    {
      image: 'assets/images/hero/slider-bg3.jpg',
      title: 'Secure & Reliable Shopping',
      subtitle:
        'Experience safe transactions and trusted vendors for all your shopping needs',
      buttonText: 'Learn More',
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

  ngOnInit(): void {
    this.isLoading = true;

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
