import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Category {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<Category[]>('/api/categories');
  }

  get(id: string) {
    return this.http.get<Category>(`/api/categories/${id}`);
  }

  create(name: string) {
    return this.http.post<Category>('/api/categories', { name });
  }

  update(id: string, name: string) {
    return this.http.put<Category>(`/api/categories/${id}`, { name });
  }

  delete(id: string) {
    return this.http.delete(`/api/categories/${id}`);
  }
}
