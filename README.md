# Avrog

Product management platform built with Angular, Node.js, and PostgreSQL — user auth, category/product CRUD, server-side listing, bulk upload, and report export.

## Prerequisites

- Node.js 20+
- Docker (for local PostgreSQL)
- npm

## Quick Start

### 1. Start PostgreSQL

```bash
docker compose up -d
```

### 2. Backend API

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run prisma:seed
npm run dev
```

API runs at `http://localhost:3000`.

### 3. Web App

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

## Project Structure

```
avrog/
├── backend/          # Avrog API (Express + Prisma)
├── frontend/         # Avrog Web (Angular)
├── docker-compose.yml
├── infra/            # AWS serverless infrastructure (upcoming)
└── docs/
```

## License

Private
