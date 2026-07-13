-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: devices
-- ============================================
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    host VARCHAR(255) NOT NULL,
    protocol VARCHAR(10) NOT NULL CHECK (protocol IN ('ICMP', 'TCP')),
    port INTEGER CHECK (port >= 1 AND port <= 65535),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint: prevent duplicate host+protocol+port combinations
    CONSTRAINT uq_device_host_protocol_port UNIQUE (host, protocol, port)
);

-- Indexes for query performance
CREATE INDEX idx_devices_is_active ON devices(is_active);
CREATE INDEX idx_devices_host ON devices(host);
CREATE INDEX idx_devices_protocol ON devices(protocol);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_devices_updated_at
    BEFORE UPDATE ON devices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLE: monitoring_logs
-- ============================================
CREATE TABLE monitoring_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    status VARCHAR(10) NOT NULL CHECK (status IN ('UP', 'DOWN')),
    latency INTEGER, -- null if DOWN, milliseconds
    error_message TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for query performance
CREATE INDEX idx_monitoring_logs_device_id_timestamp 
    ON monitoring_logs(device_id, timestamp DESC);
CREATE INDEX idx_monitoring_logs_timestamp ON monitoring_logs(timestamp DESC);
CREATE INDEX idx_monitoring_logs_status ON monitoring_logs(status);

-- ============================================
-- TABLE: incidents
-- ============================================
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE, -- null = ongoing
    duration INTEGER, -- seconds, null if unresolved
    
    CONSTRAINT chk_resolved_after_started 
        CHECK (resolved_at IS NULL OR resolved_at >= started_at)
);

CREATE INDEX idx_incidents_device_id_started ON incidents(device_id, started_at DESC);
CREATE INDEX idx_incidents_resolved_at ON incidents(resolved_at) 
    WHERE resolved_at IS NOT NULL;
CREATE INDEX idx_incidents_ongoing ON incidents(device_id) 
    WHERE resolved_at IS NULL;

-- ============================================
-- TABLE: settings
-- ============================================
CREATE TABLE settings (
    key VARCHAR(255) PRIMARY KEY,
    value VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Default settings
INSERT INTO settings (key, value) VALUES 
    ('monitoring_interval_seconds', '60'),
    ('monitoring_timeout_seconds', '3'),
    ('max_concurrent_checks', '20'),
    ('log_retention_days', '30'),
    ('incident_retention_days', '365')
ON CONFLICT (key) DO NOTHING;

CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTION: handle_device_status_change
-- Called by monitoring engine when device status changes
-- ============================================
CREATE OR REPLACE FUNCTION handle_device_status_change(
    p_device_id UUID,
    p_new_status VARCHAR(10),
    p_check_timestamp TIMESTAMP WITH TIME ZONE
) RETURNS VOID AS $$
BEGIN
    IF p_new_status = 'DOWN' THEN
        -- Create new incident if no ongoing incident exists
        INSERT INTO incidents (device_id, started_at)
        SELECT p_device_id, p_check_timestamp
        WHERE NOT EXISTS (
            SELECT 1 FROM incidents 
            WHERE device_id = p_device_id AND resolved_at IS NULL
        );
    ELSIF p_new_status = 'UP' THEN
        -- Resolve ongoing incident
        UPDATE incidents 
        SET resolved_at = p_check_timestamp,
            duration = EXTRACT(EPOCH FROM (p_check_timestamp - started_at))::INTEGER
        WHERE device_id = p_device_id 
          AND resolved_at IS NULL;
    END IF;
END;
$$ LANGUAGE plpgsql;