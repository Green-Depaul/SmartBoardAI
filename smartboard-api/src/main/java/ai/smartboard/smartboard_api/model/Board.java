package ai.smartboard.smartboard_api.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Represents a Kanban Board
 * Each board contains multiple tasks and belongs to a user
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Board {
    
    private String id;
    private String title;
    private String description;
    private String userId; // Owner of the board
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<Task> tasks;
    
    /**
     * Constructor for creating a new board
     */
    public Board(String title, String description, String userId) {
        this.id = UUID.randomUUID().toString();
        this.title = title;
        this.description = description;
        this.userId = userId;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.tasks = new ArrayList<>();
    }
    
    /**
     * Add a task to this board
     */
    public void addTask(Task task) {
        if (this.tasks == null) {
            this.tasks = new ArrayList<>();
        }
        task.setBoardId(this.id);
        this.tasks.add(task);
        this.updatedAt = LocalDateTime.now();
    }
    
    /**
     * Remove a task from this board
     */
    public boolean removeTask(String taskId) {
        if (this.tasks == null) {
            return false;
        }
        boolean removed = this.tasks.removeIf(task -> task.getId().equals(taskId));
        if (removed) {
            this.updatedAt = LocalDateTime.now();
        }
        return removed;
    }
    
    /**
     * Update the board's timestamp
     */
    public void touch() {
        this.updatedAt = LocalDateTime.now();
    }
}

