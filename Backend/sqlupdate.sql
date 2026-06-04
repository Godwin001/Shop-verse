-- We need this extension for PostgreSQL to generate UUIDs automatically
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE companies (
    -- Now using UUID instead of SERIAL
    company_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE, -- TRUE = Operating, FALSE = Paused
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    -- This MUST match the UUID type of the company
    company_id UUID REFERENCES companies(company_id),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    user_role VARCHAR(50) NOT NULL
);