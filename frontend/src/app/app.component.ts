import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';
import { UiButtonComponent } from './shared/ui';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, UiButtonComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  navItems = [
    { path: '/', label: 'Dashboard', exact: true },
    { path: '/categories', label: 'Categories', exact: false },
    { path: '/products', label: 'Products', exact: false },
    { path: '/product-list', label: 'Product List', exact: false },
    { path: '/bulk-upload', label: 'Bulk Upload', exact: false },
    { path: '/reports', label: 'Reports', exact: false },
  ];

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
