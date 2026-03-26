-- Migration: Add delivery fields to breeding_records
-- This adds mummy count and average birth weight fields for complete delivery recording

-- Add litter_size_mummy column for mummy/stillborn piglets
ALTER TABLE breeding_records 
ADD COLUMN IF NOT EXISTS litter_size_mummy INTEGER DEFAULT 0;

-- Add avg_birth_weight column for average piglet weight at birth (in kg)
ALTER TABLE breeding_records 
ADD COLUMN IF NOT EXISTS avg_birth_weight DECIMAL(5,2);

-- Add comment for documentation
COMMENT ON COLUMN breeding_records.litter_size_mummy IS 'จำนวนลูกมัมมี่';
COMMENT ON COLUMN breeding_records.avg_birth_weight IS 'น้ำหนักแรกเกิดเฉลี่ย (กก.)';
