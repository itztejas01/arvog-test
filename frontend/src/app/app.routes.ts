import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth.guard';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/auth/login.component';
import { RegisterComponent } from './pages/auth/register.component';
import { CategoriesComponent } from './pages/categories/categories.component';
import { ProductsComponent } from './pages/products/products.component';
import { ProductListComponent } from './pages/product-list/product-list.component';
import { BulkUploadComponent } from './pages/bulk-upload/bulk-upload.component';
import { ReportsComponent } from './pages/reports/reports.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [authGuard] },
  { path: 'categories', component: CategoriesComponent, canActivate: [authGuard] },
  { path: 'products', component: ProductsComponent, canActivate: [authGuard] },
  { path: 'product-list', component: ProductListComponent, canActivate: [authGuard] },
  { path: 'bulk-upload', component: BulkUploadComponent, canActivate: [authGuard] },
  { path: 'reports', component: ReportsComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
];
