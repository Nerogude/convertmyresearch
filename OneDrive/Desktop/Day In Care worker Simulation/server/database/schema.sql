-- Day in Care Training Simulation Database Schema

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table with role-based access
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('admin', 'manager', 'learner')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Scenarios table
CREATE TABLE IF NOT EXISTS scenarios (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    module VARCHAR(100),
    estimated_time INTEGER, -- in minutes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scenario nodes (for branching narratives)
CREATE TABLE IF NOT EXISTS scenario_nodes (
    id SERIAL PRIMARY KEY,
    scenario_id INTEGER REFERENCES scenarios(id) ON DELETE CASCADE,
    node_key VARCHAR(50) NOT NULL, -- e.g., 'start', 'choice_1a', 'choice_1b'
    content TEXT NOT NULL,
    question TEXT,
    is_ending BOOLEAN DEFAULT FALSE,
    client_status_impact INTEGER DEFAULT 0, -- -10 to +10
    wellbeing_impact INTEGER DEFAULT 0, -- -10 to +10
    UNIQUE(scenario_id, node_key)
);

-- Choices within scenario nodes
CREATE TABLE IF NOT EXISTS scenario_choices (
    id SERIAL PRIMARY KEY,
    node_id INTEGER REFERENCES scenario_nodes(id) ON DELETE CASCADE,
    choice_text TEXT NOT NULL,
    next_node_key VARCHAR(50) NOT NULL,
    is_best_practice BOOLEAN DEFAULT FALSE,
    is_valid_alternative BOOLEAN DEFAULT FALSE,
    feedback_text TEXT
);

-- Care plans for scenarios
CREATE TABLE IF NOT EXISTS care_plans (
    id SERIAL PRIMARY KEY,
    scenario_id INTEGER REFERENCES scenarios(id) ON DELETE CASCADE,
    client_name VARCHAR(100) NOT NULL,
    age INTEGER,
    diagnosis TEXT,
    care_needs TEXT,
    communication_needs TEXT,
    risk_assessment TEXT,
    allergies TEXT,
    medication TEXT
);

-- User progress tracking
CREATE TABLE IF NOT EXISTS user_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    scenario_id INTEGER REFERENCES scenarios(id) ON DELETE CASCADE,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    current_node_key VARCHAR(50),
    client_status INTEGER DEFAULT 50, -- 0-100 scale
    wellbeing INTEGER DEFAULT 50, -- 0-100 scale
    UNIQUE(user_id, scenario_id, started_at)
);

-- Decision tracking for analytics
CREATE TABLE IF NOT EXISTS user_decisions (
    id SERIAL PRIMARY KEY,
    progress_id INTEGER REFERENCES user_progress(id) ON DELETE CASCADE,
    node_id INTEGER REFERENCES scenario_nodes(id) ON DELETE CASCADE,
    choice_id INTEGER REFERENCES scenario_choices(id) ON DELETE CASCADE,
    decision_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- End of shift reports
CREATE TABLE IF NOT EXISTS shift_reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    shift_date DATE DEFAULT CURRENT_DATE,
    scenarios_completed INTEGER DEFAULT 0,
    best_practice_decisions INTEGER DEFAULT 0,
    valid_alternative_decisions INTEGER DEFAULT 0,
    suboptimal_decisions INTEGER DEFAULT 0,
    final_wellbeing INTEGER,
    key_learning_moments TEXT,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_progress_user ON user_progress(user_id);
CREATE INDEX idx_progress_scenario ON user_progress(scenario_id);
CREATE INDEX idx_decisions_progress ON user_decisions(progress_id);
CREATE INDEX idx_scenario_nodes ON scenario_nodes(scenario_id);
