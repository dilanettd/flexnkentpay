import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  EMPTY,
  Subscription,
  catchError,
  finalize,
  switchMap,
  tap,
} from 'rxjs';

import { ProductService } from '../../core/services/product/product.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { IProduct, IProductReview } from '../../core/models/product.model';
import { ReviewProductComponent } from '../../shared/components/review-product/review-product.component';
import { LoginModalComponent } from '../../shared/components/login-modal/login-modal.component';
import { ConfirmOrderComponent } from './components/confirm-order/confirm-order.component';
import { ShareBarCodeModalComponent } from '../../shared/components/share-bar-code-modal/share-bar-code-modal.component';
import { QRCodeModule } from 'angularx-qrcode';

@Component({
  selector: 'flexnkentpay-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, QRCodeModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
})
export class ProductDetailComponent implements OnInit {
  private productService = inject(ProductService);
  private modalService = inject(NgbModal);
  private route = inject(ActivatedRoute);
  private toastr = inject(ToastrService);
  private authService = inject(AuthService);
  private metaService = inject(Meta);
  private titleService = inject(Title);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  product = signal<IProduct | null>(null);
  productId = signal<number | null>(null);
  quantity = signal<number>(1);
  selectedImageUrl = signal<string>('');
  productReviews = signal<IProductReview[]>([]);
  isLoading = signal<boolean>(false);
  socialShareUrls = signal<{ [key: string]: string }>({});

  private subscription = new Subscription();

  ngOnInit(): void {
    const sub = this.route.params
      .pipe(
        switchMap((params) => {
          const id = +params['id'];
          if (!id) {
            this.toastr.error('Invalid product ID');
            this.router.navigate(['/']);
            return EMPTY;
          }

          this.productId.set(id);
          this.isLoading.set(true);

          this.getProductReviews(id);
          this.incrementShopVisit(id);

          return this.productService.getProductById(id).pipe(
            catchError((error) => {
              this.toastr.error('Failed to load product details');
              console.error('Error loading product:', error);
              return EMPTY;
            }),
            finalize(() => this.isLoading.set(false))
          );
        })
      )
      .subscribe((product) => {
        if (product) {
          this.product.set(product);
          if (product.images?.length > 0) {
            this.selectedImageUrl.set(product.images[0].image_url);
          }
          this.updateMetaTags();
          this.updateSocialShareUrls();
        }
      });

    this.destroyRef.onDestroy(() => {
      sub.unsubscribe();
    });
  }

  review(): void {
    if (this.authService.isAuthenticate()) {
      const id = this.productId();
      if (!id) return;

      const modalRef = this.modalService.open(ReviewProductComponent);
      modalRef.componentInstance.productId = id;

      modalRef.componentInstance.reviewSubmitted?.subscribe(() => {
        this.getProductReviews(id);
      });
    } else {
      this.toastr.error('You must be logged in to leave a review');
      this.modalService.open(LoginModalComponent);
    }
  }

  getProductReviews(productId: number): void {
    this.productService
      .getProductReviews(productId)
      .pipe(
        catchError((error) => {
          console.error('Error fetching reviews', error);
          return EMPTY;
        })
      )
      .subscribe((reviews) => {
        this.productReviews.set(reviews || []);
      });
  }

  updateMetaTags(): void {
    const currentProduct = this.product();
    if (!currentProduct) return;

    const baseUrl = window.location.origin;
    const id = this.productId();
    const shareUrl = `${baseUrl}/product/${id}`;
    const productName = currentProduct.name || 'Product Details';
    const productDescription = currentProduct.description || '';
    const productImage = currentProduct.images?.[0]?.image_url || '';
    const productPrice = currentProduct.price
      ? `${currentProduct.price} ${currentProduct.currency}`
      : '';

    this.titleService.setTitle(productName);

    // Open Graph meta tags (Facebook, LinkedIn)
    this.metaService.updateTag({ property: 'og:title', content: productName });
    this.metaService.updateTag({
      property: 'og:description',
      content: `${productDescription.substring(0, 150)}${
        productDescription.length > 150 ? '...' : ''
      } - ${productPrice}`,
    });
    this.metaService.updateTag({ property: 'og:image', content: productImage });
    this.metaService.updateTag({ property: 'og:url', content: shareUrl });
    this.metaService.updateTag({ property: 'og:type', content: 'product' });
    this.metaService.updateTag({
      property: 'og:site_name',
      content: 'FlexnKentPay',
    });

    // Twitter meta tags
    this.metaService.updateTag({ name: 'twitter:title', content: productName });
    this.metaService.updateTag({
      name: 'twitter:description',
      content: `${productDescription.substring(0, 150)}${
        productDescription.length > 150 ? '...' : ''
      } - ${productPrice}`,
    });
    this.metaService.updateTag({
      name: 'twitter:image',
      content: productImage,
    });
    this.metaService.updateTag({
      name: 'twitter:card',
      content: 'summary_large_image',
    });

    // Product specific meta tags
    if (currentProduct.brand) {
      this.metaService.updateTag({
        property: 'product:brand',
        content: currentProduct.brand,
      });
    }
    this.metaService.updateTag({
      property: 'product:price:amount',
      content: currentProduct.price.toString(),
    });
    this.metaService.updateTag({
      property: 'product:price:currency',
      content: currentProduct.currency,
    });
    this.metaService.updateTag({
      property: 'product:availability',
      content: currentProduct.stock_quantity > 0 ? 'in stock' : 'out of stock',
    });
  }

