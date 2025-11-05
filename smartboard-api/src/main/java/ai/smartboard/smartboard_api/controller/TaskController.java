package ai.smartboard.smartboard_api.controller;

import ai.smartboard.smartboard_api.model.Task;
import ai.smartboard.smartboard_api.model.Task.TaskStatus;
import ai.smartboard.smartboard_api.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for Task operations
 * Provides endpoints for managing Kanban task cards
 * Matches frontend test expectations: /api/board/items
 */
@RestController
@RequestMapping("/api/board/items")
@CrossOrigin(origins = "*")
public class TaskController {

    private final TaskService taskService;

    @Autowired
    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    /**
     * GET /api/board/items - Get all tasks
     */
    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks() {
        List<Task> tasks = taskService.getAllTasks();
        return ResponseEntity.ok(tasks);
    }

    /**
     * GET /api/board/items/{id} - Get task by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable String id) {
        return taskService.getTaskById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * GET /api/board/items?boardId={boardId} - Get tasks by board ID
     */
    @GetMapping(params = "boardId")
    public ResponseEntity<List<Task>> getTasksByBoardId(@RequestParam String boardId) {
        List<Task> tasks = taskService.getTasksByBoardId(boardId);
        return ResponseEntity.ok(tasks);
    }

    /**
     * GET /api/board/items?status={status} - Get tasks by status
     */
    @GetMapping(params = "status")
    public ResponseEntity<List<Task>> getTasksByStatus(@RequestParam String status) {
        try {
            TaskStatus taskStatus = TaskStatus.fromString(status);
            List<Task> tasks = taskService.getTasksByStatus(taskStatus);
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * GET /api/board/items?assignedTo={userId} - Get tasks assigned to a user
     */
    @GetMapping(params = "assignedTo")
    public ResponseEntity<List<Task>> getTasksByAssignedTo(@RequestParam String assignedTo) {
        List<Task> tasks = taskService.getTasksByAssignedTo(assignedTo);
        return ResponseEntity.ok(tasks);
    }

    /**
     * POST /api/board/items - Create a new task
     */
    @PostMapping
    public ResponseEntity<Task> createTask(@RequestBody Task task) {
        try {
            Task createdTask = taskService.createTask(task);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdTask);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * PUT /api/board/items/{id} - Update a task
     */
    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable String id, @RequestBody Task task) {
        return taskService.updateTask(id, task)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * PATCH /api/board/items/{id}/status - Move task to different status
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<Task> moveTask(@PathVariable String id, @RequestBody Map<String, String> body) {
        try {
            String statusValue = body.get("status");
            TaskStatus newStatus = TaskStatus.fromString(statusValue);
            return taskService.moveTask(id, newStatus)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * DELETE /api/board/items/{id} - Delete a task
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable String id) {
        if (taskService.deleteTask(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
 
