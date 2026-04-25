# pos-backend API

Backend service for the POS ecosystem, implemented with Express and MongoDB.
This project provides core API infrastructure, authentication middleware, error handling, Swagger docs, and feature modules shared by frontend applications.

## Purpose

`pos-backend` is the central API layer for connected frontend projects (`POS` and `Pos-Admin`).
Its responsibilities include:

- request routing and middleware orchestration,
- authentication token parsing/verification,
- CORS and security hardening,
- database connectivity and model-level plugins,
- standardized error conversion/handling,
- API documentation through Swagger/OpenAPI.

## Current Architecture

Core entry and configuration flow:

- `app.js`: app bootstrap, middleware wiring, route registration, and server startup
- `config/Routes.js`: feature route mapping
- `middlewares/Base.js`: base middleware setup and auth exclusions
- `config/db.js`: MongoDB connection and index sync behavior
- `config/swagger.js`: runtime swagger generation/validation and docs exposure
- `modules/logger.js`: centralized logging abstraction

## Feature Modules

Feature-first structure lives under `features/`.

Currently wired route groups include:

- `/role` from `features/role/controller/RoleController`

The repository also includes OpenAPI YAML docs for broader domains (`auth`, `category`, `customerProfile`, `job`, `order`, `tailorProfile`), indicating a design that supports modular expansion.

## Security and Middleware Highlights

- Helmet for secure HTTP headers
- CORS with configurable origins via `CORS_ORIGINS`
- JWT token verification (`JWT_SECRET_KEY`)
- not-found, error-logging, error-conversion, and final error handler middleware chain
- duplicate key and validation normalization for database errors

## Environment Variables

Important env vars referenced in code:

- `PORT`
- `API_HOST`
- `CORS_ORIGINS`
- `JWT_SECRET_KEY`
- `MONGO_URI`
- `REDIS_URL`
- `BASE_PATH`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NODE_ENV`

Create a `.env` file in the project root and define these values per environment.

## API Documentation

Swagger is initialized at runtime and exposed at:

- `/api-docs`
- `/swagger.json`

This enables frontend teams to validate available endpoints during integration.

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- MongoDB instance
- (optional) Redis instance

### Install

```bash
npm install
```

### Run in Development

```bash
npm run dev
```

By default, app startup uses values from `.env` and listens on configured host/port.

## Scripts

- `npm run dev`: start the server via `node app.js`
- `npm run typecheck`: run TypeScript checks
- `npm run lint`: run ESLint on `.js` and `.ts`
- `npm run format`: run Prettier formatting

## Connected Repositories

This backend serves two separate frontend applications:

- `POS`: operations and in-store workflow frontend
- `Pos-Admin`: administration and control-panel frontend

Backend acts as the single source of truth for auth, persistence, and business rules.

## Operational Notes

- Keep CORS origin settings synchronized with deployed frontend URLs.
- Ensure JWT secret and database credentials are managed securely.
- Expand route registration in `config/Routes.js` as additional feature modules are promoted from docs to runtime routes.
