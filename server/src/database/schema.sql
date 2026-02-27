-- Vertex Transport Manager schema
-- Create DB manually, then run this file.

SET FOREIGN_KEY_CHECKS=0;

CREATE TABLE IF NOT EXISTS companies (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_companies_name (name)
);

CREATE TABLE IF NOT EXISTS roles (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  company_id BIGINT NULL,
  code VARCHAR(64) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255) NULL,
  is_system TINYINT(1) NOT NULL DEFAULT 0,
  status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_roles_code (code),
  UNIQUE KEY uq_roles_company_name (company_id, name),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS permissions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(100) NOT NULL,
  name VARCHAR(120) NOT NULL,
  module VARCHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_permissions_code (code)
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id BIGINT NOT NULL,
  permission_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  company_id BIGINT NULL,
  role_id BIGINT NOT NULL,
  driver_id BIGINT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
);

ALTER TABLE users
  ADD COLUMN driver_id BIGINT NULL AFTER role_id;

CREATE TABLE IF NOT EXISTS company_settings (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  company_id BIGINT NOT NULL,
  brand_name VARCHAR(255) NULL,
  company_address VARCHAR(500) NULL,
  gst_no VARCHAR(32) NULL,
  gst_type ENUM('REGULAR','COMPOSITION','UNREGISTERED') NULL,
  financial_year_start DATE NULL,
  invoice_prefix VARCHAR(32) NULL,
  invoice_series INT NOT NULL DEFAULT 1,
  logo_url VARCHAR(512) NULL,
  primary_color VARCHAR(32) NULL,
  secondary_color VARCHAR(32) NULL,
  ui_style ENUM('CLASSIC','SOFT','GLASS') NOT NULL DEFAULT 'CLASSIC',
  support_email VARCHAR(255) NULL,
  support_phone VARCHAR(32) NULL,
  invoice_footer VARCHAR(500) NULL,
  notify_email TINYINT(1) NOT NULL DEFAULT 1,
  notify_whatsapp TINYINT(1) NOT NULL DEFAULT 0,
  notify_sms TINYINT(1) NOT NULL DEFAULT 0,
  feature_toggles JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_company_settings_company (company_id),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

ALTER TABLE company_settings
  ADD COLUMN ui_style ENUM('CLASSIC','SOFT','GLASS') NOT NULL DEFAULT 'CLASSIC' AFTER secondary_color;

CREATE TABLE IF NOT EXISTS company_branches (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  company_id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(500) NULL,
  city VARCHAR(120) NULL,
  state VARCHAR(120) NULL,
  pincode VARCHAR(20) NULL,
  contact_name VARCHAR(255) NULL,
  contact_phone VARCHAR(32) NULL,
  is_hub TINYINT(1) NOT NULL DEFAULT 0,
  status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  company_id BIGINT NULL,
  actor_user_id BIGINT NULL,
  action VARCHAR(120) NOT NULL,
  module VARCHAR(80) NOT NULL,
  entity VARCHAR(80) NULL,
  entity_id VARCHAR(80) NULL,
  meta_json JSON NULL,
  ip VARCHAR(64) NULL,
  user_agent VARCHAR(300) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_company_created (company_id, created_at),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
  FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Fleet (MVP)
CREATE TABLE IF NOT EXISTS vehicles (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  company_id BIGINT NULL,
  vehicle_no VARCHAR(32) NOT NULL UNIQUE,
  vehicle_type ENUM('LCV','HCV','CONTAINER','TANKER','TIPPER','BUS','TEMPO','EV') NOT NULL,
  make VARCHAR(64) NULL,
  model VARCHAR(64) NULL,
  year INT NULL,
  chassis_number VARCHAR(100) NULL,
  engine_number VARCHAR(100) NULL,
  fuel_type ENUM('DIESEL','PETROL','EV','CNG') NULL,
  vehicle_capacity_tons DECIMAL(10,2) NULL,
  odometer_reading INT NULL,
  fuel_tank_capacity_liters DECIMAL(10,2) NULL,
  rc_owner_name VARCHAR(255) NULL,
  rc_owner_address VARCHAR(500) NULL,
  insurance_provider VARCHAR(255) NULL,
  policy_number VARCHAR(100) NULL,
  insurance_start_date DATE NULL,
  insurance_expiry_date DATE NULL,
  permit_type ENUM('STATE','NATIONAL') NULL,
  permit_state VARCHAR(120) NULL,
  permit_expiry_date DATE NULL,
  gps_device_id VARCHAR(100) NULL,
  fastag_id VARCHAR(100) NULL,
  purchase_date DATE NULL,
  purchase_cost DECIMAL(14,2) NULL,
  loan_emi DECIMAL(14,2) NULL,
  emi_due_date DATE NULL,
  status ENUM('ACTIVE','INACTIVE','MAINTENANCE') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
);

ALTER TABLE vehicles ADD COLUMN chassis_number VARCHAR(100) NULL AFTER year;
ALTER TABLE vehicles ADD COLUMN engine_number VARCHAR(100) NULL AFTER chassis_number;
ALTER TABLE vehicles ADD COLUMN fuel_type ENUM('DIESEL','PETROL','EV','CNG') NULL AFTER engine_number;
ALTER TABLE vehicles ADD COLUMN vehicle_capacity_tons DECIMAL(10,2) NULL AFTER fuel_type;
ALTER TABLE vehicles ADD COLUMN odometer_reading INT NULL AFTER vehicle_capacity_tons;
ALTER TABLE vehicles ADD COLUMN fuel_tank_capacity_liters DECIMAL(10,2) NULL AFTER odometer_reading;
ALTER TABLE vehicles ADD COLUMN rc_owner_name VARCHAR(255) NULL AFTER fuel_tank_capacity_liters;
ALTER TABLE vehicles ADD COLUMN rc_owner_address VARCHAR(500) NULL AFTER rc_owner_name;
ALTER TABLE vehicles ADD COLUMN insurance_provider VARCHAR(255) NULL AFTER rc_owner_address;
ALTER TABLE vehicles ADD COLUMN policy_number VARCHAR(100) NULL AFTER insurance_provider;
ALTER TABLE vehicles ADD COLUMN insurance_start_date DATE NULL AFTER policy_number;
ALTER TABLE vehicles ADD COLUMN insurance_expiry_date DATE NULL AFTER insurance_start_date;
ALTER TABLE vehicles ADD COLUMN permit_type ENUM('STATE','NATIONAL') NULL AFTER insurance_expiry_date;
ALTER TABLE vehicles ADD COLUMN permit_state VARCHAR(120) NULL AFTER permit_type;
ALTER TABLE vehicles ADD COLUMN permit_expiry_date DATE NULL AFTER permit_state;
ALTER TABLE vehicles ADD COLUMN gps_device_id VARCHAR(100) NULL AFTER permit_expiry_date;
ALTER TABLE vehicles ADD COLUMN fastag_id VARCHAR(100) NULL AFTER gps_device_id;
ALTER TABLE vehicles ADD COLUMN purchase_date DATE NULL AFTER fastag_id;
ALTER TABLE vehicles ADD COLUMN purchase_cost DECIMAL(14,2) NULL AFTER purchase_date;
ALTER TABLE vehicles ADD COLUMN loan_emi DECIMAL(14,2) NULL AFTER purchase_cost;
ALTER TABLE vehicles ADD COLUMN emi_due_date DATE NULL AFTER loan_emi;

CREATE TABLE IF NOT EXISTS vehicle_documents (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  vehicle_id BIGINT NOT NULL,
  doc_type ENUM('RC','FC','PERMIT','INSURANCE','PUC','FITNESS') NOT NULL,
  doc_no VARCHAR(64) NULL,
  expiry_date DATE NULL,
  file_path VARCHAR(512) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS maintenance_schedules (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  vehicle_id BIGINT NOT NULL,
  service_type VARCHAR(100) NOT NULL,
  due_date DATE NULL,
  due_odometer INT NULL,
  reminder_days INT NOT NULL DEFAULT 7,
  last_service_date DATE NULL,
  status ENUM('SCHEDULED','DUE','COMPLETED','CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
  notes VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tyres (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  vehicle_id BIGINT NOT NULL,
  tyre_code VARCHAR(64) NOT NULL,
  position_code VARCHAR(32) NOT NULL,
  installed_on DATE NOT NULL,
  removed_on DATE NULL,
  purchase_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
  status ENUM('IN_USE','REPLACED','SCRAPPED') NOT NULL DEFAULT 'IN_USE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_tyres_code (tyre_code),
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tyre_position_history (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  tyre_id BIGINT NOT NULL,
  vehicle_id BIGINT NOT NULL,
  from_position_code VARCHAR(32) NULL,
  to_position_code VARCHAR(32) NOT NULL,
  moved_on DATE NOT NULL,
  odometer INT NULL,
  cost DECIMAL(12,2) NOT NULL DEFAULT 0,
  notes VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tyre_id) REFERENCES tyres(id) ON DELETE CASCADE,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS fuel_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  vehicle_id BIGINT NOT NULL,
  log_date DATE NOT NULL,
  odometer INT NOT NULL,
  liters DECIMAL(10,2) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  fuel_station VARCHAR(120) NULL,
  expected_mileage DECIMAL(8,2) NULL,
  actual_mileage DECIMAL(8,2) NULL,
  theft_flag TINYINT(1) NOT NULL DEFAULT 0,
  theft_variance_pct DECIMAL(8,2) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS breakdowns (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  vehicle_id BIGINT NOT NULL,
  breakdown_at DATETIME NOT NULL,
  location VARCHAR(255) NULL,
  issue VARCHAR(255) NOT NULL,
  severity ENUM('LOW','MEDIUM','HIGH','CRITICAL') NOT NULL DEFAULT 'MEDIUM',
  status ENUM('OPEN','IN_PROGRESS','RESOLVED') NOT NULL DEFAULT 'OPEN',
  resolved_at DATETIME NULL,
  cost DECIMAL(12,2) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS amc_contracts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  vehicle_id BIGINT NOT NULL,
  provider_name VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  cost DECIMAL(12,2) NOT NULL DEFAULT 0,
  status ENUM('ACTIVE','EXPIRED','CANCELLED') NOT NULL DEFAULT 'ACTIVE',
  notes VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- Drivers (MVP)
CREATE TABLE IF NOT EXISTS drivers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  company_id BIGINT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(32) NULL,
  license_no VARCHAR(64) NULL,
  license_expiry DATE NULL,
  date_of_birth DATE NULL,
  address VARCHAR(500) NULL,
  aadhaar_number VARCHAR(20) NULL,
  pan_number VARCHAR(20) NULL,
  blood_group VARCHAR(10) NULL,
  photo_path VARCHAR(512) NULL,
  emergency_contact_name VARCHAR(255) NULL,
  emergency_contact_phone VARCHAR(32) NULL,
  joining_date DATE NULL,
  experience_years DECIMAL(5,2) NULL,
  salary DECIMAL(12,2) NULL,
  commission_type ENUM('FIXED','PER_TRIP','PERCENTAGE') NULL,
  driving_badge_number VARCHAR(64) NULL,
  bank_name VARCHAR(255) NULL,
  account_number VARCHAR(64) NULL,
  ifsc_code VARCHAR(32) NULL,
  upi_id VARCHAR(120) NULL,
  kyc_status ENUM('PENDING','VERIFIED','REJECTED') NOT NULL DEFAULT 'PENDING',
  status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
);

ALTER TABLE drivers ADD COLUMN date_of_birth DATE NULL AFTER license_expiry;
ALTER TABLE drivers ADD COLUMN address VARCHAR(500) NULL AFTER date_of_birth;
ALTER TABLE drivers ADD COLUMN aadhaar_number VARCHAR(20) NULL AFTER address;
ALTER TABLE drivers ADD COLUMN pan_number VARCHAR(20) NULL AFTER aadhaar_number;
ALTER TABLE drivers ADD COLUMN blood_group VARCHAR(10) NULL AFTER pan_number;
ALTER TABLE drivers ADD COLUMN photo_path VARCHAR(512) NULL AFTER blood_group;
ALTER TABLE drivers ADD COLUMN emergency_contact_name VARCHAR(255) NULL AFTER photo_path;
ALTER TABLE drivers ADD COLUMN emergency_contact_phone VARCHAR(32) NULL AFTER emergency_contact_name;
ALTER TABLE drivers ADD COLUMN joining_date DATE NULL AFTER emergency_contact_phone;
ALTER TABLE drivers ADD COLUMN experience_years DECIMAL(5,2) NULL AFTER joining_date;
ALTER TABLE drivers ADD COLUMN salary DECIMAL(12,2) NULL AFTER experience_years;
ALTER TABLE drivers ADD COLUMN commission_type ENUM('FIXED','PER_TRIP','PERCENTAGE') NULL AFTER salary;
ALTER TABLE drivers ADD COLUMN driving_badge_number VARCHAR(64) NULL AFTER commission_type;
ALTER TABLE drivers ADD COLUMN bank_name VARCHAR(255) NULL AFTER driving_badge_number;
ALTER TABLE drivers ADD COLUMN account_number VARCHAR(64) NULL AFTER bank_name;
ALTER TABLE drivers ADD COLUMN ifsc_code VARCHAR(32) NULL AFTER account_number;
ALTER TABLE drivers ADD COLUMN upi_id VARCHAR(120) NULL AFTER ifsc_code;

CREATE TABLE IF NOT EXISTS driver_kyc_documents (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  driver_id BIGINT NOT NULL,
  doc_type ENUM('AADHAR','PAN','LICENSE','ADDRESS_PROOF','PHOTO','OTHER') NOT NULL,
  doc_no VARCHAR(80) NULL,
  file_path VARCHAR(512) NULL,
  status ENUM('PENDING','VERIFIED','REJECTED') NOT NULL DEFAULT 'PENDING',
  verified_by BIGINT NULL,
  verified_at DATETIME NULL,
  reject_reason VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE,
  FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS driver_compensation (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  driver_id BIGINT NOT NULL,
  monthly_salary DECIMAL(12,2) NOT NULL DEFAULT 0,
  incentive_per_trip DECIMAL(12,2) NOT NULL DEFAULT 0,
  incentive_per_km DECIMAL(12,2) NOT NULL DEFAULT 0,
  effective_from DATE NOT NULL,
  effective_to DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS driver_advances (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  driver_id BIGINT NOT NULL,
  advance_date DATE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  note VARCHAR(255) NULL,
  status ENUM('OPEN','SETTLED') NOT NULL DEFAULT 'OPEN',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS driver_settlements (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  driver_id BIGINT NOT NULL,
  settlement_date DATE NOT NULL,
  gross_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  advance_deduction DECIMAL(12,2) NOT NULL DEFAULT 0,
  net_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  note VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS driver_trip_commissions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  driver_id BIGINT NOT NULL,
  period_from DATE NOT NULL,
  period_to DATE NOT NULL,
  delivered_trips INT NOT NULL DEFAULT 0,
  rate_per_trip DECIMAL(12,2) NOT NULL DEFAULT 0,
  incentive_bonus DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_commission DECIMAL(12,2) NOT NULL DEFAULT 0,
  status ENUM('PENDING','PAID') NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS driver_attendance (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  driver_id BIGINT NOT NULL,
  attendance_date DATE NOT NULL,
  check_in_at DATETIME NULL,
  check_in_lat DECIMAL(10,7) NULL,
  check_in_lng DECIMAL(10,7) NULL,
  check_out_at DATETIME NULL,
  check_out_lat DECIMAL(10,7) NULL,
  check_out_lng DECIMAL(10,7) NULL,
  source ENUM('GPS','APP') NOT NULL DEFAULT 'APP',
  status ENUM('PRESENT','ABSENT','LEAVE') NOT NULL DEFAULT 'PRESENT',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_driver_attendance_date (driver_id, attendance_date),
  FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS driver_performance_scores (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  driver_id BIGINT NOT NULL,
  period_from DATE NOT NULL,
  period_to DATE NOT NULL,
  on_time_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  attendance_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  safety_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  overall_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  remarks VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS driver_statutory (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  driver_id BIGINT NOT NULL,
  esi_no VARCHAR(64) NULL,
  pf_no VARCHAR(64) NULL,
  uan_no VARCHAR(64) NULL,
  esi_enrolled_on DATE NULL,
  pf_enrolled_on DATE NULL,
  status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_driver_statutory_driver (driver_id),
  FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE
);

-- Trips (MVP)
CREATE TABLE IF NOT EXISTS trips (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  company_id BIGINT NULL,
  trip_code VARCHAR(64) NOT NULL UNIQUE,
  vehicle_id BIGINT NULL,
  driver_id BIGINT NULL,
  origin VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  start_date DATE NULL,
  end_date DATE NULL,
  status ENUM('PLANNED','ASSIGNED','STARTED','IN_TRANSIT','DELIVERED','POD_SUBMITTED','CLOSED','SETTLED') NOT NULL DEFAULT 'PLANNED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,
  FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS trip_expenses (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  trip_id BIGINT NOT NULL,
  expense_type ENUM('TOLL','DIESEL','FOOD','REPAIR','OTHER') NOT NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  note VARCHAR(255) NULL,
  approval_status ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  approved_by BIGINT NULL,
  approved_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS trip_pods (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  trip_id BIGINT NOT NULL,
  file_path VARCHAR(512) NOT NULL,
  approval_status ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  approved_by BIGINT NULL,
  approved_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Billing (MVP lite)
CREATE TABLE IF NOT EXISTS customers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  company_id BIGINT NULL,
  name VARCHAR(255) NOT NULL,
  gst_no VARCHAR(32) NULL,
  phone VARCHAR(32) NULL,
  email VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS invoices (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  company_id BIGINT NULL,
  customer_id BIGINT NOT NULL,
  invoice_no VARCHAR(64) NOT NULL UNIQUE,
  invoice_date DATE NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  tax_total DECIMAL(12,2) NOT NULL,
  total DECIMAL(12,2) NOT NULL,
  amount_paid DECIMAL(12,2) NOT NULL DEFAULT 0,
  status ENUM('DRAFT','ISSUED','PAID','PARTIAL') NOT NULL DEFAULT 'ISSUED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT
);

-- Vendor & Broker (Phase-2)
CREATE TABLE IF NOT EXISTS vendors (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  company_id BIGINT NULL,
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255) NULL,
  phone VARCHAR(32) NULL,
  email VARCHAR(255) NULL,
  gst_no VARCHAR(32) NULL,
  address VARCHAR(500) NULL,
  status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS vendor_vehicles (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  vendor_id BIGINT NOT NULL,
  vehicle_no VARCHAR(32) NOT NULL,
  vehicle_type VARCHAR(64) NULL,
  capacity_tons DECIMAL(10,2) NULL,
  status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS subcontract_trips (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  company_id BIGINT NULL,
  trip_id BIGINT NULL,
  vendor_id BIGINT NOT NULL,
  vendor_vehicle_id BIGINT NULL,
  freight_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  status ENUM('PLANNED','ASSIGNED','IN_TRANSIT','DELIVERED','SETTLED','CANCELLED') NOT NULL DEFAULT 'ASSIGNED',
  assigned_on DATE NOT NULL,
  note VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
  FOREIGN KEY (vendor_vehicle_id) REFERENCES vendor_vehicles(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS vendor_settlements (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  company_id BIGINT NULL,
  vendor_id BIGINT NOT NULL,
  settlement_date DATE NOT NULL,
  gross_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  deductions DECIMAL(12,2) NOT NULL DEFAULT 0,
  net_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  status ENUM('PENDING','PAID') NOT NULL DEFAULT 'PENDING',
  note VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS brokers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  company_id BIGINT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(32) NULL,
  email VARCHAR(255) NULL,
  commission_type ENUM('FIXED','PERCENTAGE') NOT NULL DEFAULT 'PERCENTAGE',
  status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS broker_commissions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  company_id BIGINT NULL,
  broker_id BIGINT NOT NULL,
  trip_id BIGINT NULL,
  commission_type ENUM('FIXED','PERCENTAGE') NOT NULL DEFAULT 'PERCENTAGE',
  commission_value DECIMAL(12,2) NOT NULL DEFAULT 0,
  commission_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  status ENUM('PENDING','PAID') NOT NULL DEFAULT 'PENDING',
  note VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
  FOREIGN KEY (broker_id) REFERENCES brokers(id) ON DELETE CASCADE,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL
);

-- Seed: default company
INSERT INTO companies (name) VALUES ('Vertex Demo Company')
  ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Seed permissions
INSERT INTO permissions (code, name, module) VALUES
  ('dashboard.view', 'View dashboard', 'dashboard'),
  ('reports.view', 'View reports', 'reports'),
  ('phase2.view', 'View phase-2 module', 'phase2'),
  ('fleet.view', 'View fleet', 'fleet'),
  ('fleet.manage', 'Create/update fleet', 'fleet'),
  ('fleet.delete', 'Delete fleet records', 'fleet'),
  ('fleet.documents.view', 'View vehicle documents', 'fleet'),
  ('fleet.documents.manage', 'Manage vehicle documents', 'fleet'),
  ('drivers.view', 'View drivers', 'drivers'),
  ('drivers.manage', 'Create/update drivers', 'drivers'),
  ('drivers.delete', 'Delete drivers', 'drivers'),
  ('trips.view', 'View trips', 'trips'),
  ('trips.manage', 'Create/update trips', 'trips'),
  ('trips.status.update', 'Update trip status', 'trips'),
  ('trips.delete', 'Delete trips', 'trips'),
  ('trips.expenses.view', 'View trip expenses', 'trips'),
  ('trips.expenses.manage', 'Manage trip expenses', 'trips'),
  ('trips.pods.view', 'View POD files', 'trips'),
  ('trips.pods.manage', 'Upload POD files', 'trips'),
  ('driver.settlements.view', 'View driver settlement summary', 'drivers'),
  ('billing.customers.view', 'View customers', 'billing'),
  ('billing.customers.manage', 'Manage customers', 'billing'),
  ('billing.invoices.view', 'View invoices', 'billing'),
  ('billing.invoices.manage', 'Manage invoices', 'billing'),
  ('billing.export', 'Export billing data', 'billing'),
  ('roles.view', 'View roles', 'admin'),
  ('roles.manage', 'Manage roles', 'admin'),
  ('users.view', 'View users', 'admin'),
  ('users.manage', 'Manage users', 'admin'),
  ('users.reset_password', 'Reset user passwords', 'admin'),
  ('audit.view', 'View audit logs', 'admin'),
  ('branches.manage', 'Manage branches', 'admin'),
  ('settings.view', 'View company settings', 'admin'),
  ('settings.manage', 'Manage company settings', 'admin')
ON DUPLICATE KEY UPDATE
  name=VALUES(name),
  module=VALUES(module);

-- Seed system roles
INSERT INTO roles (company_id, code, name, description, is_system, status)
SELECT NULL, 'ADMIN', 'Admin', 'System administrator', 1, 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE code='ADMIN');

INSERT INTO roles (company_id, code, name, description, is_system, status)
SELECT NULL, 'DISPATCHER', 'Dispatcher', 'Trip operations and dispatching', 1, 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE code='DISPATCHER');

INSERT INTO roles (company_id, code, name, description, is_system, status)
SELECT NULL, 'ACCOUNTS', 'Accounts', 'Billing and invoicing', 1, 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE code='ACCOUNTS');

INSERT INTO roles (company_id, code, name, description, is_system, status)
SELECT NULL, 'FLEET_MANAGER', 'Fleet Manager', 'Vehicle and driver management', 1, 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE code='FLEET_MANAGER');

INSERT INTO roles (company_id, code, name, description, is_system, status)
SELECT NULL, 'DRIVER', 'Driver', 'Driver portal: assigned trips, trip status updates, POD upload, trip expenses, past trips, settlement summary only', 1, 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE code='DRIVER');

UPDATE roles
SET description = 'Driver portal: assigned trips, trip status updates, POD upload, trip expenses, past trips, settlement summary only',
    status = 'ACTIVE'
WHERE code = 'DRIVER';

INSERT INTO roles (company_id, code, name, description, is_system, status)
SELECT NULL, 'CUSTOMER', 'Customer', 'Customer portal role', 1, 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE code='CUSTOMER');

INSERT INTO roles (company_id, code, name, description, is_system, status)
SELECT NULL, 'VENDOR', 'Vendor', 'Vendor portal role', 1, 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE code='VENDOR');

INSERT INTO roles (company_id, code, name, description, is_system, status)
SELECT NULL, 'BROKER', 'Broker', 'Broker portal role', 1, 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE code='BROKER');

-- Role permission mapping
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p
WHERE r.code='ADMIN';

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
  'dashboard.view','reports.view','phase2.view',
  'fleet.view','drivers.view',
  'trips.view','trips.manage','trips.expenses.view','trips.expenses.manage','trips.pods.view','trips.pods.manage',
  'billing.customers.view'
)
WHERE r.code='DISPATCHER';

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
  'dashboard.view','reports.view','phase2.view',
  'trips.view','trips.expenses.view','trips.pods.view',
  'billing.customers.view','billing.customers.manage','billing.invoices.view','billing.invoices.manage'
)
WHERE r.code='ACCOUNTS';

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
  'dashboard.view','reports.view','phase2.view',
  'fleet.view','fleet.manage','fleet.documents.view','fleet.documents.manage',
  'drivers.view','drivers.manage',
  'trips.view'
)
WHERE r.code='FLEET_MANAGER';

DELETE rp
FROM role_permissions rp
JOIN roles r ON r.id = rp.role_id
WHERE r.code='DRIVER';

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
  'dashboard.view',
  'trips.view',
  'trips.status.update',
  'trips.expenses.view',
  'trips.expenses.manage',
  'trips.pods.view',
  'trips.pods.manage',
  'driver.settlements.view'
)
WHERE r.code='DRIVER';

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN ('dashboard.view','trips.pods.view','billing.invoices.view')
WHERE r.code='CUSTOMER';

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN ('dashboard.view','phase2.view')
WHERE r.code='VENDOR';

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN ('dashboard.view','phase2.view')
WHERE r.code='BROKER';

-- Create admin if not exists
-- Password: Admin@123 (bcrypt hash)
INSERT INTO users (company_id, role_id, name, email, password_hash, status)
SELECT c.id, r.id, 'Vertex Admin', 'admin@vertex.local',
       '$2a$10$Y4Y2Yfq6pO3P9sOAtmG0t.7YIhFjC3X8w7tR4qJQ6yG0Jx8g8N2De',
       'ACTIVE'
FROM companies c
JOIN roles r ON r.code='ADMIN'
WHERE c.name='Vertex Demo Company'
  AND NOT EXISTS (SELECT 1 FROM users u WHERE u.email='admin@vertex.local');

-- Default company settings
INSERT INTO company_settings (company_id, brand_name, primary_color, secondary_color, support_email)
SELECT c.id, c.name, '#0f172a', '#334155', 'support@vertex.local'
FROM companies c
WHERE c.name='Vertex Demo Company'
  AND NOT EXISTS (SELECT 1 FROM company_settings cs WHERE cs.company_id=c.id);

SET FOREIGN_KEY_CHECKS=1;
