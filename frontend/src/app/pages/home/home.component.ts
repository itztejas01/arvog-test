import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <section class="card">
      <h2>Welcome</h2>
      <p>Product management system — Angular, Node.js, PostgreSQL.</p>
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
    `,
  ],
})
export class HomeComponent {}
