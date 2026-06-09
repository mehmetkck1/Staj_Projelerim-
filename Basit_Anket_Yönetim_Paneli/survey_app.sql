-- survey_app.sql
-- Import this file in phpMyAdmin -> Import
CREATE DATABASE IF NOT EXISTS survey_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE survey_app;

CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS polls (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question VARCHAR(255) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS poll_options (
  id INT AUTO_INCREMENT PRIMARY KEY,
  poll_id INT NOT NULL,
  option_text VARCHAR(255) NOT NULL,
  votes INT NOT NULL DEFAULT 0,
  FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
  INDEX(poll_id)
);

CREATE TABLE IF NOT EXISTS poll_votes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  poll_id INT NOT NULL,
  voter_ip VARCHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_vote (poll_id, voter_ip),
  FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE
);

-- Default admin: admin / Admin123!
INSERT INTO admins (username, password_hash)
SELECT 'admin', '$2y$10$VyvCSK6eV478MebD1aiZM.LjFatwp/Zpbv7Z0mVFq9MQ.UaJOfQ.y'
WHERE NOT EXISTS (SELECT 1 FROM admins WHERE username='admin');
