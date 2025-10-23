package ai.smartboard.smartboard_api.controller;

import ai.smartboard.smartboard_api.dto.TaskDTO;
import ai.smartboard.smartboard_api.model.*;
import ai.smartboard.smartboard_api.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/tasks")
@CrossOrigin(origins = "*")
public class TaskController {

    private final TaskService taskService;

    @Autowired
    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    public ResponseEntity<?> createTask(@RequestBody CreateTaskRequest request) {
        Optional<Task> createdTask = taskService.createTask(
                request.getUserId(),
                request.getTitle(),
                request.getDescription(),
                request.getPriority(),
                request.getEstimatedHours()
        );

        if (createdTask.isPresent()) {
            return new ResponseEntity<>(new TaskDTO(createdTask.get()), HttpStatus.CREATED);
        } else {
            return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/from-suggestion")
    public ResponseEntity<?> createTaskFromSuggestion(@RequestBody CreateTaskFromSuggestionRequest request) {
        Optional<Task> createdTask = taskService.createTaskFromSuggestion(request.getUserId(), request.getSuggestion());

        if (createdTask.isPresent()) {
            return new ResponseEntity<>(new TaskDTO(createdTask.get()), HttpStatus.CREATED);
        } else {
            return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TaskDTO>> getTasksByUser(@PathVariable Long userId) {
        List<Task> tasks = taskService.getTasksByUserId(userId);
        List<TaskDTO> taskDTOs = tasks.stream().map(TaskDTO::new).collect(Collectors.toList());
        return new ResponseEntity<>(taskDTOs, HttpStatus.OK);
    }

    @GetMapping("/user/{userId}/status/{status}")
    public ResponseEntity<List<TaskDTO>> getTasksByUserAndStatus(@PathVariable Long userId, @PathVariable TaskStatus status) {
        List<Task> tasks = taskService.getTasksByUserIdAndStatus(userId, status);
        List<TaskDTO> taskDTOs = tasks.stream().map(TaskDTO::new).collect(Collectors.toList());
        return new ResponseEntity<>(taskDTOs, HttpStatus.OK);
    }

    @PutMapping("/{taskId}/status")
    public ResponseEntity<TaskDTO> updateTaskStatus(@PathVariable Long taskId, @RequestBody Map<String, String> request) {
        String statusStr = request.get("status");
        try {
            TaskStatus newStatus = TaskStatus.valueOf(statusStr.toUpperCase());
            Optional<Task> updatedTask = taskService.updateTaskStatus(taskId, newStatus);
            
            return updatedTask.map(task -> new ResponseEntity<>(new TaskDTO(task), HttpStatus.OK))
                    .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{taskId}")
    public ResponseEntity<TaskDTO> updateTask(@PathVariable Long taskId, @RequestBody UpdateTaskRequest request) {
        Optional<Task> updatedTask = taskService.updateTask(
                taskId,
                request.getTitle(),
                request.getDescription(),
                request.getPriority(),
                request.getEstimatedHours()
        );

        return updatedTask.map(task -> new ResponseEntity<>(new TaskDTO(task), HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<String> deleteTask(@PathVariable Long taskId) {
        if (taskService.deleteTask(taskId)) {
            return new ResponseEntity<>("Task deleted successfully", HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Task not found", HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/user/{userId}/search")
    public ResponseEntity<List<TaskDTO>> searchTasks(@PathVariable Long userId, @RequestParam String q) {
        List<Task> tasks = taskService.searchTasks(userId, q);
        List<TaskDTO> taskDTOs = tasks.stream().map(TaskDTO::new).collect(Collectors.toList());
        return new ResponseEntity<>(taskDTOs, HttpStatus.OK);
    }

    @GetMapping("/user/{userId}/stats")
    public ResponseEntity<TaskService.TaskStats> getTaskStats(@PathVariable Long userId) {
        TaskService.TaskStats stats = taskService.getTaskStats(userId);
        return new ResponseEntity<>(stats, HttpStatus.OK);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "Task service is healthy");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // Request DTOs
    public static class CreateTaskRequest {
        private Long userId;
        private String title;
        private String description;
        private TaskPriority priority;
        private Integer estimatedHours;

        // Getters and Setters
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public TaskPriority getPriority() { return priority; }
        public void setPriority(TaskPriority priority) { this.priority = priority; }
        public Integer getEstimatedHours() { return estimatedHours; }
        public void setEstimatedHours(Integer estimatedHours) { this.estimatedHours = estimatedHours; }
    }

    public static class CreateTaskFromSuggestionRequest {
        private Long userId;
        private AIResponse.TaskSuggestion suggestion;

        // Getters and Setters
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public AIResponse.TaskSuggestion getSuggestion() { return suggestion; }
        public void setSuggestion(AIResponse.TaskSuggestion suggestion) { this.suggestion = suggestion; }
    }

    public static class UpdateTaskRequest {
        private String title;
        private String description;
        private TaskPriority priority;
        private Integer estimatedHours;

        // Getters and Setters
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public TaskPriority getPriority() { return priority; }
        public void setPriority(TaskPriority priority) { this.priority = priority; }
        public Integer getEstimatedHours() { return estimatedHours; }
        public void setEstimatedHours(Integer estimatedHours) { this.estimatedHours = estimatedHours; }
    }
}
