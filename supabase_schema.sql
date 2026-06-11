-- Run this in your Supabase SQL editor to set up the schema

-- Stores the latest known location for each tracked device
CREATE TABLE IF NOT EXISTS device_locations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id   TEXT NOT NULL UNIQUE,        -- unique name/ID for the device
  group_id    TEXT NOT NULL DEFAULT '',     -- group scope (grp-xxx)
  label       TEXT,                         -- friendly display name
  latitude    DOUBLE PRECISION NOT NULL,
  longitude   DOUBLE PRECISION NOT NULL,
  accuracy    REAL,                         -- accuracy radius in meters
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE device_locations ENABLE ROW LEVEL SECURITY;

-- Allow anyone with the anon key to read and write (adjust for production)
CREATE POLICY "Allow public read" ON device_locations
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert/update" ON device_locations
  FOR ALL USING (true);

-- Enable Realtime for this table
-- (Also enable via Supabase Dashboard → Database → Replication → device_locations)
ALTER PUBLICATION supabase_realtime ADD TABLE device_locations;
