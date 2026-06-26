import { DecimalPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Product, ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
})
export class ProductListComponent implements OnInit {
  productService = inject(ProductService);

  products: Product[] = [];
  page = 1;
  pageSize = 10;
  total = 0;
  totalPages = 1;
  error = '';

  searchControl = new FormControl('', { nonNullable: true });
  sortControl = new FormControl<'asc' | 'desc'>('desc', { nonNullable: true });

  ngOnInit() {
    this.load();

    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.page = 1;
        this.load();
      });

    this.sortControl.valueChanges.subscribe(() => {
      this.page = 1;
      this.load();
    });
  }

  load() {
    this.productService
      .listPaginated({
        page: this.page,
        pageSize: this.pageSize,
        sortOrder: this.sortControl.value,
        search: this.searchControl.value || undefined,
      })
      .subscribe({
        next: (res) => {
          this.products = res.data;
          this.page = res.meta.page;
          this.total = res.meta.total;
          this.totalPages = res.meta.totalPages;
        },
        error: () => (this.error = 'Failed to load products'),
      });
  }

  goToPage(page: number) {
    this.page = page;
    this.load();
  }
}
