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

1. Create backend environment file:

```bash
cd backend
cat > .env << 'EOF'
PORT=4000
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME?schema=public"
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

Frontend runs on `http://localhost:5173`.

## Build

From repo root:

```bash
npm run build
```

## Deployment (Render Blueprint)

Use Render Blueprint with `render.yaml`.

Quick flow:

1. Push this repo to GitHub.
2. In Render, click `New +` > `Blueprint`.
3. Select your repo and deploy.

When Render prompts for `sync: false` variables, use:

- `VITE_API_URL`: your API public URL with `/api`, for example `https://your-api-service.onrender.com/api`
- `CORS_ORIGIN`: your frontend public URL, for example `https://your-web-service.onrender.com`

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
