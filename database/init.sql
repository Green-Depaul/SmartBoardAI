-- Drop tables if they exist (resets schema during development)
-- Remove or comment out this section for production
DROP TABLE IF EXISTS ai_responses;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS user_stories;
DROP TABLE IF EXISTS project_ideas;
DROP TABLE IF EXISTS priorities;

-- PRIORITIES TABLE (Lookup)
CREATE TABLE priorities (
    id SMALLINT AUTO_INCREMENT PRIMARY KEY,
    label VARCHAR(50) NOT NULL UNIQUE
);

-- PROJECT IDEAS TABLE (Ingestion Point)
CREATE TABLE project_ideas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    raw_text TEXT NOT NULL,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- USER STORIES TABLE
CREATE TABLE user_stories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    acceptance_criteria TEXT,
    priority_id SMALLINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'todo',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (priority_id) REFERENCES priorities(id) ON DELETE RESTRICT
);

-- TASKS TABLE
CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_story_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority_id SMALLINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'todo',
    estimated_hours DECIMAL(5,2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_story_id) REFERENCES user_stories(id) ON DELETE CASCADE,
    FOREIGN KEY (priority_id) REFERENCES priorities(id) ON DELETE RESTRICT
);

-- AI RESPONSES TABLE (LLM Logging)
CREATE TABLE ai_responses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NULL,
    user_story_id INT NULL,
    task_id INT NULL,
    prompt_text TEXT NOT NULL,
    response_text TEXT NOT NULL,
    generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    model_name VARCHAR(50) NOT NULL,
    tokens_used INT,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    FOREIGN KEY (user_story_id) REFERENCES user_stories(id) ON DELETE SET NULL,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
);

-- Insert default priorities
INSERT INTO priorities (label) VALUES ('Low'), ('Medium'), ('High'), ('Critical');
