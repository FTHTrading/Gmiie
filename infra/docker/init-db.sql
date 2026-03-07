-- XXXIII.IO PostgreSQL Init
-- Creates extensions needed for the platform

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";      -- Trigram similarity for fuzzy search
CREATE EXTENSION IF NOT EXISTS "btree_gin";     -- GIN index support
