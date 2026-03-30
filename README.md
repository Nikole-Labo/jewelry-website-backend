# jewelry-website-backend

Express API for the Aurum Atelier jewelry app (SQL Server, JWT auth, product/category/favorites APIs).

## Setup

1. Copy `.env.example` to `.env` and set SQL Server + `JWT_SECRET`.
2. `npm install`
3. Run SQL scripts in `scripts/` as needed (favorites table, `photo` column, etc.).
4. `npm run dev` or `npm start` — server listens on port **4000** by default.

## Environment

- `USERS_PASSWORD_COLUMN` — set to `passwordHash` if your `Users` table uses that column name.

Do not commit `.env` (it is gitignored).
