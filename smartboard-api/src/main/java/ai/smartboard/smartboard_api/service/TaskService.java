package ai.smartboard.smartboard_api.service;

import ai.smartboard.smartboard_api.model.Task;
import ai.smartboard.smartboard_api.model.Task.TaskStatus;
import ai.smartboard.smartboard_api.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service layer for Task operations
 * Handles business logic for Kanban task cards
 */
@Service
public class TaskService {
    
    private final TaskRepository taskRepository;
    
    @Autowired
    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }
    
    /**
     * Get all tasks
     */
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }
    
    /**
     * Get task by ID
     */
    public Optional<Task> getTaskById(String id) {
        return taskRepository.findById(id);
    }
    
    /**
     * Get tasks by board ID
     */
    public List<Task> getTasksByBoardId(String boardId) {
        return taskRepository.findByBoardId(boardId);
    }
    
    /**
     * Get tasks by status
     */
    public List<Task> getTasksByStatus(TaskStatus status) {
        return taskRepository.findByStatus(status);
    }
    
    /**
     * Get tasks by board ID and status
     */
    public List<Task> getTasksByBoardIdAndStatus(String boardId, TaskStatus status) {
        return taskRepository.findByBoardIdAndStatus(boardId, status);
    }
    
    /**
     * Get tasks assigned to a user
     */
    public List<Task> getTasksByAssignedTo(String userId) {
        return taskRepository.findByAssignedTo(userId);
    }
    
    /**
     * Create a new task
     */
    public Task createTask(Task task) {
        if (task.getStatus() == null) {
            task.setStatus(TaskStatus.TODO);
        }
        if (task.getPriority() == null) {
            task.setPriority(Task.TaskPriority.MEDIUM);
        }
        return taskRepository.save(task);
    }
    
    /**
     * Update an existing task
     */
    public Optional<Task> updateTask(String id, Task updatedTask) {
        return taskRepository.findById(id)
                .map(existingTask -> {
                    if (updatedTask.getTitle() != null) {
                        existingTask.setTitle(updatedTask.getTitle());
                    }
                    if (updatedTask.getDescription() != null) {
                        existingTask.setDescription(updatedTask.getDescription());
                    }
                    if (updatedTask.getStatus() != null) {
                        existingTask.setStatus(updatedTask.getStatus());
                    }
                    if (updatedTask.getPriority() != null) {
                        existingTask.setPriority(updatedTask.getPriority());
                    }
                    if (updatedTask.getAssignedTo() != null) {
                        existingTask.setAssignedTo(updatedTask.getAssignedTo());
                    }
                    if (updatedTask.getDueDate() != null) {
                        existingTask.setDueDate(updatedTask.getDueDate());
                    }
                    if (updatedTask.getOrder() != 0) {
                        existingTask.setOrder(updatedTask.getOrder());
                    }
                    return taskRepository.save(existingTask);
                });
    }
    
    /**
     * Move task to a different status (column)
     */
    public Optional<Task> moveTask(String id, TaskStatus newStatus) {
        return taskRepository.findById(id)
                .map(task -> {
                    task.moveToStatus(newStatus);
                    return taskRepository.save(task);
                });
    }
    
    /**
     * Delete a task
     */
    public boolean deleteTask(String id) {
        if (taskRepository.existsById(id)) {
            return taskRepository.deleteById(id);
        }
        return false;
    }
    
    /**
     * Delete all tasks for a board
     */
    public int deleteTasksByBoardId(String boardId) {
        return taskRepository.deleteByBoardId(boardId);
    }
    
    /**
     * Check if task exists
     */
    public boolean taskExists(String id) {
        return taskRepository.existsById(id);
    }
    
    /**
     * Count tasks for a board
     */
    public long countTasksForBoard(String boardId) {
        return taskRepository.countByBoardId(boardId);
    }
}

