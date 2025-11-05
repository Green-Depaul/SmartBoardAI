-- Initial database setup for SmartBoardAI (H2 in-memory)
-- This script is executed on startup via spring.sql.init.* properties

CREATE TABLE IF NOT EXISTS boards (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(64) PRIMARY KEY,
    board_id VARCHAR(64),
    title VARCHAR(255) NOT NULL,
    description CLOB,
    status VARCHAR(32) NOT NULL,
    priority VARCHAR(32) NOT NULL,
    assigned_to VARCHAR(64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP,
    order_index INT,
    CONSTRAINT fk_tasks_board FOREIGN KEY (board_id) REFERENCES boards(id)
);

-- Optional seed data (safe to run multiple times with MERGE)
MERGE INTO boards (id, name) KEY(id) VALUES ('board-1', 'Default Board');

MERGE INTO tasks (id, board_id, title, description, status, priority, assigned_to, created_at, updated_at, order_index)
KEY(id)
VALUES ('task-1', 'board-1', 'Initial Task', 'This is a seeded task from init.sql', 'todo', 'medium', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0);
