-- Migration: Add materials table extended columns
-- Description: Add part_type, status, serial_number, warranty_date, condition, timestamps, and image_path

ALTER TABLE materials ADD COLUMN IF NOT EXISTS part_type TEXT;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS serial_number TEXT;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS warranty_date TEXT;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS condition TEXT;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS image_path TEXT;
