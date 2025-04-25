import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SellerService } from '../../core/services/seller/seller.service';
import { ProductService } from '../../core/services/product/product.service';
import { IShop } from '../../core/models/seller.model';
import { IProduct, IShopReview } from '../../core/models/product.model';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ReviewShopComponent } from '../../shared/components/review-shop/review-shop.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../core/services/auth/auth.service';
import { LoginModalComponent } from '../../shared/components/login-modal/login-modal.component';
import { Meta, Title } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'flexnkentpay-seller-details',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './seller-details.component.html',
  styleUrl: './seller-details.component.scss',
})
export class SellerDetailsComponent implements OnInit, OnDestroy {
  private shopId: any;
  public shop: IShop = {
    id: '',
    rating: 0,
  };
  public products: IProduct[] = [];
  public shopReviews: IShopReview[] = [];
  public isLoadingProducts: boolean = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private sellerService: SellerService,
    private productService: ProductService,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private authService: AuthService,
    private metaService: Meta,
    private titleService: Title,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    this.shopId = this.route.snapshot.paramMap.get('id');
    if (this.shopId) {
      this.getShopDetails();
      this.getShopProducts();
      this.getShopReviews(this.shopId);
      this.incrementShopVisit(this.shopId);
    }
  }

  getShopDetails() {
    const shopSubscription = this.sellerService
      .getShopById(this.shopId)
      .subscribe((shop) => {
        this.shop = shop;
        this.updateMetaTags();
      });
    this.subscriptions.push(shopSubscription);
  }

  getShopProducts() {
    this.isLoadingProducts = true;
    const productSubscription = this.productService
      .getProductsByShopId(this.shopId)
      .subscribe(
        (products) => {
          this.products = products;
          this.isLoadingProducts = false;
        },
        () => {
          this.isLoadingProducts = false;
        }
      );
    this.subscriptions.push(productSubscription);
  }

  review() {
    if (this.authService.isAuthenticate()) {
      const modalRef = this.modalService.open(ReviewShopComponent);
      modalRef.componentInstance.shopId = this.shopId;

      modalRef.componentInstance.reviewSubmitted.subscribe(() => {
        this.getShopReviews(this.shopId);
      });
    } else {
      this.toastr.error(
        this.translateService.instant('SHOP_DETAILS.REVIEWS.LOGIN_REQUIRED')
      );
      this.modalService.open(LoginModalComponent);
    }
  }

  incrementShopVisit(shopId: number) {
    const visitorKey = `shop_visited_${shopId}`;
    if (!localStorage.getItem(visitorKey)) {
      this.productService.incrementShopVisit(shopId).subscribe(
        () => {
          localStorage.setItem(visitorKey, 'true');
        },
        (error) => {
          console.error('Error incrementing shop visit', error);
        }
      );
    }
  }

  // Fetch shop reviews
  getShopReviews(shopId: number) {
    this.productService.getShopReviews(shopId).subscribe(
      (reviews) => {
        this.shopReviews = reviews;
      },
      (error) => {
        console.error('Error fetching reviews', error);
      }
    );
  }

  updateMetaTags(): void {
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/shop/${this.shopId}`;

    // Update page title
    this.titleService.setTitle(this.shop.name || 'Shop Details');

    // Update Open Graph meta tags
    this.metaService.updateTag({
      property: 'og:title',
      content: this.shop.name || '',
    });
    this.metaService.updateTag({
      property: 'og:description',
      content: this.shop.description || '',
    });
    this.metaService.updateTag({
      property: 'og:image',
      content: this.shop.cover_photo_url || '',
    });
    this.metaService.updateTag({ property: 'og:url', content: shareUrl });

    // Update Twitter card meta tags
    this.metaService.updateTag({
      name: 'twitter:title',
      content: this.shop.name || '',
    });
    this.metaService.updateTag({
      name: 'twitter:description',
      content: this.shop.description || '',
    });
    this.metaService.updateTag({
      name: 'twitter:image',
      content: this.shop.cover_photo_url || '',
    });
    this.metaService.updateTag({
      name: 'twitter:card',
      content: 'summary_large_image',
    });
  }

  generateShareUrl(platform: string): string {
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/shop/${this.shopId}`;
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(this.shop.name || '');
    const encodedDescription = encodeURIComponent(this.shop.description || '');
    const imageUrl = encodeURIComponent(this.shop.cover_photo_url || '');

    switch (platform) {
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`;
      case 'twitter':
        return `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
      case 'linkedin':
        return `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`;
      case 'whatsapp':
        return `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`;
      default:
        return shareUrl; // Fallback URL
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
