# Vertex Transport Manager (MVP + Phase-2 Scaffold)

Monorepo:
- `server/` Node.js + Express + MySQL + JWT (REST API)
- `client/` React + Tailwind (Vite)
- `shared/` shared types/constants (optional)

## Prerequisites
- Node.js 18+ (recommended)
- MySQL 8+ (or compatible)
- npm

## 1) Configure env
Copy examples and update:
- `server/.env.example` -> `server/.env`
- `client/.env.example` -> `client/.env` (optional)

## 2) Create database + tables
Create DB first:
```sql
CREATE DATABASE vertex_transport_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Then run schema:
```bash
cd server
npm run db:init
```

This runs `src/database/schema.sql`.

## 3) Run backend
```bash
cd server
npm install
npm run dev
```
API: http://localhost:4000/api/health

Seeded Admin:
- Email: admin@vertex.local
- Password: Admin@123

## 4) Run frontend
```bash
cd client
npm install
npm run dev
```
App: http://localhost:5173

## Dev (both together)
Install dependencies in both, then from repo root:
```bash
npm install
npm run dev
```

## Notes
- This is a clean scaffold with working Auth + RBAC middleware + sample modules for Fleet, Drivers, Trips (CRUD).
- Phase-2 folders are included (tracking/geofence/vendors/brokers/compliance/integrations) with placeholder routes you can extend.



npm run db:init
npm run db:seedadmin






cd Vertex_Transport
git init
git remote add origin https://github.com/Chandan-031998/Vertex_Transport.git
git add .
git commit -m "Initial commit - Vertex Transport Manager"
git branch -M main
git push -u origin main


git add .
git commit -m "Updated project"
git push