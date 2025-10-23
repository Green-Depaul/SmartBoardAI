package ai.smartboard.smartboard_api.service;

import ai.smartboard.smartboard_api.model.*;
import ai.smartboard.smartboard_api.repository.TaskRepository;
import ai.smartboard.smartboard_api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @Autowired
    public TaskService(TaskRepository taskRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    public Optional<Task> createTask(Long userId, String title, String description, TaskPriority priority, Integer estimatedHours) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            return Optional.empty();
        }

        Task task = new Task(title, description, userOptional.get());
        task.setPriority(priority != null ? priority : TaskPriority.MEDIUM);
        task.setEstimatedHours(estimatedHours);
        task.setStatus(TaskStatus.TODO);
        task.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        task.setUpdatedAt(new Timestamp(System.currentTimeMillis()));

        return Optional.of(taskRepository.save(task));
    }

    public Optional<Task> createTaskFromSuggestion(Long userId, AIResponse.TaskSuggestion suggestion) {
        TaskPriority priority = suggestion.getPriority() != null ? suggestion.getPriority() : TaskPriority.MEDIUM;
        return createTask(userId, suggestion.getTitle(), suggestion.getDescription(), priority, suggestion.getEstimatedHours());
    }

    public List<Task> getTasksByUserId(Long userId) {
        return taskRepository.findByUserId(userId);
    }

    public List<Task> getTasksByUserIdAndStatus(Long userId, TaskStatus status) {
        return taskRepository.findByUserIdAndStatus(userId, status);
    }

    public Optional<Task> updateTaskStatus(Long taskId, TaskStatus newStatus) {
        return taskRepository.findById(taskId).map(task -> {
            task.setStatus(newStatus);
            task.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
            return taskRepository.save(task);
        });
    }

    public Optional<Task> updateTask(Long taskId, String title, String description, TaskPriority priority, Integer estimatedHours) {
        return taskRepository.findById(taskId).map(task -> {
            if (title != null) task.setTitle(title);
            if (description != null) task.setDescription(description);
            if (priority != null) task.setPriority(priority);
            if (estimatedHours != null) task.setEstimatedHours(estimatedHours);
            task.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
            return taskRepository.save(task);
        });
    }

    public boolean deleteTask(Long taskId) {
        if (taskRepository.existsById(taskId)) {
            taskRepository.deleteById(taskId);
            return true;
        }
        return false;
    }

    public List<Task> searchTasks(Long userId, String searchTerm) {
        return taskRepository.searchTasksByUserIdAndText(userId, searchTerm);
    }

    public TaskStats getTaskStats(Long userId) {
        List<Task> allTasks = taskRepository.findByUserId(userId);
        
        long todoTasks = allTasks.stream().filter(t -> t.getStatus() == TaskStatus.TODO).count();
        long inProgressTasks = allTasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count();
        long inReviewTasks = allTasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_REVIEW).count();
        long doneTasks = allTasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count();
        long totalTasks = allTasks.size();

        return new TaskStats(totalTasks, todoTasks, inProgressTasks, inReviewTasks, doneTasks);
    }

    public static class TaskStats {
        private final long totalTasks;
        private final long todoTasks;
        private final long inProgressTasks;
        private final long inReviewTasks;
        private final long doneTasks;

        public TaskStats(long totalTasks, long todoTasks, long inProgressTasks, long inReviewTasks, long doneTasks) {
            this.totalTasks = totalTasks;
            this.todoTasks = todoTasks;
            this.inProgressTasks = inProgressTasks;
            this.inReviewTasks = inReviewTasks;
            this.doneTasks = doneTasks;
        }

        public long getTotalTasks() { return totalTasks; }
        public long getTodoTasks() { return todoTasks; }
        public long getInProgressTasks() { return inProgressTasks; }
        public long getInReviewTasks() { return inReviewTasks; }
        public long getDoneTasks() { return doneTasks; }
    }
}
