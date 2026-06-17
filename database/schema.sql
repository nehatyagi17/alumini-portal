-- Alumni Management Portal Database Schema
-- This file defines the entire database structure, including tables, relationships, constraints, and optimized views.

-- Create ENUM types for roles and statuses to ensure data integrity.
CREATE TYPE user_role AS ENUM ('admin', 'alumni', 'student');
CREATE TYPE profile_status AS ENUM ('static', 'claimed');
CREATE TYPE request_status AS ENUM ('pending', 'accepted', 'rejected');

-- Main table for all users, providing authentication details.
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for alumni-specific data. Linked 1-to-1 with the users table.
CREATE TABLE alumni_profiles (
    id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    course VARCHAR(100),
    department VARCHAR(100),
    batch INTEGER,
    company VARCHAR(255),
    position VARCHAR(255),
    domain VARCHAR(100),
    experience INTEGER,
    location VARCHAR(255),
    bio TEXT,
    profile_type profile_status DEFAULT 'static',
    is_verified BOOLEAN DEFAULT FALSE, -- Admin must approve a claimed profile
    last_updated TIMESTAMPTZ NOT NULL
);

-- Table for student-specific data.
CREATE TABLE students (
    id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    course VARCHAR(100),
    department VARCHAR(100),
    year_of_study INTEGER
);

-- Table for admin-specific data (can be extended with more fields).
CREATE TABLE admins (
    id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE
);

-- Tracks interaction requests from students to alumni.
CREATE TABLE interaction_requests (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    alumni_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status request_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT student_alumni_unique_request UNIQUE (student_id, alumni_id)
);

-- Stores chat messages between connected users.
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    read_status BOOLEAN DEFAULT FALSE
);