  updateSocialShareUrls(): void {
    const currentProduct = this.product();
    if (!currentProduct) return;

    const baseUrl = window.location.origin;
    const id = this.productId();
    const shareUrl = `${baseUrl}/product/${id}`;
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(currentProduct.name || '');
    const encodedDescription = encodeURIComponent(
      `${currentProduct.description?.substring(0, 150) || ''} - ${
        currentProduct.price
      } ${currentProduct.currency}`
    );
    const encodedImage = currentProduct.images?.[0]?.image_url
      ? encodeURIComponent(currentProduct.images[0].image_url)
      : '';

    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20-%20${encodedUrl}`,
      pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImage}&description=${encodedTitle}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
      copy: shareUrl,
      qrcode: currentProduct.product_code_url || '',
    };

    this.socialShareUrls.set(urls);
  }

  shareProduct(platform: string): void {
    const urls = this.socialShareUrls();
    const shareUrl = urls[platform] || '';

    if (!shareUrl) {
      this.toastr.error('Share URL not available');
      return;
    }

    if (platform === 'copy') {
      this.copyToClipboard(shareUrl);
    } else if (platform === 'qrcode') {
      this.shareProductBarcode();
    } else {
      window.open(shareUrl, '_blank');
    }
  }

  // Méthode alternative pour copier dans le presse-papiers sans utiliser ClipboardService
  copyToClipboard(text: string): void {
    // Création d'un élément textarea temporaire
    const textArea = document.createElement('textarea');
    textArea.value = text;

    // Le textArea doit être dans le DOM mais invisible
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);

    textArea.focus();
    textArea.select();

    try {
      // Exécution de la commande de copie
      const successful = document.execCommand('copy');
      if (successful) {
        this.toastr.success('Lien copié dans le presse-papiers');
      } else {
        this.toastr.error('Échec de la copie');
      }
    } catch (err) {
      this.toastr.error('Erreur lors de la copie du lien');
      console.error('Erreur lors de la copie:', err);
    }

    // Nettoyage
    document.body.removeChild(textArea);
  }

  shareProductBarcode(): void {
    const currentProduct = this.product();
    if (!currentProduct || !currentProduct.product_code_url) {
      this.toastr.error('Code-barres non disponible');
      return;
    }

    // Créer une modal pour afficher et partager le code-barres
    const modalRef = this.modalService.open(ShareBarCodeModalComponent, {
      centered: true,
    });
    modalRef.componentInstance.productName = currentProduct.name;
    modalRef.componentInstance.barcodeUrl = currentProduct.product_code_url;
    modalRef.componentInstance.productCode = currentProduct.product_code;
    modalRef.componentInstance.productId = this.productId();
  }

  incrementShopVisit(productId: number): void {
    const visitorKey = `product_visited_${productId}`;
    if (!localStorage.getItem(visitorKey)) {
      this.productService
        .incrementViewsProduct(productId)
        .pipe(
          catchError((error) => {
            console.error('Error incrementing product visit count', error);
            return EMPTY;
          })
        )
        .subscribe(() => {
          localStorage.setItem(visitorKey, 'true');
        });
    }
  }

  onThumbnailClick(imageUrl: string): void {
    if (imageUrl) {
      this.selectedImageUrl.set(imageUrl);
    }
  }

  navigateToShop(): void {
    const shopId = this.product()?.shop_id;
    if (shopId) {
      this.router.navigate(['/shop', shopId]);
    } else {
      this.toastr.warning('Shop information is not available');
    }
  }

  openOrderModal(): void {
    if (this.authService.isAuthenticate()) {
      const currentProduct = this.product();
      const id = this.productId();

      if (!currentProduct || !id) {
        this.toastr.error('Product information is incomplete');
        return;
      }

      const modalRef = this.modalService.open(ConfirmOrderComponent);
      modalRef.componentInstance.productId = id;
      modalRef.componentInstance.quantity = this.quantity();
      modalRef.componentInstance.price = currentProduct.price || 0;
      modalRef.componentInstance.totalAmount =
        (currentProduct.price || 0) * this.quantity();
    } else {
      this.toastr.error('You must be logged in to place an order');
      this.modalService.open(LoginModalComponent);
    }
  }

  updateQuantity(value: number): void {
    this.quantity.set(value);
  }
}
