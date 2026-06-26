import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  UiCardComponent,
  UiCardContentComponent,
  UiCardDescriptionComponent,
  UiCardHeaderComponent,
  UiCardTitleComponent,
} from '../../shared/ui';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterLink,
    UiCardComponent,
    UiCardHeaderComponent,
    UiCardTitleComponent,
    UiCardDescriptionComponent,
    UiCardContentComponent,
  ],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  quickLinks = [
    { path: '/categories', title: 'Categories', description: 'Create and organize product categories.' },
    { path: '/products', title: 'Products', description: 'Add products with images and pricing.' },
    { path: '/product-list', title: 'Product List', description: 'Browse with search, sort, and pagination.' },
    { path: '/bulk-upload', title: 'Bulk Upload', description: 'Import thousands of products via CSV or XLSX.' },
    { path: '/reports', title: 'Reports', description: 'Export catalog data as CSV or XLSX.' },
  ];
}
