## VibeRisk Auth & Trades Setup

### 1. Environment variables

Copy `.env.example` to `.env` in the repo root and fill in:

- **PORT**: `5000` (or any free port)
- **DB_URI**: MongoDB connection string
- **JWT_ACCESS_SECRET / JWT_REFRESH_SECRET / JWT_RESET_SECRET**: long random secrets
- **CLIENT_URL**: default `http://localhost:5173`
- **EMAIL_USER / EMAIL_PASS**: SMTP credentials (e.g. Gmail app password)
- **COOKIE_DOMAIN**: `localhost` for local dev

### 2. Install dependencies

```bash
npm install          # root (for concurrently + Next deps)
cd server && npm install
cd ../client && npm install
```

### 3. Run in development

From the repo root:

```bash
npm run dev
```

This runs:

- **Backend API**: `http://localhost:5000` (`/api/auth/*`, `/api/trades/*`)
- **Vite client**: `http://localhost:5173` (VibeRisk UI)

### 4. Key API endpoints

- `POST /api/auth/register` – register with `username`, `email`, `password`
- `POST /api/auth/login` – login with `identifier` (email or username) and `password`
- `POST /api/auth/forgot-password` – request password reset
- `POST /api/auth/reset-password` – reset password with `token` + `password`
- `GET /api/auth/me` – current authenticated user (via httpOnly cookie)
- `GET /api/trades` – list current user trades
- `POST /api/trades` – create trade (auth required)
- `DELETE /api/trades/:id` – delete trade (auth + ownership required)

