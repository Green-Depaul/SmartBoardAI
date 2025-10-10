package ai.smartboard.smartboard_api.repository;

import ai.smartboard.smartboard_api.model.Task;
import ai.smartboard.smartboard_api.model.Task.TaskStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for TaskRepository
 */
class TaskRepositoryTest {
    
    private TaskRepository taskRepository;
    
    @BeforeEach
    void setUp() {
        taskRepository = new TaskRepository();
        taskRepository.deleteAll();
    }
    
    @Test
    void testSaveAndFindTask() {
        Task task = new Task("Test Task", "Description");
        Task saved = taskRepository.save(task);
        
        assertNotNull(saved.getId());
        Optional<Task> found = taskRepository.findById(saved.getId());
        assertTrue(found.isPresent());
        assertEquals("Test Task", found.get().getTitle());
    }
    
    @Test
    void testFindByBoardId() {
        Task task1 = new Task("Task 1", "Description");
        task1.setBoardId("board1");
        Task task2 = new Task("Task 2", "Description");
        task2.setBoardId("board1");
        Task task3 = new Task("Task 3", "Description");
        task3.setBoardId("board2");
        
        taskRepository.save(task1);
        taskRepository.save(task2);
        taskRepository.save(task3);
        
        List<Task> board1Tasks = taskRepository.findByBoardId("board1");
        assertEquals(2, board1Tasks.size());
    }
    
    @Test
    void testFindByStatus() {
        Task task1 = new Task("Task 1", "Description", TaskStatus.TODO, Task.TaskPriority.MEDIUM);
        Task task2 = new Task("Task 2", "Description", TaskStatus.DONE, Task.TaskPriority.MEDIUM);
        
        taskRepository.save(task1);
        taskRepository.save(task2);
        
        List<Task> todoTasks = taskRepository.findByStatus(TaskStatus.TODO);
        assertEquals(1, todoTasks.size());
        assertEquals("Task 1", todoTasks.get(0).getTitle());
    }
    
    @Test
    void testDeleteTask() {
        Task task = new Task("Test Task", "Description");
        Task saved = taskRepository.save(task);
        
        assertTrue(taskRepository.existsById(saved.getId()));
        
        boolean deleted = taskRepository.deleteById(saved.getId());
        assertTrue(deleted);
        assertFalse(taskRepository.existsById(saved.getId()));
    }
    
    @Test
    void testDeleteByBoardId() {
        Task task1 = new Task("Task 1", "Description");
        task1.setBoardId("board1");
        Task task2 = new Task("Task 2", "Description");
        task2.setBoardId("board1");
        
        taskRepository.save(task1);
        taskRepository.save(task2);
        
        int deleted = taskRepository.deleteByBoardId("board1");
        assertEquals(2, deleted);
        assertEquals(0, taskRepository.countByBoardId("board1"));
    }
    
    @Test
    void testCountByBoardId() {
        Task task1 = new Task("Task 1", "Description");
        task1.setBoardId("board1");
        Task task2 = new Task("Task 2", "Description");
        task2.setBoardId("board1");
        
        taskRepository.save(task1);
        taskRepository.save(task2);
        
        assertEquals(2, taskRepository.countByBoardId("board1"));
    }
}

