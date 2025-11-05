package ai.smartboard.smartboard_api.model;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for Board model
 */
class BoardTest {
    
    @Test
    void testBoardCreation() {
        Board board = new Board("My Board", "Test Board", "user123");
        
        assertNotNull(board.getId());
        assertEquals("My Board", board.getTitle());
        assertEquals("Test Board", board.getDescription());
        assertEquals("user123", board.getUserId());
        assertNotNull(board.getCreatedAt());
        assertNotNull(board.getUpdatedAt());
        assertNotNull(board.getTasks());
        assertTrue(board.getTasks().isEmpty());
    }
    
    @Test
    void testAddTaskToBoard() {
        Board board = new Board("My Board", "Description", "user123");
        Task task = new Task("Task 1", "Description");
        
        board.addTask(task);
        
        assertEquals(1, board.getTasks().size());
        assertEquals(board.getId(), task.getBoardId());
        assertTrue(board.getTasks().contains(task));
    }
    
    @Test
    void testRemoveTaskFromBoard() {
        Board board = new Board("My Board", "Description", "user123");
        Task task = new Task("Task 1", "Description");
        
        board.addTask(task);
        assertEquals(1, board.getTasks().size());
        
        boolean removed = board.removeTask(task.getId());
        
        assertTrue(removed);
        assertEquals(0, board.getTasks().size());
    }
    
    @Test
    void testRemoveNonExistentTask() {
        Board board = new Board("My Board", "Description", "user123");
        
        boolean removed = board.removeTask("non-existent-id");
        
        assertFalse(removed);
    }
}

