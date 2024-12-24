import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../core/services/product/product.service';
import { IProduct, IProductReview } from '../../core/models/product.model';
import { CommonModule } from '@angular/common';
import { ReviewProductComponent } from '../../shared/components/review-product/review-product.component';
import { Meta, Title } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../core/services/auth/auth.service';
import { LoginModalComponent } from '../../shared/components/login-modal/login-modal.component';

@Component({
  selector: 'flexnkentpay-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
})
export class ProductDetailComponent implements OnInit {
  product!: IProduct;
  productId!: number;
  selectedImageUrl!: string;
  public productReviews: IProductReview[] = [];

  constructor(
    private productService: ProductService,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private authService: AuthService,
    private metaService: Meta,
    private titleService: Title,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.productId = +params['id'];
      if (this.productId) {
        this.loadProduct(this.productId);
        this.getProductReviews(this.productId);
        this.incrementShopVisit(this.productId);
      }
    });
  }

  private loadProduct(id: number): void {
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.product = product;
        this.selectedImageUrl = product.images[0].image_url;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du produit :', error);
      },
    });
  }

  review() {
    if (this.authService.isAuthenticate()) {
      const modalRef = this.modalService.open(ReviewProductComponent);
      modalRef.componentInstance.productId = this.productId;

      modalRef.componentInstance.reviewSubmitted.subscribe(() => {
        this.getProductReviews(this.productId);
      });
    } else {
      this.toastr.error('Vous devez être connecté pour laisser un avis.');
      this.modalService.open(LoginModalComponent);
    }
  }

  // Fetch product reviews
  getProductReviews(shopId: number) {
    this.productService.getProductReviews(shopId).subscribe(
      (reviews) => {
        this.productReviews = reviews;
      },
      (error) => {
        console.error('Error fetching reviews', error);
      }
    );
  }

  updateMetaTags(): void {
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/product/${this.productId}`;

    // Update page title
    this.titleService.setTitle(this.product.name || 'Shop Details');

    // Update Open Graph meta tags
    this.metaService.updateTag({
      property: 'og:title',
      content: this.product.name || '',
    });
    this.metaService.updateTag({
      property: 'og:description',
      content: this.product.description || '',
    });
    this.metaService.updateTag({
      property: 'og:image',
      content: this.product.images[0].image_url || '',
    });
    this.metaService.updateTag({ property: 'og:url', content: shareUrl });

    // Update Twitter card meta tags
    this.metaService.updateTag({
      name: 'twitter:title',
      content: this.product.name || '',
    });
    this.metaService.updateTag({
      name: 'twitter:description',
      content: this.product.description || '',
    });
    this.metaService.updateTag({
      name: 'twitter:image',
      content: this.product.images[0].image_url || '',
    });
    this.metaService.updateTag({
      name: 'twitter:card',
      content: 'summary_large_image',
    });
  }

  generateShareUrl(platform: string): string {
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/product/${this.productId}`;
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(this.product.name || '');
    const encodedDescription = encodeURIComponent(
      this.product.description || ''
    );
    const imageUrl = encodeURIComponent(this.product.images[0].image_url || '');

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

  incrementShopVisit(productId: number) {
    const visitorKey = `product_visited_${this.productId}`;
    if (!localStorage.getItem(visitorKey)) {
      this.productService.incrementViewsProduct(productId).subscribe(
        () => {
          localStorage.setItem(visitorKey, 'true');
        },
        (error) => {
          console.error('Error incrementing shop visit', error);
        }
      );
    }
  }

  onThumbnailClick(imageUrl: string): void {
    this.selectedImageUrl = imageUrl;
  }

  navigateToShop(): void {
    if (this.product?.shop_id) {
      this.router.navigate(['/shop', this.product.shop_id]);
    }
  }
}
