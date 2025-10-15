-- Align positions table with backend/frontend expectations
-- Adds stations (text[]), gross_salary (numeric), employment_type (text) if missing
-- Adds updated_at and basic indexes; migrates station_name -> stations for existing rows

DO $$
BEGIN
  -- stations array
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'positions' AND column_name = 'stations'
  ) THEN
    ALTER TABLE positions ADD COLUMN stations text[];
  END IF;

  -- gross_salary numeric
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'positions' AND column_name = 'gross_salary'
  ) THEN
    ALTER TABLE positions ADD COLUMN gross_salary numeric;
  END IF;

  -- employment_type text (some schemas already have this as varchar)
  -- Skip if it already exists with any type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'positions' AND column_name = 'employment_type'
  ) THEN
    ALTER TABLE positions ADD COLUMN employment_type text;
  END IF;

  -- status text default 'open' (ensure exists)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'positions' AND column_name = 'status'
  ) THEN
    ALTER TABLE positions ADD COLUMN status text DEFAULT 'open';
  END IF;

  -- applicants integer default 0 (ensure exists)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'positions' AND column_name = 'applicants'
  ) THEN
    ALTER TABLE positions ADD COLUMN applicants integer DEFAULT 0;
  END IF;

  -- description text (ensure exists)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'positions' AND column_name = 'description'
  ) THEN
    ALTER TABLE positions ADD COLUMN description text;
  END IF;

  -- posted_date and closing_date
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'positions' AND column_name = 'posted_date'
  ) THEN
    ALTER TABLE positions ADD COLUMN posted_date date;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'positions' AND column_name = 'closing_date'
  ) THEN
    ALTER TABLE positions ADD COLUMN closing_date date;
  END IF;

  -- updated_at timestamp
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'positions' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE positions ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;

  -- Ensure id has a default in dev (mock schema uses VARCHAR without default)
  -- Use uuid-ossp if available, fallback to gen_random_uuid if present
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'positions' AND column_name = 'id' AND column_default IS NULL
  ) THEN
    BEGIN
      -- try uuid_generate_v4() first
      EXECUTE 'ALTER TABLE positions ALTER COLUMN id SET DEFAULT uuid_generate_v4()::text';
    EXCEPTION WHEN undefined_function THEN
      -- fallback to gen_random_uuid()
      EXECUTE 'ALTER TABLE positions ALTER COLUMN id SET DEFAULT gen_random_uuid()::text';
    END;
  END IF;
END $$;

-- Backfill stations from station_name where applicable
UPDATE positions
SET stations = ARRAY[station_name]
WHERE stations IS NULL AND station_name IS NOT NULL;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_positions_status ON positions(status);
CREATE INDEX IF NOT EXISTS idx_positions_designation ON positions(designation);
