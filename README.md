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

## Render Deployment (Production)

Deploy as two services:

### 1) Backend (Render Web Service)
- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`
- Health Check Path: `/api/health`

Backend runtime entry is `server/src/server.js` and start script already points to it:
- `start`: `node src/server.js`

### 2) Frontend (Render Static Site)
- Root Directory: `client`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`

Set frontend env:
- `VITE_API_BASE_URL=https://transport.vertexsoftware.in`

### Required backend env vars
- `NODE_ENV=production`
- `TRUST_PROXY=1`
- `DB_HOST=cpanel-sh117.webhostingservices.com`
- `DB_PORT=3306`
- `DB_USER=pixelfla_vertex_user`
- `DB_PASSWORD=...`
- `DB_NAME=pixelfla_vertex_transport_manager`
- `JWT_SECRET=...`
- `JWT_EXPIRES_IN=7d`
- `SEED_ADMIN_NAME=Admin`
- `SEED_ADMIN_EMAIL=admin@vertexsoftware.in`
- `SEED_ADMIN_PASSWORD=admin123`
- `CORS_ORIGINS=https://transport.vertexsoftware.in,http://localhost:5173,http://127.0.0.1:5173`
- `UPLOAD_DIR=uploads`
- `MAX_UPLOAD_MB=10`

### Why this setup works
- Backend does not run Vite during build.
- Backend listens on `process.env.PORT || 4000`.
- Upload directory creation is safe and falls back to `/tmp/uploads` if needed.
- CORS supports comma-separated origins with trim + trailing slash normalization.



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
