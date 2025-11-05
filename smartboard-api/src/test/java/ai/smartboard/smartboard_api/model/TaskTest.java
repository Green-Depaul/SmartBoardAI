package ai.smartboard.smartboard_api.model;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for Task model
 */
class TaskTest {
    
    @Test
    void testTaskCreation() {
        Task task = new Task("Test Task", "Test Description");
        
        assertNotNull(task.getId());
        assertEquals("Test Task", task.getTitle());
        assertEquals("Test Description", task.getDescription());
        assertEquals(Task.TaskStatus.TODO, task.getStatus());
        assertEquals(Task.TaskPriority.MEDIUM, task.getPriority());
        assertNotNull(task.getCreatedAt());
        assertNotNull(task.getUpdatedAt());
    }
    
    @Test
    void testTaskWithStatus() {
        Task task = new Task("Task", "Description", Task.TaskStatus.IN_PROGRESS, Task.TaskPriority.HIGH);
        
        assertEquals(Task.TaskStatus.IN_PROGRESS, task.getStatus());
        assertEquals(Task.TaskPriority.HIGH, task.getPriority());
    }
    
    @Test
    void testMoveToStatus() {
        Task task = new Task("Test Task", "Description");
        assertEquals(Task.TaskStatus.TODO, task.getStatus());
        
        task.moveToStatus(Task.TaskStatus.DONE);
        assertEquals(Task.TaskStatus.DONE, task.getStatus());
    }
    
    @Test
    void testTaskStatusFromString() {
        assertEquals(Task.TaskStatus.TODO, Task.TaskStatus.fromString("todo"));
        assertEquals(Task.TaskStatus.TODO, Task.TaskStatus.fromString("TODO"));
        assertEquals(Task.TaskStatus.IN_PROGRESS, Task.TaskStatus.fromString("in_progress"));
        assertEquals(Task.TaskStatus.DONE, Task.TaskStatus.fromString("done"));
        assertEquals(Task.TaskStatus.TODO, Task.TaskStatus.fromString("invalid")); // Default
    }
    
    @Test
    void testTaskPriorityFromString() {
        assertEquals(Task.TaskPriority.LOW, Task.TaskPriority.fromString("low"));
        assertEquals(Task.TaskPriority.MEDIUM, Task.TaskPriority.fromString("medium"));
        assertEquals(Task.TaskPriority.HIGH, Task.TaskPriority.fromString("high"));
        assertEquals(Task.TaskPriority.URGENT, Task.TaskPriority.fromString("urgent"));
        assertEquals(Task.TaskPriority.MEDIUM, Task.TaskPriority.fromString("invalid")); // Default
    }
}

