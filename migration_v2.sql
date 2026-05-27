-- 1. Alter Users Table
ALTER TABLE users ADD COLUMN pro_since DATETIME;
ALTER TABLE users ADD COLUMN pro_expires_at DATETIME;
ALTER TABLE users ADD COLUMN pro_requested_at DATETIME;

-- 2. Alter Profiles Table
ALTER TABLE profiles ADD COLUMN show_watermark INTEGER DEFAULT 1;
ALTER TABLE profiles ADD COLUMN custom_css TEXT;
ALTER TABLE profiles ADD COLUMN social_links_json TEXT;

-- 3. Alter Links Table
ALTER TABLE links ADD COLUMN start_date DATETIME;
ALTER TABLE links ADD COLUMN end_date DATETIME;

-- 4. Create App Settings Table
CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed Settings Data
INSERT OR IGNORE INTO app_settings (key, value) VALUES
('membership_price_nrs', '100'),
('admin_whatsapp', '9779844245717'),
('admin_payment_instructions', 'Send exactly Rs. 100 via QR and put your username in the remarks.'),
('payment_qr_url', '');

-- 5. Create Payment Logs Table
CREATE TABLE IF NOT EXISTS payment_logs (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL REFERENCES users(username) ON DELETE CASCADE,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'NPR',
    transaction_id TEXT,
    payment_method TEXT DEFAULT 'QR Code',
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    receipt_image_url TEXT,
    admin_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payment_logs_username ON payment_logs(username);
CREATE INDEX IF NOT EXISTS idx_payment_logs_status ON payment_logs(status);
