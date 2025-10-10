package ai.smartboard.smartboard_api.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Represents a Task (card) on a Kanban Board
 * Compatible with frontend expectations
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Task {
    
    private String id;
    private String boardId; // Which board this task belongs to
    private String title;
    private String description;
    private TaskStatus status; // todo, in_progress, done
    private TaskPriority priority; // low, medium, high
    private String assignedTo; // User ID of assignee
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime dueDate;
    private int order; // For ordering tasks within a status column
    
    /**
     * Constructor for creating a new task
     */
    public Task(String title, String description, TaskStatus status, TaskPriority priority) {
        this.id = UUID.randomUUID().toString();
        this.title = title;
        this.description = description;
        this.status = status != null ? status : TaskStatus.TODO;
        this.priority = priority != null ? priority : TaskPriority.MEDIUM;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.order = 0;
    }
    
    /**
     * Simplified constructor
     */
    public Task(String title, String description) {
        this(title, description, TaskStatus.TODO, TaskPriority.MEDIUM);
    }
    
    /**
     * Update the task's timestamp
     */
    public void touch() {
        this.updatedAt = LocalDateTime.now();
    }
    
    /**
     * Move task to a different status
     */
    public void moveToStatus(TaskStatus newStatus) {
        this.status = newStatus;
        this.touch();
    }
    
    /**
     * Enum for task status (Kanban columns)
     */
    public enum TaskStatus {
        TODO("todo"),
        IN_PROGRESS("in_progress"),
        DONE("done");
        
        private final String value;
        
        TaskStatus(String value) {
            this.value = value;
        }
        
        public String getValue() {
            return value;
        }
        
        public static TaskStatus fromString(String value) {
            for (TaskStatus status : TaskStatus.values()) {
                if (status.value.equalsIgnoreCase(value) || status.name().equalsIgnoreCase(value)) {
                    return status;
                }
            }
            return TODO; // Default
        }
    }
    
    /**
     * Enum for task priority
     */
    public enum TaskPriority {
        LOW("low"),
        MEDIUM("medium"),
        HIGH("high"),
        URGENT("urgent");
        
        private final String value;
        
        TaskPriority(String value) {
            this.value = value;
        }
        
        public String getValue() {
            return value;
        }
        
        public static TaskPriority fromString(String value) {
            for (TaskPriority priority : TaskPriority.values()) {
                if (priority.value.equalsIgnoreCase(value) || priority.name().equalsIgnoreCase(value)) {
                    return priority;
                }
            }
            return MEDIUM; // Default
        }
    }
}

