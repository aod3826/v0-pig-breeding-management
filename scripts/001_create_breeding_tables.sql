-- Pig Breeding Management System Database Schema
-- This script creates all necessary tables for the breeding management system

-- Sows (แม่พันธุ์) table
CREATE TABLE IF NOT EXISTS sows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sow_id VARCHAR(50) NOT NULL UNIQUE, -- เบอร์หูแม่พันธุ์
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
  sire_id VARCHAR(50) NOT NULL UNIQUE, -- รหัสน้ำเชื้อ/พ่อพันธุ์
  name VARCHAR(100),
  breed VARCHAR(100),
  sire_type VARCHAR(20) DEFAULT 'natural' CHECK (sire_type IN ('natural', 'ai')), -- ผสมจริง หรือ น้ำเชื้อ
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Breeding Records (บันทึกการผสมพันธุ์) table
CREATE TABLE IF NOT EXISTS breeding_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sow_id VARCHAR(50) NOT NULL, -- เบอร์หูแม่พันธุ์
  sire_id VARCHAR(50) NOT NULL, -- รหัสน้ำเชื้อ/พ่อพันธุ์
  breeding_method VARCHAR(20) NOT NULL CHECK (breeding_method IN ('ai', 'natural')), -- ผสมเทียม หรือ ผสมจริง
  breeding_date DATE NOT NULL, -- วันที่ผสม
  
  -- Calculated dates (วันที่คำนวณ)
  first_check_date DATE NOT NULL, -- วันตรวจท้องครั้งที่ 1 (+21 วัน)
  confirmation_date DATE NOT NULL, -- วันตรวจยืนยัน (+45 วัน)
  expected_due_date DATE NOT NULL, -- วันกำหนดคลอด (+114 วัน)
  
  -- Status tracking
  status VARCHAR(30) DEFAULT 'pending_check' CHECK (status IN (
    'pending_check',    -- รอตรวจท้อง
    'pregnant',         -- ตั้งท้อง
    'not_pregnant',     -- ไม่ท้อง
    're_breed',         -- ผสมซ้ำ
    'due_soon',         -- ใกล้คลอด
    'delivered',        -- คลอดแล้ว
    'aborted'           -- แท้ง
  )),
  
  -- Check results
  first_check_result VARCHAR(20) CHECK (first_check_result IN ('positive', 'negative', 'uncertain')),
  first_check_date_actual DATE,
  confirmation_result VARCHAR(20) CHECK (confirmation_result IN ('positive', 'negative', 'uncertain')),
  confirmation_date_actual DATE,
  
  -- Delivery info
  actual_delivery_date DATE,
  litter_size_born INTEGER,
  litter_size_alive INTEGER,
  litter_size_dead INTEGER,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Analysis Reports table
CREATE TABLE IF NOT EXISTS ai_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type VARCHAR(50) NOT NULL, -- monthly, custom, etc.
  report_month VARCHAR(7), -- YYYY-MM format for monthly reports
  report_content TEXT NOT NULL,
  query TEXT, -- Original query if custom analysis
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Chat History table
CREATE TABLE IF NOT EXISTS ai_chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_breeding_records_sow_id ON breeding_records(sow_id);
CREATE INDEX IF NOT EXISTS idx_breeding_records_status ON breeding_records(status);
CREATE INDEX IF NOT EXISTS idx_breeding_records_breeding_date ON breeding_records(breeding_date);
CREATE INDEX IF NOT EXISTS idx_breeding_records_expected_due_date ON breeding_records(expected_due_date);
CREATE INDEX IF NOT EXISTS idx_sows_sow_id ON sows(sow_id);
CREATE INDEX IF NOT EXISTS idx_sires_sire_id ON sires(sire_id);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
DROP TRIGGER IF EXISTS update_sows_updated_at ON sows;
CREATE TRIGGER update_sows_updated_at
  BEFORE UPDATE ON sows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sires_updated_at ON sires;
CREATE TRIGGER update_sires_updated_at
  BEFORE UPDATE ON sires
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_breeding_records_updated_at ON breeding_records;
CREATE TRIGGER update_breeding_records_updated_at
  BEFORE UPDATE ON breeding_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (for future auth integration)
ALTER TABLE sows ENABLE ROW LEVEL SECURITY;
ALTER TABLE sires ENABLE ROW LEVEL SECURITY;
ALTER TABLE breeding_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_history ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations for now (can be restricted later with auth)
CREATE POLICY "Allow all access to sows" ON sows FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to sires" ON sires FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to breeding_records" ON breeding_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to ai_reports" ON ai_reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to ai_chat_history" ON ai_chat_history FOR ALL USING (true) WITH CHECK (true);
