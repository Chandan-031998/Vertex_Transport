# API Quick Reference

## Auth
- POST /api/auth/login { email, password }
- GET /api/auth/me (Bearer)
- `/auth/me` returns user profile + effective permissions.

## Fleet
- GET /api/fleet/vehicles
- POST /api/fleet/vehicles
- PUT /api/fleet/vehicles/:id
- DELETE /api/fleet/vehicles/:id
- GET /api/fleet/vehicles/:id/documents
- POST /api/fleet/vehicles/:id/documents (multipart form-data, file=...)
- GET /api/fleet/maintenance
- POST /api/fleet/maintenance
- GET /api/fleet/tyres
- POST /api/fleet/tyres
- POST /api/fleet/tyres/:id/move
- POST /api/fleet/tyres/:id/replace
- GET /api/fleet/tyres/:id/history
- GET /api/fleet/fuel-logs
- POST /api/fleet/fuel-logs
- GET /api/fleet/fuel-logs/theft-signals
- GET /api/fleet/breakdowns
- POST /api/fleet/breakdowns
- GET /api/fleet/amc
- POST /api/fleet/amc
- GET /api/fleet/alerts/expiry?days=30
- GET /api/fleet/summary
- GET /api/fleet/alerts/document-reminders?days=30,15,7,1

## Drivers
- GET /api/drivers
- POST /api/drivers
- PUT /api/drivers/:id
- DELETE /api/drivers/:id
- GET /api/drivers/:driverId/kyc-documents
- POST /api/drivers/:driverId/kyc-documents (multipart form-data, file=...)
- PUT /api/drivers/:driverId/kyc-documents/:docId/status
- GET /api/drivers/:driverId/compensation
- POST /api/drivers/compensation
- GET /api/drivers/:driverId/advances
- POST /api/drivers/advances
- GET /api/drivers/:driverId/settlements
- POST /api/drivers/settlements
- GET /api/drivers/:driverId/commissions
- POST /api/drivers/commissions/calculate
- GET /api/drivers/:driverId/attendance
- POST /api/drivers/attendance
- GET /api/drivers/:driverId/performance
- POST /api/drivers/performance/generate
- GET /api/drivers/:driverId/statutory
- POST /api/drivers/statutory
- GET /api/drivers/alerts/license-expiry?days=30
- GET /api/drivers/overview/performance

## Trips
- GET /api/trips
- POST /api/trips
- PUT /api/trips/:id
- DELETE /api/trips/:id
- GET /api/trips/:id/expenses
- POST /api/trips/:id/expenses
- PUT /api/trips/:id/expenses/:expenseId/review
- GET /api/trips/:id/pods
- POST /api/trips/:id/pods (multipart, file=...)
- PUT /api/trips/:id/pods/:podId/review

## Billing (MVP lite)
- GET/POST /api/billing/customers
- GET/POST /api/billing/invoices
- GET /api/billing/invoices/outstanding
- GET /api/billing/invoices/export

## Roles & Permissions
- GET /api/roles/permissions
- GET /api/roles
- GET /api/roles/:id
- POST /api/roles
- PUT /api/roles/:id
- DELETE /api/roles/:id

## Users (Admin)
- GET /api/users
- GET /api/users/login-activity
- GET /api/users/audit-logs
- GET /api/users/:id
- POST /api/users
- PUT /api/users/:id
- POST /api/users/:id/reset-password
- DELETE /api/users/:id

## Company Settings
- GET /api/settings/company
- PUT /api/settings/company
- GET /api/settings/branches
- POST /api/settings/branches
- PUT /api/settings/branches/:id
- DELETE /api/settings/branches/:id
- GET /api/settings/export/:entity  (vehicles|drivers|trips|invoices)

## Reports
- GET /api/reports/dashboard?period=day|week|month
- GET /api/reports/driver-trip-count

## Phase-2 placeholders
- /api/tracking, /api/vendors, /api/brokers, /api/compliance, /api/integrations => 501
