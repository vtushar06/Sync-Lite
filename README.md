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
- idea.md
- useCaseDiagram.md
- sequenceDiagram.md
- classDiagram.md
- ErDiagram.md

## Backend setup

1. Copy environment file:

```bash
cd backend
cp .env.example .env
```

2. Set JWT secret in `.env` to a strong value (16+ chars).

3. Install dependencies and generate Prisma client:

```bash
cd ..
npm install
npm run prisma:generate --workspace backend
```

4. Run database migration:

```bash
npm run prisma:migrate --workspace backend
```

5. Start backend:

```bash
npm run dev:backend
```

Backend runs on `http://localhost:4000`.

## Frontend setup

1. Copy frontend env file:

```bash
cd frontend
cp .env.example .env
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
