-- Pig Breeding Management System Schema
-- Run this script to create all necessary tables

-- Sows table (แม่พันธุ์)
CREATE TABLE IF NOT EXISTS sows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sow_id TEXT NOT NULL UNIQUE,
  name TEXT,
  birth_date DATE,
  breed TEXT,
  status TEXT DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sires table (พ่อพันธุ์)
CREATE TABLE IF NOT EXISTS sires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sire_id TEXT NOT NULL UNIQUE,
  name TEXT,
  birth_date DATE,
  breed TEXT,
  semen_type TEXT DEFAULT 'fresh',
  status TEXT DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Breeding records table (บันทึกการผสมพันธุ์)
CREATE TABLE IF NOT EXISTS breeding_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sow_id TEXT NOT NULL,
  sire_id TEXT NOT NULL,
  breeding_method TEXT NOT NULL CHECK (breeding_method IN ('artificial', 'natural')),
  breeding_date DATE NOT NULL,
  first_check_date DATE NOT NULL,
  confirm_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending-check' CHECK (status IN ('pending-check', 'pregnant', 'repeat', 'rebreed', 'delivered', 'failed')),
  notes TEXT,
  piglet_count INTEGER,
  delivered_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI reports table
CREATE TABLE IF NOT EXISTS ai_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type TEXT NOT NULL,
  report_month TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI chat history table
CREATE TABLE IF NOT EXISTS ai_chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_breeding_records_status ON breeding_records(status);
CREATE INDEX IF NOT EXISTS idx_breeding_records_due_date ON breeding_records(due_date);
CREATE INDEX IF NOT EXISTS idx_breeding_records_sow_id ON breeding_records(sow_id);
