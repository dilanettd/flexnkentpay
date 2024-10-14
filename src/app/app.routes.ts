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

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'products',
    component: ProductListComponent,
  },
  {
    path: 'account',
    component: AccountComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'products', component: ProductsComponent },
      { path: 'orders', component: OrdersComponent },
      { path: 'purchases', component: PurchasesComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'kyc', component: KycComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: 'products/:id', component: ProductDetailComponent },
  { path: '**', redirectTo: '/' },
];
