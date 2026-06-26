import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Category, CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <section class="card">
      <h2>Categories</h2>

      <form [formGroup]="form" (ngSubmit)="save()" class="form-row">
        <input type="text" formControlName="name" placeholder="Category name" />
        <button type="submit" [disabled]="form.invalid || saving">
          {{ editingId ? 'Update' : 'Add' }}
        </button>
        @if (editingId) {
          <button type="button" class="secondary" (click)="cancelEdit()">Cancel</button>
        }
      </form>

      @if (error) {
        <p class="error">{{ error }}</p>
      }

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Unique ID</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          @for (cat of categories; track cat.id) {
            <tr>
              <td>{{ cat.name }}</td>
              <td><code>{{ cat.id }}</code></td>
              <td class="actions">
                <button type="button" (click)="startEdit(cat)">Edit</button>
                <button type="button" class="danger" (click)="remove(cat)">Delete</button>
              </td>
            </tr>
          } @empty {
            <tr>
              <td colspan="3">No categories yet.</td>
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
      .form-row {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;
      }
      input {
        flex: 1;
        padding: 0.5rem;
        border: 1px solid #cbd5e1;
        border-radius: 4px;
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
