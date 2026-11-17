# Database schema

The schema below is PostgreSQL-oriented and matches the requirement document. Amounts should be stored using `NUMERIC(18,2)` or equivalent decimal fields.

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  mobile_number VARCHAR(20) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'delivery_partner')),
  address TEXT,
  joining_date DATE,
  status VARCHAR(20) DEFAULT 'active',
  vehicle_number VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE agents (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  mobile_number VARCHAR(20),
  address TEXT,
  agent_code VARCHAR(50) UNIQUE NOT NULL,
  default_rate NUMERIC(18,2),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cylinder_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  default_price NUMERIC(18,2),
  status VARCHAR(20) DEFAULT 'active'
);

CREATE TABLE daily_sessions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  business_date DATE NOT NULL,
  status VARCHAR(30) DEFAULT 'draft',
  remarks TEXT,
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, business_date)
);

CREATE TABLE deliveries (
  id SERIAL PRIMARY KEY,
  daily_session_id INT NOT NULL REFERENCES daily_sessions(id),
  user_id INT NOT NULL REFERENCES users(id),
  customer_name VARCHAR(150) NOT NULL,
  customer_mobile VARCHAR(20),
  customer_id VARCHAR(50),
  cylinder_type VARCHAR(50) NOT NULL,
  quantity INT NOT NULL,
  delivery_amount NUMERIC(18,2) NOT NULL,
  amount_received NUMERIC(18,2) DEFAULT 0,
  payment_mode VARCHAR(30),
  remarks TEXT,
  delivery_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE agent_transactions (
  id SERIAL PRIMARY KEY,
  daily_session_id INT NOT NULL REFERENCES daily_sessions(id),
  user_id INT NOT NULL REFERENCES users(id),
  agent_id INT NOT NULL REFERENCES agents(id),
  cylinder_type VARCHAR(50) NOT NULL,
  quantity INT NOT NULL,
  rate_per_cylinder NUMERIC(18,2) NOT NULL,
  total_amount NUMERIC(18,2) NOT NULL,
  payment_received NUMERIC(18,2) DEFAULT 0,
  payment_mode VARCHAR(30),
  outstanding_amount NUMERIC(18,2) DEFAULT 0,
  remarks TEXT,
  transaction_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  daily_session_id INT NOT NULL REFERENCES daily_sessions(id),
  user_id INT NOT NULL REFERENCES users(id),
  payment_type VARCHAR(30) NOT NULL CHECK (payment_type IN ('customer', 'agent')),
  customer_name VARCHAR(150),
  agent_id INT REFERENCES agents(id),
  amount NUMERIC(18,2) NOT NULL,
  payment_date TIMESTAMPTZ NOT NULL,
  payment_mode VARCHAR(30),
  transaction_reference VARCHAR(120),
  screenshot_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE expenses (
  id SERIAL PRIMARY KEY,
  daily_session_id INT NOT NULL REFERENCES daily_sessions(id),
  user_id INT NOT NULL REFERENCES users(id),
  category VARCHAR(50) NOT NULL,
  amount NUMERIC(18,2) NOT NULL,
  expense_date DATE NOT NULL,
  remarks TEXT,
  bill_photo_url TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  reviewed_by INT REFERENCES users(id),
  review_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cash_denominations (
  id SERIAL PRIMARY KEY,
  daily_session_id INT NOT NULL REFERENCES daily_sessions(id),
  user_id INT NOT NULL REFERENCES users(id),
  note_500 INT DEFAULT 0,
  note_200 INT DEFAULT 0,
  note_100 INT DEFAULT 0,
  note_50 INT DEFAULT 0,
  note_20 INT DEFAULT 0,
  note_10 INT DEFAULT 0,
  note_5 INT DEFAULT 0,
  note_2 INT DEFAULT 0,
  note_1 INT DEFAULT 0,
  total_physical_cash NUMERIC(18,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pending_cylinders (
  id SERIAL PRIMARY KEY,
  daily_session_id INT NOT NULL REFERENCES daily_sessions(id),
  user_id INT NOT NULL REFERENCES users(id),
  related_name VARCHAR(150) NOT NULL,
  cylinder_type VARCHAR(50) NOT NULL,
  expected_quantity INT NOT NULL,
  delivered_quantity INT NOT NULL,
  pending_quantity INT NOT NULL,
  reason TEXT,
  remarks TEXT,
  status VARCHAR(20) DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE settlements (
  id SERIAL PRIMARY KEY,
  daily_session_id INT NOT NULL REFERENCES daily_sessions(id),
  user_id INT NOT NULL REFERENCES users(id),
  total_customer_cash NUMERIC(18,2) DEFAULT 0,
  total_customer_online NUMERIC(18,2) DEFAULT 0,
  total_customer_collection NUMERIC(18,2) DEFAULT 0,
  total_agent_payment_received NUMERIC(18,2) DEFAULT 0,
  total_approved_expenses NUMERIC(18,2) DEFAULT 0,
  net_payable NUMERIC(18,2) DEFAULT 0,
  actual_cash_submitted NUMERIC(18,2) DEFAULT 0,
  actual_online_transferred NUMERIC(18,2) DEFAULT 0,
  total_amount_submitted NUMERIC(18,2) DEFAULT 0,
  short_excess_amount NUMERIC(18,2) DEFAULT 0,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE settlement_approvals (
  id SERIAL PRIMARY KEY,
  settlement_id INT NOT NULL REFERENCES settlements(id),
  admin_user_id INT NOT NULL REFERENCES users(id),
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'reopened')),
  reason TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  entity_type VARCHAR(50) NOT NULL,
  entity_id INT,
  action VARCHAR(50) NOT NULL,
  before_value JSONB,
  after_value JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Indexes

- `users(mobile_number)`
- `agents(agent_code)`
- `daily_sessions(user_id, business_date)`
- `deliveries(user_id, delivery_date)`
- `agent_transactions(user_id, agent_id, transaction_date)`
- `payments(user_id, payment_date)`
- `expenses(user_id, expense_date)`
- `settlements(daily_session_id)`
- `audit_logs(entity_type, entity_id)`
