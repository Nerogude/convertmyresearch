-- Care Worker Training Platform Database Schema

-- Organizations (Care Homes)
CREATE TABLE organizations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    org_code VARCHAR(10) UNIQUE NOT NULL,
    license_type ENUM('trial', 'full') DEFAULT 'trial',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Users (Managers, Staff, Admins)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'manager', 'staff') NOT NULL,
    organization_id INT,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- User Training Progress
CREATE TABLE user_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    scenario_id INT NOT NULL,
    status ENUM('not_started', 'in_progress', 'completed') DEFAULT 'not_started',
    score INT DEFAULT 0,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_scenario (user_id, scenario_id)
);

-- JWT Refresh Tokens
CREATE TABLE refresh_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert sample data
INSERT INTO organizations (name, address, phone, email, org_code, license_type) VALUES
('Sunshine Care Home', '123 Care Street, London', '020 1234 5678', 'admin@sunshinecare.co.uk', 'SUNSHI', 'trial'),
('Meadow View Care', '456 Meadow Road, Manchester', '0161 234 5678', 'info@meadowview.co.uk', 'MEADOW', 'full'),
('Demo Care Home', '789 Demo Street, Birmingham', '0121 123 4567', 'demo@democare.co.uk', 'DEMO01', 'trial');

-- Sample users
INSERT INTO users (email, password_hash, first_name, last_name, role, organization_id) VALUES
('manager@sunshinecare.co.uk', '$2a$10$dummy.hash.for.testing', 'Sarah', 'Johnson', 'manager', 1),
('staff@sunshinecare.co.uk', '$2a$10$dummy.hash.for.testing', 'Mike', 'Smith', 'staff', 1),
('admin@platform.com', '$2a$10$dummy.hash.for.testing', 'Admin', 'User', 'admin', NULL);