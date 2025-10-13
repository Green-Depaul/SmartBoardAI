package ai.smartboard.smartboard_api.repository;

import ai.smartboard.smartboard_api.model.Task;
import ai.smartboard.smartboard_api.model.Task.TaskStatus;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * In-memory repository for Task entities
 * Uses ConcurrentHashMap for thread-safety
 * Can be replaced with JPA repository when database is added
 */
@Repository
public class TaskRepository {
    
    private final Map<String, Task> tasks = new ConcurrentHashMap<>();
    
    /**
     * Find all tasks
     */
    public List<Task> findAll() {
        return new ArrayList<>(tasks.values());
    }
    
    /**
     * Find task by ID
     */
    public Optional<Task> findById(String id) {
        return Optional.ofNullable(tasks.get(id));
    }
    
    /**
     * Find tasks by board ID
     */
    public List<Task> findByBoardId(String boardId) {
        return tasks.values().stream()
                .filter(task -> task.getBoardId() != null && task.getBoardId().equals(boardId))
                .sorted(Comparator.comparingInt(Task::getOrder))
                .collect(Collectors.toList());
    }
    
    /**
     * Find tasks by status
     */
    public List<Task> findByStatus(TaskStatus status) {
        return tasks.values().stream()
                .filter(task -> task.getStatus() == status)
                .collect(Collectors.toList());
    }
    
    /**
     * Find tasks by board ID and status
     */
    public List<Task> findByBoardIdAndStatus(String boardId, TaskStatus status) {
        return tasks.values().stream()
                .filter(task -> task.getBoardId() != null && 
                               task.getBoardId().equals(boardId) && 
                               task.getStatus() == status)
                .sorted(Comparator.comparingInt(Task::getOrder))
                .collect(Collectors.toList());
    }
    
    /**
     * Find tasks assigned to a user
     */
    public List<Task> findByAssignedTo(String userId) {
        return tasks.values().stream()
                .filter(task -> task.getAssignedTo() != null && task.getAssignedTo().equals(userId))
                .collect(Collectors.toList());
    }
    
    /**
     * Save or update a task
     */
    public Task save(Task task) {
        if (task.getId() == null || task.getId().isEmpty()) {
            task.setId(UUID.randomUUID().toString());
        }
        task.touch();
        tasks.put(task.getId(), task);
        return task;
    }
    
    /**
     * Delete a task by ID
     */
    public boolean deleteById(String id) {
        return tasks.remove(id) != null;
    }
    
    /**
     * Delete all tasks by board ID
     */
    public int deleteByBoardId(String boardId) {
        List<String> tasksToDelete = tasks.values().stream()
                .filter(task -> task.getBoardId() != null && task.getBoardId().equals(boardId))
                .map(Task::getId)
                .collect(Collectors.toList());
        
        tasksToDelete.forEach(tasks::remove);
        return tasksToDelete.size();
    }
    
    /**
     * Check if task exists
     */
    public boolean existsById(String id) {
        return tasks.containsKey(id);
    }
    
    /**
     * Count all tasks
     */
    public long count() {
        return tasks.size();
    }
    
    /**
     * Count tasks by board ID
     */
    public long countByBoardId(String boardId) {
        return tasks.values().stream()
                .filter(task -> task.getBoardId() != null && task.getBoardId().equals(boardId))
                .count();
    }
    
    /**
     * Delete all tasks (useful for testing)
     */
    public void deleteAll() {
        tasks.clear();
    }
}

