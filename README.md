# Pikafi Admin – Project Handover

## Overview

This repository contains a full-stack application with three main components:

- **Frontend**: React + TypeScript app (Vite, TailwindCSS)
- **Backend API**: Node.js/Express (TypeScript, PostgreSQL)
- **Smart Contracts**: Solidity (Hardhat)

A `docker-compose.yml` is provided for local development and orchestration.

---

## Project Structure

```
pikafi-admin/
│
├── backend/
│   ├── api/         # Node.js/Express API (TypeScript)
│   └── contracts/   # Solidity smart contracts (Hardhat)
│
├── frontend/        # React + Vite frontend
│
└── docker-compose.yml
```

---

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js (v18+ recommended)
- npm

### Local Development (Recommended)

1. **Clone the repository**
2. **Copy and configure environment files**  
   - `backend/api/.env` (see sample or ask previous devs)
   - `backend/contracts/.env` (for Hardhat, if needed)
   - `frontend/.env` (for Vite, if needed)

3. **Start all services:**
   ```
   docker-compose up --build
   ```
   - Frontend: http://localhost:3002
   - Backend API: http://localhost:3001/api

---

## Frontend

- Location: `frontend/`
- Stack: React, TypeScript, Vite, TailwindCSS
- Main entry: `src/main.tsx`
- Pages: `src/pages/`
- Components: `src/components/`
- API config: `src/api.ts`, `src/config.ts`

**Scripts:**
- `npm run dev` – Start dev server
- `npm run build` – Build for production

---

## Backend API

- Location: `backend/api/`
- Stack: Node.js, Express, TypeScript, PostgreSQL
- Main entry: `src/index.ts`
- Routes: `src/routes/`
- Services: `src/services/`
- DB schema: `src/db/schema.sql`
- Migration: `src/scripts/migrate.ts`

**Scripts:**
- `npm run dev` – Start dev server (nodemon + ts-node)
- `npm run build` – Compile TypeScript
- `npm run migrate` – Run DB migrations

---

## Smart Contracts

- Location: `backend/contracts/`
- Stack: Solidity, Hardhat, Ethers.js
- Contracts: `contracts/`
- Deployment scripts: `scripts/`
- Artifacts: `artifacts/`

**Scripts:**
- `npx hardhat compile` – Compile contracts
- `npx hardhat test` – Run tests
- `npx hardhat run scripts/deploy.js` – Deploy contracts

---

## Environment Variables

- **Backend API**: `backend/api/.env`
- **Contracts**: `backend/contracts/.env`
- **Frontend**: `frontend/.env`

See each folder for sample `.env` files or ask the previous developer for secrets.

---

## Docker Compose

- Orchestrates frontend and backend for local development.
- Maps ports:
  - Frontend: `3002:5173`
  - Backend: `3001:3001`
- Hot-reloads code via volume mounts.

---

## Additional Notes

- For production, build and deploy each service separately.
- Review each `package.json` for available scripts and dependencies.
- For questions, contact the previous maintainer or check code comments.

---
