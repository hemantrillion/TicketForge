-- TicketForge PostgreSQL Schema Initializer (V1)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- USERS
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    name            VARCHAR(255) NOT NULL,
    role            VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- VENUES
CREATE TABLE IF NOT EXISTS venues (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    address         TEXT,
    total_capacity  INTEGER NOT NULL CHECK (total_capacity > 0)
);

-- EVENTS
CREATE TABLE IF NOT EXISTS events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id        UUID NOT NULL REFERENCES venues(id),
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    starts_at       TIMESTAMPTZ NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'upcoming'
                    CHECK (status IN ('upcoming', 'on_sale', 'sold_out', 'completed', 'cancelled')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_events_venue ON events(venue_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

-- SEATS
CREATE TABLE IF NOT EXISTS seats (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id        UUID NOT NULL REFERENCES events(id),
    seat_label      VARCHAR(20) NOT NULL,
    section         VARCHAR(50),
    price           NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    status          VARCHAR(20) NOT NULL DEFAULT 'available'
                    CHECK (status IN ('available', 'held', 'booked')),
    UNIQUE (event_id, seat_label)
);
CREATE INDEX IF NOT EXISTS idx_seats_event ON seats(event_id);
CREATE INDEX IF NOT EXISTS idx_seats_status ON seats(event_id, status);

-- SEAT HOLDS
CREATE TABLE IF NOT EXISTS seat_holds (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seat_id         UUID NOT NULL REFERENCES seats(id),
    user_id         UUID NOT NULL REFERENCES users(id),
    session_id      VARCHAR(255) NOT NULL,
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_seat_holds_seat ON seat_holds(seat_id);
CREATE INDEX IF NOT EXISTS idx_seat_holds_expiry ON seat_holds(expires_at);

-- BOOKINGS
CREATE TABLE IF NOT EXISTS bookings (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES users(id),
    event_id          UUID NOT NULL REFERENCES events(id),
    status            VARCHAR(20) NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    idempotency_key   VARCHAR(255) UNIQUE NOT NULL,
    total_amount      NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_event ON bookings(event_id);

-- BOOKING_SEATS (join table)
CREATE TABLE IF NOT EXISTS booking_seats (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id      UUID NOT NULL REFERENCES bookings(id),
    seat_id         UUID NOT NULL REFERENCES seats(id),
    UNIQUE (seat_id)
);
CREATE INDEX IF NOT EXISTS idx_booking_seats_booking ON booking_seats(booking_id);

-- PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id          UUID NOT NULL REFERENCES bookings(id),
    amount              NUMERIC(10,2) NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
    provider_reference  VARCHAR(255),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);

-- RATE LIMIT RECORDS
CREATE TABLE IF NOT EXISTS rate_limit_records (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier      VARCHAR(255) NOT NULL,
    window_start    TIMESTAMPTZ NOT NULL,
    request_count   INTEGER NOT NULL DEFAULT 0,
    limit_type      VARCHAR(20) NOT NULL CHECK (limit_type IN ('token_bucket', 'sliding_window'))
);
CREATE INDEX IF NOT EXISTS idx_rate_limit_identifier ON rate_limit_records(identifier, window_start);

-- AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id         VARCHAR(255),
    actor_type       VARCHAR(20) NOT NULL CHECK (actor_type IN ('user', 'admin', 'system')),
    action           VARCHAR(100) NOT NULL,
    target_type      VARCHAR(50),
    target_id        VARCHAR(255),
    metadata         JSONB,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);

-- SEED DATA
DO $$
DECLARE
    v_id UUID;
    e_id UUID;
    u_id UUID;
    i INT;
BEGIN
    -- Seed Venue
    INSERT INTO venues (name, address, total_capacity)
    VALUES ('Metropolis Arena', '100 Stadium Way, City Center', 50000)
    RETURNING id INTO v_id;

    -- Seed Event
    INSERT INTO events (venue_id, title, description, starts_at, status)
    VALUES (v_id, 'Grand Stadium On-Sale Concert 2026', 'Live high-concurrency ticket event', '2026-09-01 20:00:00+00', 'on_sale')
    RETURNING id INTO e_id;

    -- Seed Seats A1 to A50
    FOR i IN 1..50 LOOP
        INSERT INTO seats (event_id, seat_label, section, price, status)
        VALUES (e_id, 'A' || i, 'VIP', 150.00, 'available');
    END LOOP;

    -- Seed Admin User (Password: AdminPassword123!)
    INSERT INTO users (email, password_hash, name, role)
    VALUES ('admin@ticketforge.com', '$2a$10$wK1L8zJ3C.11sXv1G3pDk.vYg4O7J1tT2rM8nQ9sR0uV1wX2yZ3a', 'Admin User', 'admin')
    ON CONFLICT (email) DO NOTHING;
END $$;