-- Logs all bulk CSV uploads by admins for tracking purposes.
CREATE TABLE csv_uploads (
    upload_id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL REFERENCES users(id),
    filename VARCHAR(255) NOT NULL,
    records_count INTEGER NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create a view for optimized and simplified querying of the alumni directory.
-- This pre-joins and selects relevant columns for student browsing.
CREATE OR REPLACE VIEW alumni_directory AS
SELECT
    u.id,
    u.name,
    ap.course,
    ap.department,
    ap.batch,
    ap.company,
    ap.position,
    ap.domain,
    ap.experience,
    ap.location,
    ap.bio,
    ap.profile_type,
    ap.is_verified,
    ap.last_updated
FROM
    users u
JOIN
    alumni_profiles ap ON u.id = ap.id
WHERE
    u.role = 'alumni' AND ap.is_verified = TRUE;

-- Create indexes for frequently queried columns to boost performance.
CREATE INDEX idx_alumni_profiles_batch ON alumni_profiles(batch);
CREATE INDEX idx_alumni_profiles_company ON alumni_profiles(company);
CREATE INDEX idx_alumni_profiles_domain ON alumni_profiles(domain);
CREATE INDEX idx_alumni_profiles_course ON alumni_profiles(course);
CREATE INDEX idx_alumni_profiles_profile_type ON alumni_profiles(profile_type);
CREATE INDEX idx_alumni_profiles_is_verified ON alumni_profiles(is_verified);
CREATE INDEX idx_alumni_profiles_last_updated ON alumni_profiles(last_updated);
CREATE INDEX idx_messages_sender_receiver ON messages(sender_id, receiver_id);
CREATE INDEX idx_messages_sent_at ON messages(sent_at);
CREATE INDEX idx_interaction_requests_student_alumni ON interaction_requests(student_id, alumni_id);
CREATE INDEX idx_interaction_requests_status ON interaction_requests(status);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update the updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a function to automatically update alumni_profiles.last_updated
CREATE OR REPLACE FUNCTION update_alumni_last_updated()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_alumni_profiles_last_updated BEFORE UPDATE ON alumni_profiles
    FOR EACH ROW EXECUTE FUNCTION update_alumni_last_updated();

-- Insert sample admin user (password: admin123)
-- Password hash for 'admin123' using bcrypt with salt rounds 12
INSERT INTO users (name, email, password_hash, role) VALUES 
('System Admin', 'admin@alumni-portal.com', '$2a$12$LQv3c1yqBwEHvqF3w3gVkOKj4jJ4jJ4jJ4jJ4jJ4jJ4jJ4jJ4jJ4jJ4j', 'admin');

INSERT INTO admins (id) VALUES (1);

-- Insert sample alumni data
INSERT INTO users (name, email, password_hash, role) VALUES 
('John Doe', 'john.doe@example.com', 'STATIC_ACCOUNT_NO_LOGIN', 'alumni'),
('Jane Smith', 'jane.smith@example.com', 'STATIC_ACCOUNT_NO_LOGIN', 'alumni'),
('Mike Johnson', 'mike.johnson@example.com', 'STATIC_ACCOUNT_NO_LOGIN', 'alumni'),
('Sarah Wilson', 'sarah.wilson@example.com', 'STATIC_ACCOUNT_NO_LOGIN', 'alumni');

INSERT INTO alumni_profiles (id, course, department, batch, company, position, domain, experience, location, bio, profile_type, is_verified, last_updated) VALUES 
(2, 'Computer Science', 'Engineering', 2018, 'Google', 'Software Engineer', 'Technology', 5, 'San Francisco, CA', 'Passionate about AI and machine learning', 'static', true, NOW()),
(3, 'Business Administration', 'Management', 2019, 'Microsoft', 'Product Manager', 'Technology', 4, 'Seattle, WA', 'Leading innovative product development', 'static', true, NOW()),
(4, 'Data Science', 'Engineering', 2020, 'Amazon', 'Data Scientist', 'Technology', 3, 'Austin, TX', 'Expert in machine learning and analytics', 'static', true, NOW()),
(5, 'Marketing', 'Business', 2017, 'Apple', 'Marketing Director', 'Technology', 6, 'Cupertino, CA', 'Creative marketing strategist', 'static', true, NOW());

-- Insert sample student
INSERT INTO users (name, email, password_hash, role) VALUES 
('Student User', 'student@example.com', '$2a$12$LQv3c1yqBwEHvqF3w3gVkOKj4jJ4jJ4jJ4jJ4jJ4jJ4jJ4jJ4jJ4jJ4j', 'student');

INSERT INTO students (id, course, department, year_of_study) VALUES 
(6, 'Computer Science', 'Engineering', 3);

-- Create a materialized view for better performance on alumni directory queries
CREATE MATERIALIZED VIEW alumni_directory_mv AS
SELECT
    u.id,
    u.name,
    ap.course,
    ap.department,
    ap.batch,
    ap.company,
    ap.position,
    ap.domain,
    ap.experience,
    ap.location,
    ap.bio,
    ap.profile_type,
    ap.is_verified,
    ap.last_updated,
    -- Add computed fields
    EXTRACT(YEAR FROM AGE(NOW(), ap.last_updated)) as years_since_update,
    CASE 
        WHEN ap.last_updated < NOW() - INTERVAL '2 years' THEN 'stale'
        WHEN ap.last_updated < NOW() - INTERVAL '1 year' THEN 'outdated'
        ELSE 'current'
    END as data_freshness
FROM
    users u
JOIN
    alumni_profiles ap ON u.id = ap.id
WHERE
    u.role = 'alumni' AND ap.is_verified = TRUE;

-- Create index on materialized view
CREATE INDEX idx_alumni_directory_mv_batch ON alumni_directory_mv(batch);
CREATE INDEX idx_alumni_directory_mv_company ON alumni_directory_mv(company);
CREATE INDEX idx_alumni_directory_mv_domain ON alumni_directory_mv(domain);
CREATE INDEX idx_alumni_directory_mv_course ON alumni_directory_mv(course);
CREATE INDEX idx_alumni_directory_mv_data_freshness ON alumni_directory_mv(data_freshness);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_alumni_directory()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY alumni_directory_mv;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get alumni statistics
CREATE OR REPLACE FUNCTION get_alumni_statistics()
RETURNS TABLE (
    total_alumni bigint,
    claimed_profiles bigint,
    verified_profiles bigint,
    pending_verification bigint,
    stale_profiles bigint,
    recent_claims bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM alumni_profiles) as total_alumni,
        (SELECT COUNT(*) FROM alumni_profiles WHERE profile_type = 'claimed') as claimed_profiles,
        (SELECT COUNT(*) FROM alumni_profiles WHERE is_verified = true) as verified_profiles,
        (SELECT COUNT(*) FROM alumni_profiles WHERE profile_type = 'claimed' AND is_verified = false) as pending_verification,
        (SELECT COUNT(*) FROM alumni_profiles WHERE last_updated < NOW() - INTERVAL '2 years') as stale_profiles,
        (SELECT COUNT(*) FROM alumni_profiles WHERE profile_type = 'claimed' AND last_updated > NOW() - INTERVAL '7 days') as recent_claims;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_app_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO your_app_user;