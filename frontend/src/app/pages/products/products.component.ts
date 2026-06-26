import { DecimalPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Category, CategoryService } from '../../services/category.service';
import { Product, ProductService } from '../../services/product.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [ReactiveFormsModule, DecimalPipe],
  template: `
    <section class="card">
      <h2>Products</h2>

      <form [formGroup]="form" (ngSubmit)="save()" class="product-form">
        <label>
          Name
          <input type="text" formControlName="name" />
        </label>
        <label>
          Price
          <input type="number" step="0.01" formControlName="price" />
        </label>
        <label>
          Category
          <select formControlName="categoryId">
            <option value="">Select category</option>
            @for (cat of categories; track cat.id) {
              <option [value]="cat.id">{{ cat.name }}</option>
            }
          </select>
        </label>
        <label>
          Image
          <input type="file" accept="image/*" (change)="onFileChange($event)" />
        </label>
        <div class="form-actions">
          <button type="submit" [disabled]="form.invalid || saving">
            {{ editingId ? 'Update' : 'Add' }}
          </button>
          @if (editingId) {
            <button type="button" class="secondary" (click)="cancelEdit()">Cancel</button>
          }
        </div>
      </form>

      @if (error) {
        <p class="error">{{ error }}</p>
      }

      <table>
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Price</th>
            <th>Category</th>
            <th>Unique ID</th>
            <th>Actions</th>
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
              <td>{{ product.price | number: '1.2-2' }}</td>
              <td>{{ product.category?.name }}</td>
              <td><code>{{ product.id }}</code></td>
              <td class="actions">
                <button type="button" (click)="startEdit(product)">Edit</button>
                <button type="button" class="danger" (click)="remove(product)">Delete</button>
              </td>
            </tr>
          } @empty {
            <tr>
              <td colspan="6">No products yet.</td>
            </tr>
          }
        </tbody>
      </table>
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
      .product-form {
        display: grid;
        gap: 1rem;
        margin-bottom: 1.5rem;
        max-width: 480px;
      }
      label {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.875rem;
      }
      input,
      select {
        padding: 0.5rem;
        border: 1px solid #cbd5e1;
        border-radius: 4px;
      }
      .form-actions {
        display: flex;
        gap: 0.5rem;
      }
      button {
        padding: 0.5rem 1rem;
        background: #2563eb;
        color: #fff;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      button.secondary {
        background: #64748b;
      }
      button.danger {
        background: #dc2626;
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
      .actions {
        display: flex;
        gap: 0.5rem;
      }
      .error {
        color: #dc2626;
      }
      code {
        font-size: 0.75rem;
      }
    `,
  ],
})
export class ProductsComponent implements OnInit {
  productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private fb = inject(FormBuilder);

  products: Product[] = [];
  categories: Category[] = [];
  editingId: string | null = null;
  selectedFile: File | null = null;
  saving = false;
  error = '';

  form = this.fb.group({
    name: ['', Validators.required],
    price: [null as number | null, [Validators.required, Validators.min(0.01)]],
    categoryId: ['', Validators.required],
  });

  ngOnInit() {
    this.loadProducts();
    this.categoryService.list().subscribe({
      next: (data) => (this.categories = data),
    });
  }

  loadProducts() {
    this.productService.list().subscribe({
      next: (data) => (this.products = data),
      error: () => (this.error = 'Failed to load products'),
    });
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  save() {
    if (this.form.invalid) return;
    this.saving = true;
    this.error = '';

    const formData = new FormData();
    formData.append('name', this.form.value.name!);
    formData.append('price', String(this.form.value.price));
    formData.append('categoryId', this.form.value.categoryId!);
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    const request = this.editingId
      ? this.productService.update(this.editingId, formData)
      : this.productService.create(formData);

    request.subscribe({
      next: () => {
        this.resetForm();
        this.saving = false;
        this.loadProducts();
      },
      error: (err) => {
        this.error = err.error?.error || 'Save failed';
        this.saving = false;
      },
    });
  }

  startEdit(product: Product) {
    this.editingId = product.id;
    this.form.patchValue({
      name: product.name,
      price: Number(product.price),
      categoryId: product.categoryId,
    });
    this.selectedFile = null;
  }

  cancelEdit() {
    this.resetForm();
  }

  remove(product: Product) {
    if (!confirm(`Delete product "${product.name}"?`)) return;
    this.productService.delete(product.id).subscribe({
      next: () => this.loadProducts(),
      error: (err) => (this.error = err.error?.error || 'Delete failed'),
    });
  }

  private resetForm() {
    this.editingId = null;
    this.selectedFile = null;
    this.form.reset();
  }
}
