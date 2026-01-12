-- =====================================================
-- DATABASE MIGRATION FOR IMAGE UPLOAD FEATURES
-- =====================================================
-- This migration adds image storage columns for
-- inventory parts and PC specifications
-- Safe to run multiple times (uses IF NOT EXISTS)
-- =====================================================

-- ===== MATERIALS TABLE (INVENTORY/PARTS) =====
-- Add image_path column for part images
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'materials' 
        AND column_name = 'image_path'
    ) THEN
        ALTER TABLE materials ADD COLUMN image_path TEXT;
        RAISE NOTICE 'Added image_path column to materials table';
    ELSE
        RAISE NOTICE 'Column image_path already exists in materials table';
    END IF;
END $$;

-- ===== BRANCH_PCS TABLE (PC SPECIFICATIONS) =====
-- Add motherboard_serial column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'branch_pcs' 
        AND column_name = 'motherboard_serial'
    ) THEN
        ALTER TABLE branch_pcs ADD COLUMN motherboard_serial TEXT;
        RAISE NOTICE 'Added motherboard_serial column to branch_pcs table';
    ELSE
        RAISE NOTICE 'Column motherboard_serial already exists in branch_pcs table';
    END IF;
END $$;

-- Add pc_image_path column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'branch_pcs' 
        AND column_name = 'pc_image_path'
    ) THEN
        ALTER TABLE branch_pcs ADD COLUMN pc_image_path TEXT;
        RAISE NOTICE 'Added pc_image_path column to branch_pcs table';
    ELSE
        RAISE NOTICE 'Column pc_image_path already exists in branch_pcs table';
    END IF;
END $$;

-- ===== VERIFICATION QUERIES =====
-- Run these to verify the migration succeeded
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'materials' 
-- ORDER BY ordinal_position;

-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'branch_pcs' 
-- ORDER BY ordinal_position;

-- ===== MIGRATION COMPLETE =====
