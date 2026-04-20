# MediSync (TypeScript Full-Stack)

MediSync is a backend-first health monitoring system that ingests wearable data from multiple formats/devices, normalizes records, detects anomalies, and raises risk alerts.

## What is implemented

- Backend in TypeScript using clean architecture layers
  - controllers
  - services
  - repositories
- Design patterns used in backend
  - Factory Pattern: parser selection
  - Strategy Pattern: device-specific parsing
  - Observer Pattern: anomaly alert creation
  - Repository Pattern: data access abstraction
- RBAC with JWT
  - PATIENT
  - CLINICIAN
  - ADMIN
- Frontend in React + TypeScript
  - Authentication
  - Patient upload/history/alerts view
  - Clinician patient lookup + alert resolution
  - Admin threshold management + clinician assignment

## Repository structure

- backend
- frontend

## Backend setup

1. Start local PostgreSQL (Docker):

```bash
docker rm -f medisync-postgres >/dev/null 2>&1 || true
docker run --name medisync-postgres -e POSTGRES_USER=medisync -e POSTGRES_PASSWORD=medisync -e POSTGRES_DB=medisync -p 55432:5432 -d postgres:16-alpine
```

2. Create backend environment file:

```bash
cd backend
cat > .env << 'EOF'
PORT=4000
DATABASE_URL="postgresql://medisync:medisync@localhost:55432/medisync?schema=public"
JWT_SECRET="replace-with-strong-secret"
CORS_ORIGIN="http://localhost:5173"
EOF
```

3. Install dependencies and generate Prisma client:

```bash
cd ..
npm install
npm run prisma:generate --workspace backend
```

4. Push Prisma schema:

```bash
npm run prisma:push --workspace backend
```

5. Start backend:

```bash
npm run dev:backend
```

Backend runs on `http://localhost:4000`.

## Frontend setup

1. Create frontend environment file:

```bash
cd frontend
cat > .env << 'EOF'
VITE_API_URL=http://localhost:4000/api
EOF
```

2. Install dependencies (if not already installed from root) and run:

```bash
cd ..
npm run dev:frontend
```

If you are already inside `frontend` folder, use:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Build

From repo root:

```bash
npm run build
```

## Deployment

### Production URLs

- **Frontend**: https://sync-lite.onrender.com
- **Backend API**: https://medisync-api-tmap.onrender.com

### Manual Deployment (Recommended)

1. **Deploy Backend Web Service**
   - Render Dashboard → New → Web Service
   - Select this repository
   - Settings:
     - Name: `medisync-api`
     - Root Directory: `backend`
     - Build Command: `npm install --include=dev && npm run prisma:generate && npm run build`
     - Start Command: `npm run start:render`
   - Environment Variables (set in Render UI, **not in version control**):
     - `NODE_ENV`: `production`
     - `DATABASE_URL`: Database connection string
     - `JWT_SECRET`: 32+ character secure random string
     - `CORS_ORIGIN`: Frontend URL

2. **Deploy Frontend Static Site**
   - Render Dashboard → New → Static Site
   - Select this repository
   - Settings:
     - Name: `medisync-web`
     - Root Directory: `frontend`
     - Build Command: `npm install && npm run build`
     - Publish Directory: `dist`
   - Environment Variables:
     - `VITE_API_URL`: Backend API URL with `/api` path

### Blueprint Deployment

Using Render Blueprint with `render.yaml`:

1. Push repository to GitHub
2. Render Dashboard → Blueprints → New Blueprint
3. Select repository
4. Configure environment variables in Render UI:
   - `DATABASE_URL`: Database connection string
   - `JWT_SECRET`: Secure random string (32+ characters)

## API summary

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/devices`
- `GET /api/devices/me`
- `POST /api/health-logs/upload`
- `GET /api/health-logs/me`
- `GET /api/health-logs/me/trends`
- `GET /api/health-logs/patient/:patientId`
- `GET /api/alerts/me`
- `GET /api/alerts/patient/:patientId`
- `PATCH /api/alerts/:alertId/resolve`
- `GET /api/admin/thresholds`
- `PUT /api/admin/thresholds`
- `POST /api/admin/assign-clinician`
- `GET /api/admin/users?role=PATIENT|CLINICIAN|ADMIN`
