import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Product {
  id: string;
  name: string;
  imagePath: string | null;
  imageUrl?: string | null;
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

  imageUrl(product: Pick<Product, 'imagePath' | 'imageUrl'>): string | null {
    if (product.imageUrl) return product.imageUrl;
    return product.imagePath ? `/api/uploads/${product.imagePath}` : null;
  }

  listPaginated(params: {
    page: number;
    pageSize: number;
    sortOrder: 'asc' | 'desc';
    search?: string;
  }) {
    const query = new URLSearchParams({
      page: String(params.page),
      pageSize: String(params.pageSize),
      sortOrder: params.sortOrder,
      sortBy: 'price',
    });
    if (params.search) {
      query.set('search', params.search);
    }
    return this.http.get<{
      data: Product[];
      meta: { page: number; pageSize: number; total: number; totalPages: number };
    }>(`/api/products/list?${query.toString()}`);
  }
}
