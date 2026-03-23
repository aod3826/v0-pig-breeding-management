-- Pig Breeding Management System Database Schema
-- Creating core tables

-- Sows (แม่พันธุ์) table
CREATE TABLE IF NOT EXISTS sows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sow_id VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100),
  breed VARCHAR(100),
  birth_date DATE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'culled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sires (พ่อพันธุ์/น้ำเชื้อ) table
CREATE TABLE IF NOT EXISTS sires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sire_id VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100),
  breed VARCHAR(100),
  sire_type VARCHAR(20) DEFAULT 'natural' CHECK (sire_type IN ('natural', 'ai')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Breeding Records (บันทึกการผสมพันธุ์) table
CREATE TABLE IF NOT EXISTS breeding_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sow_id VARCHAR(50) NOT NULL,
  sire_id VARCHAR(50) NOT NULL,
  breeding_method VARCHAR(20) NOT NULL CHECK (breeding_method IN ('ai', 'natural')),
  breeding_date DATE NOT NULL,
  first_check_date DATE NOT NULL,
  confirmation_date DATE NOT NULL,
  expected_due_date DATE NOT NULL,
  status VARCHAR(30) DEFAULT 'pending_check' CHECK (status IN (
    'pending_check', 'pregnant', 'not_pregnant', 're_breed', 'due_soon', 'delivered', 'aborted'
  )),
  first_check_result VARCHAR(20) CHECK (first_check_result IN ('positive', 'negative', 'uncertain')),
  first_check_date_actual DATE,
  confirmation_result VARCHAR(20) CHECK (confirmation_result IN ('positive', 'negative', 'uncertain')),
  confirmation_date_actual DATE,
  actual_delivery_date DATE,
  litter_size_born INTEGER,
  litter_size_alive INTEGER,
  litter_size_dead INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Analysis Reports table
CREATE TABLE IF NOT EXISTS ai_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type VARCHAR(50) NOT NULL,
  report_month VARCHAR(7),
  report_content TEXT NOT NULL,
  query TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Chat History table
CREATE TABLE IF NOT EXISTS ai_chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
