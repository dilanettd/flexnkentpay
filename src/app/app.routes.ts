import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ProductListComponent } from './pages/product-list/product-list.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { AccountComponent } from './pages/account/account.component';
import { DashboardComponent } from './pages/account/components/dashboard/dashboard.component';
import { ProductsComponent } from './pages/account/components/products/products.component';
import { PurchasesComponent } from './pages/account/components/purchases/purchases.component';
import { ProfileComponent } from './pages/account/components/profile/profile.component';
import { KycComponent } from './pages/account/components/kyc/kyc.component';
import { OrdersComponent } from './pages/account/components/orders/orders.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { AccountConfirmationComponent } from './pages/account-confirmation/account-confirmation.component';
import { TermsAndConditionsComponent } from './pages/terms-and-conditions/terms-and-conditions.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { authGuard } from './core/guards/auth.guard';
import { ContactUsComponent } from './pages/contact-us/contact-us.component';
import { SellerDetailsComponent } from './pages/seller-details/seller-details.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'products',
    component: ProductListComponent,
  },
  { path: 'not-found', component: NotFoundComponent },
  { path: 'contact', component: ContactUsComponent },
  {
    path: 'change-password',
    pathMatch: 'full',
    component: ChangePasswordComponent,
  },
  {
    path: 'account',
    component: AccountComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'products', component: ProductsComponent },
      { path: 'orders', component: OrdersComponent },
      { path: 'purchases', component: PurchasesComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'kyc', component: KycComponent },
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
    ],
  },
  { path: 'account/verify', component: AccountConfirmationComponent },
  { path: 'terms-and-conditions', component: TermsAndConditionsComponent },
  { path: 'product/:id', component: ProductDetailComponent },
  { path: 'shop/:id', component: SellerDetailsComponent },
  { path: '**', redirectTo: '/not-found' },
];
