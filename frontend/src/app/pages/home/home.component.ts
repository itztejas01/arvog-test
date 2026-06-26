import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="card">
      <h2>Welcome</h2>
      <p>Product management system built with Angular, Node.js, and PostgreSQL.</p>
      <nav class="links">
        <a routerLink="/categories">Manage Categories</a>
        <a routerLink="/products">Manage Products</a>
        <a routerLink="/product-list">Browse Product List</a>
        <a routerLink="/bulk-upload">Bulk Upload</a>
        <a routerLink="/reports">Download Reports</a>
      </nav>
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
      .links {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-top: 1rem;
      }
      a {
        color: #2563eb;
        text-decoration: none;
      }
      a:hover {
        text-decoration: underline;
      }
    `,
  ],
})
export class HomeComponent {}
