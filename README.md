# Product Management System

Angular + Node.js (Express) + PostgreSQL monorepo implementing user auth, category/product CRUD, server-side product listing, bulk upload, and report export.

## Prerequisites

- Node.js 20+
- Docker (for PostgreSQL)
- npm

## Quick Start

### 1. Start PostgreSQL

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run prisma:seed
npm run dev
```

API runs at `http://localhost:3000`.

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

App runs at `http://localhost:4200` (proxies `/api` to the backend).

## Seed Credentials

| Email | Password |
|-------|----------|
| admin@example.com | admin123 |

Seed data includes sample categories (Electronics, Clothing, Books) and products.

## API Overview

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/register` | No | Register user |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/users/me` | Yes | Current user |
| CRUD | `/api/categories` | Yes | Category management |
| CRUD | `/api/products` | Yes | Product management (multipart for images) |
| GET | `/api/products/list` | Yes | Paginated list with sort & search |
| POST | `/api/products/bulk-upload` | Yes | CSV/XLSX bulk import |
| GET | `/api/reports/products` | Yes | Stream CSV/XLSX report download |

### Product List Query Params

- `page` (default 1)
- `pageSize` (default 10, max 100)
- `sortOrder` — `asc` or `desc` (by price)
- `search` — matches product name or category name

### Bulk Upload Format

CSV or XLSX with columns: `name`, `price`, `categoryName`.

## Project Structure

```
project/
├── backend/          # Express + TypeScript + Prisma
├── frontend/         # Angular 19 standalone components
├── docker-compose.yml
└── docs/
```

## Git History (phased commits)

Each feature was committed separately:

1. `chore:` monorepo scaffold
2. `feat:` user auth (JWT)
3. `feat:` category CRUD
4. `feat:` product CRUD + image upload
5. `feat:` server-side product list
6. `feat:` bulk upload
7. `feat:` report export
8. `docs:` setup guide, seed, error handling
