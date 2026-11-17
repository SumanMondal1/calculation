# Application architecture

## 1. Overview
The system is structured around three major layers:

1. React frontend for the admin and delivery partner workflows.
2. Express API for business logic and validation.
3. PostgreSQL database for persistent records and transactions.

## 2. Component design

### Frontend
- Login, dashboard, partner management, agent management, daily hisab, settlement review, and reports.
- State is kept in React components with simple mock data and API integration hooks.
- The UI is designed so it can be connected to JWT-authenticated backend APIs.

### Backend
- REST API endpoints provide CRUD-like operations for users, agents, deliveries, expenses, payments, and settlements.
- Financial calculations are centralized in a dedicated module to minimize risk of duplicated logic.
- Validation occurs on the server before persistence.

### Database
- Tables mirror the business domain with foreign keys and amounts stored as numeric/decimal values.
- Database transactions protect daily settlement and approval flows.

## 3. Core flows

### Admin flow
- Login as admin.
- Manage delivery partners and agents.
- Review pending daily hisab reports.
- Approve or reject expenses and settlements.
- Export reports.

### Delivery partner flow
- Login with mobile number and password.
- Enter deliveries and agent transactions.
- Record payments and expenses.
- Submit daily hisab for review.
- View settlement status.

## 4. Financial engine rules
- Agent outstanding is a balance, not cash collected.
- Customer and agent payments are tracked separately.
- Approved expenses are the only deductions that affect net payable.
- Short/excess is calculated as difference between submitted total and net payable.
- Backend validations prevent duplicate daily submissions.

## 5. Security
- JWT-based authentication layer.
- Role-based permissions.
- Admin-only approval and reopen workflows.
- Audit log for changes, approvals, and settlement adjustments.

## 6. Future extension
- Replace mock data with PostgreSQL models.
- Add authentication middleware.
- Connect file uploads to Cloudinary or object storage.
- Add PDF/Excel export generation.
- Build native Android packaging with React Native/Expo when required.
