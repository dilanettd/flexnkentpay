import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { tns } from 'tiny-slider/src/tiny-slider';
import { ProductService } from '../../core/services/product/product.service';
import { IProduct } from '../../core/models/product.model';
import { CommonModule } from '@angular/common';
import { IShop } from '../../core/models/seller.model';
import { SellerService } from '../../core/services/seller/seller.service';
import { RouterLink } from '@angular/router';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'flexnkentpay-home',
  standalone: true,
  imports: [CommonModule, RouterLink, CarouselModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements AfterViewInit, OnInit {
  recentProducts: IProduct[] = [];
  topRatedShops: IShop[] = [];
  customOptions: OwlOptions = {
    autoWidth: true,
    loop: true,
    center: false,

    margin: 10,
    nav: true,
    navText: [
      '<i class="lni  lni-chevron-left"></i>',
      '<i class="lni lni-chevron-right"></i>',
    ],
    dots: false,
    smartSpeed: 400,
    autoplay: true,
    autoplayTimeout: 15000,

    autoplayHoverPause: true,

    responsive: {
      0: {
        items: 1,
        nav: true,
      },
      576: {
        items: 2,
        nav: true,
      },
      768: {
        items: 3,
        nav: true,
      },
      992: {
        items: 3,
        nav: true,
      },
      1200: {
        items: 4,
      },
      1800: {
        items: 6,
      },
    },
  };

  private productService = inject(ProductService);
  private sellerService = inject(SellerService);

  ngOnInit(): void {
    this.productService.getRecentProducts().subscribe({
      next: (products) => {
        this.recentProducts = products;
      },
      error: (error) => {
        console.error(
          'Erreur lors de la récupération des produits récents:',
          error
        );
      },
    });

    this.sellerService.getTopRatedShops().subscribe({
      next: (shops) => {
        this.topRatedShops = shops;
      },
      error: (error) => {
        console.error(
          'Erreur lors de la récupération des shops les mieux notés:',
          error
        );
      },
    });
  }

  ngAfterViewInit(): void {
    tns({
      container: '.hero-slider',
      slideBy: 'page',
      autoplay: true,
      autoplayButtonOutput: false,
      mouseDrag: true,
      gutter: 0,
      items: 1,
      nav: false,
      controls: true,
      controlsText: [
        '<i class="bi bi-chevron-left"></i>',
        '<i class="bi bi-chevron-right"></i>',
      ],
    });

    //======== Brand Slider
    tns({
      container: '.brands-logo-carousel',
      autoplay: true,
      autoplayButtonOutput: false,
      mouseDrag: true,
      gutter: 15,
      nav: false,
      controls: false,
      responsive: {
        0: {
          items: 1,
        },
        540: {
          items: 3,
        },
        768: {
          items: 5,
        },
        992: {
          items: 6,
        },
      },
    });
  }
}
