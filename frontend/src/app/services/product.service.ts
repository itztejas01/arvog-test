import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Product {
  id: string;
  name: string;
  imagePath: string | null;
  price: string;
  categoryId: string;
  category?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<Product[]>('/api/products');
  }

  get(id: string) {
    return this.http.get<Product>(`/api/products/${id}`);
  }

  create(formData: FormData) {
    return this.http.post<Product>('/api/products', formData);
  }

  update(id: string, formData: FormData) {
    return this.http.put<Product>(`/api/products/${id}`, formData);
  }

  delete(id: string) {
    return this.http.delete(`/api/products/${id}`);
  }

  imageUrl(imagePath: string | null): string | null {
    return imagePath ? `/api/uploads/${imagePath}` : null;
  }
}
