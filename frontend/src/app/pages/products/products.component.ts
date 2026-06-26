import { DecimalPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Category, CategoryService } from '../../services/category.service';
import { Product, ProductService } from '../../services/product.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
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
