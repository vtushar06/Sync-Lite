# Project Name: MediSync - Wearable Health Data Ingestion & Monitoring System

## Project Scope
MediSync is a backend-first health data system designed to solve the "Interoperability Problem" in wearable health technology. Currently, health data is siloed across different devices (Apple Watch, Fitbit, raw CSVs) with inconsistent formats. MediSync provides a unified ingestion engine that normalizes this data, stores it securely, and performs basic anomaly detection for clinical review.

## Key Features

### 1. Multi-Source Data Ingestion
- REST API endpoints to accept health data in various formats (JSON, CSV)
- Support for simulated wearable streams (Heart Rate, SpO2, HRV)
- Device registration and tracking

### 2. Factory-Based Data Parsing
- Implementation of the **Factory Design Pattern** to dynamically select parsers based on device type (e.g., Apple Watch vs. Fitbit vs. Raw Sensor)
- **Strategy Pattern** for different parsing logic per device

### 3. Data Normalization
- Convert all timestamps to UTC
- Standardize units (BPM for heart rate, percentage for SpO2)
- Filter out invalid sensor readings (e.g., heart rate of 500 bpm)

### 4. Automated Anomaly Detection
- Backend logic to flag "Risk Events" (e.g., SpO2 < 90% or HR > 150 resting)
- Implementation of **Observer Pattern** to trigger alerts when risks are detected
- Severity levels: LOW, HIGH, CRITICAL

### 5. Role-Based Access Control (RBAC)
- **Patient:** Can upload data and view own history
- **Clinician:** Can view assigned patients and receive risk alerts
- **Admin:** System management and audit logs

### 6. Clean Architecture
- Separation of concerns: Controllers (API), Services (Business Logic), and Repositories (Database Access)
- Follows standard OOP principles

---

## System Architecture

```
Client (Web/Mobile) → API Controller → ParserFactory → DeviceParser
                                      → HealthService → AnomalyDetection
                                      → Repository → Database
```

### Design Patterns Used
- **Factory Pattern** — Device parser selection
- **Strategy Pattern** — Parsing logic per device type
- **Observer Pattern** — Alert notifications on anomaly
- **Repository Pattern** — Database access abstraction

---

## Tech Stack
- **Backend:** Spring Boot (Java)
- **Database:** PostgreSQL
- **Auth:** JWT + Spring Security
- **Testing:** JUnit + Mockito
- **API Docs:** Swagger/OpenAPI

---

## Scope Boundaries

### In Scope
- Health data upload and normalization
- Anomaly detection with rule-based logic
- Role-based user management
- REST API with proper error handling
- Clean backend architecture

### Out of Scope
- Real wearable hardware integration
- AI/ML models (planned for Phase 2)
- Real-time streaming
- Mobile app
