# Gas Agency Delivery Partner Hisab Management App

This project is implemented as a React-based web application with a Node.js Express API. It follows the requirement document for a gas agency daily hisab and settlement workflow while keeping the app focused on a web-first React implementation.

## Project structure

- `frontend/` — React + Vite administrative interface and delivery partner dashboard.
- `backend/` — Express API, business logic, and settlement calculations.
- `docs/` — database schema, system architecture, and screen flow documentation.

## Local development

```bash
npm install
npm run frontend
npm run backend
```

The frontend runs on port 5173 and the API runs on port 4000 by default.

## Key features implemented

- Admin dashboard and delivery partner dashboard views.
- Delivery partner, agent, and daily settlement modules.
- Cash and online payment tracking.
- Daily expense approval workflow.
- Settlement calculation engine with short/excess reporting.
- PostgreSQL-oriented schema documentation.
- React-based UI for the core business flow.

## Notes

The current implementation is a working base application intended for real-world extension, validation, and integration with PostgreSQL and authentication.
