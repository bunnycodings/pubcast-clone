-- MySQL Database Schema for PromptPay QR Generator Service
-- Database: u227507338_pubcast_db

-- IMPORTANT FOR SHARED HOSTING:
-- 1. Your database 'u227507338_pubcast_db' is already created by your hosting provider
-- 2. Open phpMyAdmin and select 'u227507338_pubcast_db' from the left sidebar
-- 3. Go to the "SQL" tab
-- 4. Copy and paste this entire file
-- 5. Click "Go" to execute

-- Select the database (if you have permission, otherwise select it manually in phpMyAdmin)
USE u227507338_pubcast_db;

-- Users table for registration
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    profile_photo MEDIUMTEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_phone (phone_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional: Payments/Transactions table for tracking payments
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    amount DECIMAL(10, 2) NOT NULL,
    service_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migration: Update existing TEXT column to MEDIUMTEXT to support larger images
-- Only run this if you have an existing profile_photo column as TEXT
-- This allows storing up to 16MB of base64 image data
-- If you get an error, the column is already MEDIUMTEXT or doesn't exist - that's fine!
ALTER TABLE users 
MODIFY COLUMN profile_photo MEDIUMTEXT NULL;

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Settings table for storing prices and promo text
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    description VARCHAR(255) NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_setting_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user
-- Default credentials (CHANGE AFTER FIRST LOGIN!):
-- Username: admin
-- Password: admin123
INSERT INTO admin_users (username, password_hash) 
VALUES ('admin', '$2b$10$f.ERTRA.MT/gIp9bVGrtPupHDX242j94DLpllB.6OsqDLIhn5wscW')
ON DUPLICATE KEY UPDATE username=username;

-- Insert default settings (services prices as JSON)
INSERT INTO settings (setting_key, setting_value, description) VALUES
('services', '{"image":{"id":"image","type":"MESSAGE_IMAGE","name":"ส่งรูปขึ้นจอ","description":"Send image to screen","minPrice":49,"thumbnail":"https://resize-img.pubcastplus.com/protected/default-gift/172bd56d-b7fb-4a61-be85-b220bf88152a.gif","variants":[{"id":"image_20","name":"20 วินาที","price":49,"duration":20},{"id":"image_40","name":"40 วินาที","price":89,"duration":40},{"id":"image_60","name":"60 วินาที","price":129,"duration":60}]},"message":{"id":"message","type":"MESSAGE","name":"ส่งข้อความขึ้นจอ","description":"Send message to screen","minPrice":29,"thumbnail":"https://resize-img.pubcastplus.com/protected/default-gift/4628e9fe-a2b3-4ff2-aa69-e0b7fab234f7.gif","variants":[{"id":"message_20","name":"20 วินาที","price":29,"duration":20},{"id":"message_40","name":"40 วินาที","price":49,"duration":40},{"id":"message_60","name":"60 วินาที","price":69,"duration":60}]},"video":{"id":"video","type":"MESSAGE_VIDEO","name":"ส่งวิดีโอขึ้นจอ","description":"Send video to screen","minPrice":99,"thumbnail":"https://resize-img.pubcastplus.com/protected/default-gift/17c11eda-0e26-4c26-b0de-3beb71c13e29.gif","variants":[{"id":"video_30","name":"30 วินาที","price":189,"duration":30},{"id":"video_45","name":"45 วินาที","price":229,"duration":45},{"id":"video_60","name":"60 วินาที","price":249,"duration":60}]}}', 'Services and pricing configuration'),
('promo_text', 'ส่งรูปขึ้นจอ ฟรี!', 'Promo banner title'),
('promo_subtext', '18:00 - 22:00 น. เท่านั้น', 'Promo banner subtitle')
ON DUPLICATE KEY UPDATE setting_key=setting_key;
