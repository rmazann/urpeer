-- Add website field to workspaces table
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS website TEXT;

-- Make owner_id nullable for initial workspace creation
ALTER TABLE workspaces ALTER COLUMN owner_id DROP NOT NULL;
