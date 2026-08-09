-- ==========================================================
-- Waynder core schema
-- ==========================================================

CREATE TABLE IF NOT EXISTS users (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name           VARCHAR(150) NOT NULL,
    email          VARCHAR(255) NOT NULL UNIQUE,
    password_hash  VARCHAR(255) NOT NULL,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS plans (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name         VARCHAR(150) NOT NULL,
    description  TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------
-- Landmarks: lat/lng are the source of truth for computation.
-- `address` is display-only, never used for routing/proximity.
-- `location` is a geography point kept in sync via trigger below,
-- used only for fast radius/proximity queries (ST_DWithin).
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS landmarks (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name               VARCHAR(200) NOT NULL,
    description        TEXT,
    address            VARCHAR(300),
    lat                DOUBLE PRECISION NOT NULL,
    lng                DOUBLE PRECISION NOT NULL,
    location           GEOGRAPHY(Point, 4326),
    source             VARCHAR(50) NOT NULL,   -- 'osm' | 'foursquare' | 'scraped' | 'manual'
    external_id        VARCHAR(150),
    image_url  VARCHAR(500),
    popularity_score   INTEGER NOT NULL DEFAULT 0,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_landmark_source UNIQUE (source, external_id)
);

CREATE INDEX IF NOT EXISTS idx_landmarks_location ON landmarks USING GIST (location);

-- Keeps `location` in sync automatically whenever lat/lng are written,
-- so application code never has to build the geography point itself.
CREATE OR REPLACE FUNCTION sync_landmark_location() RETURNS TRIGGER AS $$
BEGIN
    NEW.location := ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326)::geography;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_landmark_location ON landmarks;
CREATE TRIGGER trg_sync_landmark_location
    BEFORE INSERT OR UPDATE OF lat, lng ON landmarks
    FOR EACH ROW EXECUTE FUNCTION sync_landmark_location();

CREATE TABLE IF NOT EXISTS routes (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id        UUID REFERENCES plans(id) ON DELETE SET NULL,
    name           VARCHAR(150) NOT NULL,
    path_geometry  JSONB,   -- optimized path returned by the routing API
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS route_landmarks (
    route_id     UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    landmark_id  UUID NOT NULL REFERENCES landmarks(id) ON DELETE CASCADE,
    order_index  INTEGER NOT NULL,
    PRIMARY KEY (route_id, landmark_id)
);

CREATE TABLE IF NOT EXISTS saved_landmarks (
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    landmark_id  UUID NOT NULL REFERENCES landmarks(id) ON DELETE CASCADE,
    saved_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, landmark_id)
);

CREATE TABLE IF NOT EXISTS tags (
    id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name  VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS landmark_tags (
    landmark_id  UUID NOT NULL REFERENCES landmarks(id) ON DELETE CASCADE,
    tag_id       UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (landmark_id, tag_id)
);