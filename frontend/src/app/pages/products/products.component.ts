import { DecimalPipe } from '@angular/common';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Category, CategoryService } from '../../services/category.service';
import { Product, ProductService } from '../../services/product.service';
import {
  UiButtonComponent,
  UiCardComponent,
  UiCardContentComponent,
  UiDrawerComponent,
  UiFileInputComponent,
  UiInputDirective,
  UiLabelComponent,
  uiTableCellClass,
  uiTableClass,
  uiTableHeadClass,
  uiTableHeaderCellClass,
  uiTableRowClass,
} from '../../shared/ui';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DecimalPipe,
    RouterLink,
    UiButtonComponent,
    UiCardComponent,
    UiCardContentComponent,
    UiDrawerComponent,
    UiFileInputComponent,
    UiLabelComponent,
    UiInputDirective,
  ],
  templateUrl: './products.component.html',
})
export class ProductsComponent implements OnInit {
  productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private fb = inject(FormBuilder);

  @ViewChild('imageInput') imageInput?: UiFileInputComponent;

  tableClass = uiTableClass;
  tableHeadClass = uiTableHeadClass;
  tableRowClass = uiTableRowClass;
  tableCellClass = uiTableCellClass;
  tableHeaderCellClass = uiTableHeaderCellClass;

  products: Product[] = [];
  categories: Category[] = [];
  page = 1;
  pageSize = 10;
  total = 0;
  totalPages = 1;
  drawerOpen = false;
  editingId: string | null = null;
  selectedFile: File | null = null;
  saving = false;
  error = '';
  listError = '';

  searchControl = new FormControl('', { nonNullable: true });
  sortControl = new FormControl<'asc' | 'desc'>('desc', { nonNullable: true });

  form = this.fb.group({
    name: ['', Validators.required],
    price: [
      null as number | null,
      [
        Validators.required,
        Validators.min(0.01),
        Validators.max(99_999_999.99),
      ],
    ],
    categoryId: ['', Validators.required],
  });

  get drawerTitle() {
    return this.editingId ? 'Edit product' : 'Add product';
  }

  ngOnInit() {
    this.loadProducts();
    this.categoryService.list().subscribe({
      next: (data) => (this.categories = data),
    });

    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.page = 1;
        this.loadProducts();
      });

    this.sortControl.valueChanges.subscribe(() => {
      this.page = 1;
      this.loadProducts();
    });
  }

  loadProducts() {
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
          this.listError = '';
        },
        error: () => (this.listError = 'Failed to load products'),
      });
  }

  goToPage(page: number) {
    this.page = page;
    this.loadProducts();
  }

  openAddDrawer() {
    this.resetForm();
    this.drawerOpen = true;
  }

  openEditDrawer(product: Product) {
    this.editingId = product.id;
    this.selectedFile = null;
    this.imageInput?.reset();
    this.form.patchValue({
      name: product.name,
      price: Number(product.price),
      categoryId: product.categoryId,
    });
    this.error = '';
    this.drawerOpen = true;
  }

  closeDrawer() {
    this.drawerOpen = false;
    this.resetForm();
  }

  onFileChange(file: File | null) {
    this.selectedFile = file;
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
        this.saving = false;
        this.drawerOpen = false;
        this.resetForm();
        this.loadProducts();
      },
      error: (err) => {
        this.error = err.error?.error || 'Save failed';
        this.saving = false;
      },
    });
  }

  remove(product: Product) {
    if (!confirm(`Delete product "${product.name}"?`)) return;
    this.productService.delete(product.id).subscribe({
      next: () => this.loadProducts(),
      error: (err) => (this.listError = err.error?.error || 'Delete failed'),
    });
  }

  private resetForm() {
    this.editingId = null;
    this.selectedFile = null;
    this.imageInput?.reset();
    this.form.reset();
    this.error = '';
  }
}
