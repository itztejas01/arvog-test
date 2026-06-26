import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Category, CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private fb = inject(FormBuilder);

  categories: Category[] = [];
  editingId: string | null = null;
  saving = false;
  error = '';

  form = this.fb.group({
    name: ['', Validators.required],
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.categoryService.list().subscribe({
      next: (data) => (this.categories = data),
      error: () => (this.error = 'Failed to load categories'),
    });
  }

  save() {
    if (this.form.invalid) return;
    this.saving = true;
    this.error = '';
    const name = this.form.value.name!;

    const request = this.editingId
      ? this.categoryService.update(this.editingId, name)
      : this.categoryService.create(name);

    request.subscribe({
      next: () => {
        this.form.reset();
        this.editingId = null;
        this.saving = false;
        this.load();
      },
      error: (err) => {
        this.error = err.error?.error || 'Save failed';
        this.saving = false;
      },
    });
  }

  startEdit(cat: Category) {
    this.editingId = cat.id;
    this.form.patchValue({ name: cat.name });
  }

  cancelEdit() {
    this.editingId = null;
    this.form.reset();
  }

  remove(cat: Category) {
    if (!confirm(`Delete category "${cat.name}"?`)) return;
    this.categoryService.delete(cat.id).subscribe({
      next: () => this.load(),
      error: (err) => (this.error = err.error?.error || 'Delete failed'),
    });
  }
}
