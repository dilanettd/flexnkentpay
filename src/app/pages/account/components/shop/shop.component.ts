import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { animate, style, transition, trigger } from '@angular/animations';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { SellerService } from '../../../../core/services/seller/seller.service';
import { ProductService } from '../../../../core/services/product/product.service';
import { OrderService } from '../../../../core/services/order/order.service';
import { IUser } from '../../../../core/models/auth.state.model';
import { ISeller, IUpdateShop } from '../../../../core/models/seller.model';
import { IProduct } from '../../../../core/models/product.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddProductComponent } from '../add-product/add-product.component';
import { ButtonSpinnerComponent } from '../../../../shared/components/button-spinner/button-spinner.component';
import { IOrder } from '../../../../core/models/order-model';
import { Router } from '@angular/router';
import { UpdateProductComponent } from '../update-product/update-product.component';

// Interfaces
interface Tab {
  id: string;
  name: string;
  icon: string;
}

interface CreateSellerData {
  name: string;
  location: string;
  contact_number: string;
  website_url?: string;
  description: string;
}

@Component({
  selector: 'flexnkentpay-shop',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonSpinnerComponent,
  ],
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate(
          '300ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '200ms ease-in',
          style({ opacity: 0, transform: 'translateY(-10px)' })
        ),
      ]),
    ]),
  ],
})
export class ShopComponent implements OnInit, OnDestroy {
  // ViewChild references for file inputs
  @ViewChild('logoInput') logoInput!: ElementRef<HTMLInputElement>;
  @ViewChild('coverInput') coverInput!: ElementRef<HTMLInputElement>;

  // Services injection
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private sellerService = inject(SellerService);
  private productService = inject(ProductService);
  private orderService = inject(OrderService);
  private toastr = inject(ToastrService);
  private modalService = inject(NgbModal);
  private router = inject(Router);

  // User and shop data
  me: IUser | null | undefined;
  shopData: ISeller | null = null;
  isUserSeller: boolean = false; // Indique si l'utilisateur est vendeur

  // Forms
  shopForm!: FormGroup;

  // Data collections
  availableCategories = [
    { id: 1, name: 'Électronique' },
    { id: 2, name: 'Vêtements' },
    { id: 3, name: 'Maison' },
    { id: 4, name: 'Beauté' },
    { id: 5, name: 'Sports' },
  ];

  selectedCategories: number[] = [];
  products: IProduct[] = [];
  orders: IOrder[] = [];
  latestOrders: IOrder[] = [];

  // File uploads
  selectedLogoFile: File | null = null;
  selectedCoverFile: File | null = null;

  // UI states
  activeTab: string = 'products';
  isLoading = false;
  isSubmitting = false;

  // Subscription management
  private subscriptions: Subscription = new Subscription();

  // Tabs configuration
  tabs: Tab[] = [
    {
      id: 'orders',
      name: 'Commandes',
      icon: 'bi-cart',
    },
    {
      id: 'products',
      name: 'Produits',
      icon: 'bi-box',
    },
    {
      id: 'settings',
      name: 'Paramètres',
      icon: 'bi-gear',
    },
  ];

  ngOnInit(): void {
    this.initForms();
    this.loadUserData();
  }

