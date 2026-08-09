-- Enables geospatial types/functions (ST_MakePoint, geography, GIST indexes)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enables gen_random_uuid() for UUID primary keys
CREATE EXTENSION IF NOT EXISTS pgcrypto;