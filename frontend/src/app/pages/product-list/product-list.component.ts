import { DecimalPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Product, ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [ReactiveFormsModule, DecimalPipe],
  template: `
    <section class="card">
      <h2>Product List</h2>

      <div class="toolbar">
        <input
          type="search"
          [formControl]="searchControl"
          placeholder="Search by product or category name"
        />
        <label>
          Sort by price
          <select [formControl]="sortControl">
            <option value="asc">Low to high</option>
            <option value="desc">High to low</option>
          </select>
        </label>
      </div>

      @if (error) {
        <p class="error">{{ error }}</p>
      }

      <table>
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          @for (product of products; track product.id) {
            <tr>
              <td>
                @if (productService.imageUrl(product.imagePath); as url) {
                  <img [src]="url" alt="" class="thumb" />
                } @else {
                  —
                }
              </td>
              <td>{{ product.name }}</td>
              <td>{{ product.category?.name }}</td>
              <td>{{ product.price | number: '1.2-2' }}</td>
            </tr>
          } @empty {
            <tr>
              <td colspan="4">No products found.</td>
            </tr>
          }
        </tbody>
      </table>

      <div class="pagination">
        <button type="button" [disabled]="page <= 1" (click)="goToPage(page - 1)">Previous</button>
        <span>Page {{ page }} of {{ totalPages }} ({{ total }} items)</span>
        <button type="button" [disabled]="page >= totalPages" (click)="goToPage(page + 1)">
          Next
        </button>
      </div>
    </section>
  `,
  styles: [
    `
      .card {
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 1.5rem;
      }
      .toolbar {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
        flex-wrap: wrap;
      }
      input,
      select {
        padding: 0.5rem;
        border: 1px solid #cbd5e1;
        border-radius: 4px;
      }
      input[type='search'] {
        flex: 1;
        min-width: 200px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th,
      td {
        text-align: left;
        padding: 0.75rem;
        border-bottom: 1px solid #e2e8f0;
        vertical-align: middle;
      }
      .thumb {
        width: 48px;
        height: 48px;
        object-fit: cover;
        border-radius: 4px;
      }
      .pagination {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-top: 1rem;
      }
      button {
        padding: 0.5rem 1rem;
        background: #2563eb;
        color: #fff;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .error {
        color: #dc2626;
      }
    `,
  ],
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