  initForms(): void {
    // Shop form pour création et modification
    this.shopForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      location: ['', [Validators.required]],
      contact_number: ['', [Validators.required, Validators.minLength(9)]],
      website_url: [''],
      description: ['', [Validators.required, Validators.minLength(10)]],
      termsAccepted: [false, [Validators.requiredTrue]], // Uniquement pour création
    });
  }

  loadUserData(): void {
    const userSubscription = this.authService
      .getUser()
      .subscribe((user: IUser | null) => {
        this.me = user;

        // Vérifier si l'utilisateur est vendeur
        this.isUserSeller = user?.role === 'seller' && !!user.seller;

        if (this.isUserSeller && user?.seller) {
          this.shopData = user.seller;

          // Mettre à jour le formulaire avec les données existantes
          this.shopForm.patchValue({
            name: this.shopData.shop.name,
            location: this.shopData.shop.location,
            contact_number: this.shopData.shop.contact_number,
            website_url: this.shopData.shop.website_url,
            description: this.shopData.shop.description,
          });

          // Charger les données une fois que nous savons que l'utilisateur est vendeur
          this.loadProducts();
          this.loadOrders();
        }
      });

    this.subscriptions.add(userSubscription);
  }

  createSellerAccount(): void {
    if (this.shopForm.invalid) {
      Object.keys(this.shopForm.controls).forEach((field) => {
        const control = this.shopForm.get(field);
        control?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;

    const sellerData: CreateSellerData = {
      name: this.shopForm.value.name,
      location: this.shopForm.value.location,
      contact_number: this.shopForm.value.contact_number,
      website_url: this.shopForm.value.website_url,
      description: this.shopForm.value.description,
    };

    const createSellerSubscription = this.sellerService
      .updateShopDetails(sellerData)
      .subscribe({
        next: (response: any) => {
          this.authService.setUser(response);

          this.toastr.success('Votre boutique a été créée avec succès!');
          this.loadUserData();

          this.isSubmitting = false;
        },
        error: (error: any) => {
          const errorMessage =
            error.error?.message ||
            "Une erreur s'est produite lors de la création de votre boutique. Veuillez réessayer.";
          this.toastr.error(errorMessage);
          this.isSubmitting = false;
        },
      });

    this.subscriptions.add(createSellerSubscription);
  }

  loadProducts(): void {
    this.isLoading = true;

    const productsSubscription = this.productService
      .getUserProducts()
      .subscribe({
        next: (data) => {
          this.products = data;
          this.isLoading = false;
        },
        error: (error) => {
          this.toastr.error('Erreur lors du chargement des produits');
          this.isLoading = false;
        },
      });

    this.subscriptions.add(productsSubscription);
  }

  loadOrders(): void {
    this.isLoading = true;

    const ordersSubscription = this.orderService.getSellerOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.latestOrders = data.slice(0, 5); // Get only the 5 most recent orders
        this.isLoading = false;
      },
      error: (error) => {
        this.toastr.error('Erreur lors du chargement des commandes');
        this.isLoading = false;
      },
    });

    this.subscriptions.add(ordersSubscription);
  }

  // Logo and Cover Photo Management
  openLogoFileInput(): void {
    this.logoInput.nativeElement.click();
  }

  openCoverFileInput(): void {
    this.coverInput.nativeElement.click();
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedLogoFile = input.files[0];
      this.saveLogo();
    }
  }

  onCoverPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedCoverFile = input.files[0];
      this.saveCoverPhoto();
    }
  }

  saveLogo(): void {
    if (!this.selectedLogoFile) return;

    this.isSubmitting = true;
    const logoSubscription = this.sellerService
      .updateLogo(this.selectedLogoFile)
      .subscribe({
        next: (response) => {
          if (response && response.seller && response.seller.shop) {
            this.authService.setUser(response);
            if (this.shopData) {
              this.shopData.shop.logo_url = response.seller.shop.logo_url;
            }
            this.toastr.success('Logo mis à jour avec succès');
          }
          this.selectedLogoFile = null;
          this.isSubmitting = false;
        },
        error: (error) => {
          this.toastr.error('Erreur lors de la mise à jour du logo');
          this.isSubmitting = false;
        },
      });

    this.subscriptions.add(logoSubscription);
  }

  saveCoverPhoto(): void {
    if (!this.selectedCoverFile) return;

    this.isSubmitting = true;
    const coverSubscription = this.sellerService
      .updateCoverImage(this.selectedCoverFile)
      .subscribe({
        next: (response) => {
          if (response && response.seller && response.seller.shop) {
            this.authService.setUser(response);
            if (this.shopData) {
              this.shopData.shop.cover_photo_url =
                response.seller.shop.cover_photo_url;
            }
            this.toastr.success('Image de couverture mise à jour avec succès');
          }
          this.selectedCoverFile = null;
          this.isSubmitting = false;
        },
        error: (error) => {
          this.toastr.error(
            "Erreur lors de la mise à jour de l'image de couverture"
          );
          this.isSubmitting = false;
        },
      });

    this.subscriptions.add(coverSubscription);
  }

  // Shop Settings Management
  updateShopSettings(): void {
    if (this.shopForm.invalid) {
      Object.keys(this.shopForm.controls).forEach((field) => {
        const control = this.shopForm.get(field);
        control?.markAsTouched();
      });
      return;
    }

    if (
      window.confirm('Êtes-vous sûr de vouloir enregistrer ces modifications ?')
    ) {
      this.isSubmitting = true;
      const shopData: IUpdateShop = {
        name: this.shopForm.value.name,
        location: this.shopForm.value.location,
        contact_number: this.shopForm.value.contact_number,
        website_url: this.shopForm.value.website_url,
        description: this.shopForm.value.description,
      };

      const updateShopSubscription = this.sellerService
        .updateShopDetails(shopData)
        .subscribe({
          next: (response) => {
            this.authService.setUser(response);
            this.toastr.success(
              'Paramètres de la boutique mis à jour avec succès'
            );
            this.isSubmitting = false;
          },
          error: (error) => {
            this.toastr.error('Erreur lors de la mise à jour des paramètres');
            this.isSubmitting = false;
          },
        });

      this.subscriptions.add(updateShopSubscription);
    }
  }

  // Product Management
  openAddProductModal(): void {
    const modalRef = this.modalService.open(AddProductComponent);

    modalRef.closed.subscribe(() => {
      this.loadProducts();
    });
  }

  editProduct(product: IProduct): void {
    const modalRef = this.modalService.open(UpdateProductComponent);
    modalRef.componentInstance.product = product;

    // Réagir à la fermeture du modal
    modalRef.closed.subscribe((result) => {
      if (result === 'success') {
        this.loadProducts();
      }
    });
  }

  deleteProduct(productId: number): void {
    const confirmDelete = window.confirm(
      'Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.'
    );

    if (confirmDelete) {
      this.isSubmitting = true;

      this.productService.deleteProductById(productId).subscribe({
        next: () => {
          this.toastr.success('Produit supprimé avec succès');
          this.loadProducts();
          this.isSubmitting = false;
        },
        error: (error) => {
          this.toastr.error('Erreur lors de la suppression du produit');
          this.isSubmitting = false;
        },
      });
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
