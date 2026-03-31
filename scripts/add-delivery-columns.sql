-- Add piglet_count and delivered_date columns to breeding_records table
-- These columns track delivery information when status is updated to 'delivered'

ALTER TABLE breeding_records 
ADD COLUMN IF NOT EXISTS piglet_count INTEGER;

ALTER TABLE breeding_records 
ADD COLUMN IF NOT EXISTS delivered_date DATE;

-- Add comment for documentation
COMMENT ON COLUMN breeding_records.piglet_count IS 'Number of piglets born when status is delivered';
COMMENT ON COLUMN breeding_records.delivered_date IS 'Actual delivery date when sow gives birth';
