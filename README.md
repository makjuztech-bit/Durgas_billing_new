# Durgas POS Billing Application

Full-stack POS & Billing application built with React, Vite, TypeScript, Express, SQLite (Sequelize), and Electron.

---

## 🚀 Quick Start Guide

### 1. Install Dependencies

You need to install dependencies for both the frontend/electron app and the backend service:

```bash
# In project root:
npm install

# In backend directory:
cd backend
npm install
cd ..
```

*(Note: If using `pnpm`, run `pnpm install` in root and `cd backend && pnpm install`).*

---

### 2. Running in Development

- **Run Full-Stack (Backend + Frontend Web):**
  ```bash
  npm run dev
  ```
  - Frontend: `http://localhost:8080` (or active port shown in console)
  - Backend API: `http://localhost:5000/api`

- **Run Electron Desktop App (with Dev Tools):**
  ```bash
  npm run electron:dev
  ```

- **Run Backend Only:**
  ```bash
  npm run dev:backend
  ```

- **Run Frontend Only:**
  ```bash
  npm run dev:frontend
  ```

---

### 3. Default Login Credentials

On the first launch with a fresh database, the server automatically syncs SQLite tables and seeds the default administrator account:

- **Username:** `admin`
- **Password:** `admin123`

---

### 4. Building & Packaging

- **Production Web Build:**
  ```bash
  npm run build
  ```

- **Electron Standalone Executable Packaging:**
  ```bash
  npm run electron:build
  ```
  *(Packages portable executables with optimized SQLite native bindings for Windows/Linux)*

---

## 📁 Project Architecture

- **`src/`**: React + TypeScript frontend (pages, components, UI primitives, hooks, contexts, billing calculations)
- **`backend/`**: Node.js & Express server with Sequelize ORM and SQLite database models/routes
- **`electron/`**: Electron main and preload scripts
- **`public/`**: Static assets, logos, and icons
- **`scripts/`**: Release builder and native binary assets for desktop deployment
