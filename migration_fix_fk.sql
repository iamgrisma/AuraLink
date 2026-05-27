-- ============================================================
-- MIGRATION: Remove FOREIGN KEY constraints to fix D1 crash
-- ============================================================
-- Cloudflare D1 dashboard crashes when introspecting tables with
-- deep ON DELETE CASCADE chains referencing non-PK UNIQUE columns.
-- This migration recreates all affected tables without FK constraints.
-- Referential integrity is already enforced in application code.
--
-- HOW TO RUN:
-- 1. Go to Cloudflare Dashboard > D1 > Your Database > Console
-- 2. Run each section ONE AT A TIME (not the whole file at once)
-- 3. After each section, verify data with: SELECT COUNT(*) FROM <table_name>;
-- ============================================================

-- ==========================================
-- STEP 1: Recreate PROFILES (the crashing table)
-- ==========================================
PRAGMA foreign_keys = OFF;

CREATE TABLE IF NOT EXISTS profiles_new (
    username TEXT PRIMARY KEY,
    name TEXT,
    bio TEXT,
    avatar_url TEXT,
    background_type TEXT DEFAULT 'gradient',
    background_value TEXT DEFAULT 'linear-gradient(135deg, #0f172a, #1e293b)',
    font TEXT DEFAULT 'Inter',
    button_style TEXT DEFAULT 'solid',
    button_color TEXT DEFAULT '#3b82f6',
    button_text_color TEXT DEFAULT '#ffffff',
    button_border_color TEXT DEFAULT 'transparent',
    font_color TEXT DEFAULT '#ffffff',
    google_analytics_id TEXT,
    seo_title TEXT,
    seo_description TEXT,
    allow_indexing INTEGER DEFAULT 1,
    show_watermark INTEGER DEFAULT 1,
    custom_css TEXT,
    social_links_json TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO profiles_new SELECT * FROM profiles;
DROP TABLE profiles;
ALTER TABLE profiles_new RENAME TO profiles;

-- ==========================================
-- STEP 2: Recreate LINKS (references profiles)
-- ==========================================
CREATE TABLE IF NOT EXISTS links_new (
    id TEXT PRIMARY KEY,
    username TEXT,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    display_order INTEGER DEFAULT 0,
    button_style TEXT DEFAULT NULL,
    button_color TEXT DEFAULT NULL,
    button_text_color TEXT DEFAULT NULL,
    button_border_color TEXT DEFAULT NULL,
    button_border_radius TEXT DEFAULT NULL,
    show_url INTEGER DEFAULT 0,
    image_url TEXT,
    icon_name TEXT,
    link_type TEXT DEFAULT 'link',
    price REAL,
    currency TEXT DEFAULT 'USD',
    start_date DATETIME,
    end_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO links_new SELECT * FROM links;
DROP TABLE links;
ALTER TABLE links_new RENAME TO links;
CREATE INDEX IF NOT EXISTS idx_links_username ON links(username);

-- ==========================================
-- STEP 3: Recreate ANALYTICS_VIEWS
-- ==========================================
CREATE TABLE IF NOT EXISTS analytics_views_new (
    id TEXT PRIMARY KEY,
    username TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    referrer TEXT DEFAULT 'Direct',
    user_agent TEXT,
    country TEXT
);

INSERT INTO analytics_views_new SELECT * FROM analytics_views;
DROP TABLE analytics_views;
ALTER TABLE analytics_views_new RENAME TO analytics_views;
CREATE INDEX IF NOT EXISTS idx_analytics_views_username ON analytics_views(username);

-- ==========================================
-- STEP 4: Recreate ANALYTICS_CLICKS
-- ==========================================
CREATE TABLE IF NOT EXISTS analytics_clicks_new (
    id TEXT PRIMARY KEY,
    username TEXT,
    link_id TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT
);

INSERT INTO analytics_clicks_new SELECT * FROM analytics_clicks;
DROP TABLE analytics_clicks;
ALTER TABLE analytics_clicks_new RENAME TO analytics_clicks;

-- ==========================================
-- STEP 5: Recreate PROFILE_REPORTS
-- ==========================================
CREATE TABLE IF NOT EXISTS profile_reports_new (
    id TEXT PRIMARY KEY,
    reported_username TEXT,
    reporter_id TEXT,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO profile_reports_new SELECT * FROM profile_reports;
DROP TABLE profile_reports;
ALTER TABLE profile_reports_new RENAME TO profile_reports;
CREATE INDEX IF NOT EXISTS idx_reports_status ON profile_reports(status);

-- ==========================================
-- STEP 6: Recreate USER_MEDIA
-- ==========================================
CREATE TABLE IF NOT EXISTS user_media_new (
    id TEXT PRIMARY KEY,
    username TEXT,
    file_key TEXT NOT NULL,
    size INTEGER NOT NULL,
    content_type TEXT,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO user_media_new SELECT * FROM user_media;
DROP TABLE user_media;
ALTER TABLE user_media_new RENAME TO user_media;
CREATE INDEX IF NOT EXISTS idx_user_media_username ON user_media(username);

-- ==========================================
-- STEP 7: Recreate PAYMENT_LOGS
-- ==========================================
CREATE TABLE IF NOT EXISTS payment_logs_new (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'NPR',
    transaction_id TEXT,
    payment_method TEXT DEFAULT 'QR Code',
    status TEXT DEFAULT 'pending',
    receipt_image_url TEXT,
    admin_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO payment_logs_new SELECT * FROM payment_logs;
DROP TABLE payment_logs;
ALTER TABLE payment_logs_new RENAME TO payment_logs;
CREATE INDEX IF NOT EXISTS idx_payment_logs_username ON payment_logs(username);
CREATE INDEX IF NOT EXISTS idx_payment_logs_status ON payment_logs(status);

PRAGMA foreign_keys = ON;

-- ==========================================
-- DONE! Verify everything:
-- ==========================================
-- SELECT COUNT(*) FROM profiles;
-- SELECT COUNT(*) FROM links;
-- SELECT COUNT(*) FROM analytics_views;
-- SELECT COUNT(*) FROM analytics_clicks;
-- SELECT COUNT(*) FROM profile_reports;
-- SELECT COUNT(*) FROM user_media;
-- SELECT COUNT(*) FROM payment_logs;
