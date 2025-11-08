package ai.smartboard.smartboard_api.model;

import java.util.List;

public class AIResponse {
    private boolean success;
    private List<TaskSuggestion> tasks;
    private Integer totalEstimatedHours;
    private String projectSummary;
    private List<String> recommendations;
    private String errorMessage;
    private String requestId;

    public AIResponse() {}

    public AIResponse(boolean success, List<TaskSuggestion> tasks, String projectSummary) {
        this.success = success;
        this.tasks = tasks;
        this.projectSummary = projectSummary;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public List<TaskSuggestion> getTasks() {
        return tasks;
    }

    public void setTasks(List<TaskSuggestion> tasks) {
        this.tasks = tasks;
    }

    public Integer getTotalEstimatedHours() {
        return totalEstimatedHours;
    }

    public void setTotalEstimatedHours(Integer totalEstimatedHours) {
        this.totalEstimatedHours = totalEstimatedHours;
    }

    public String getProjectSummary() {
        return projectSummary;
    }

    public void setProjectSummary(String projectSummary) {
        this.projectSummary = projectSummary;
    }

    public List<String> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<String> recommendations) {
        this.recommendations = recommendations;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public String getRequestId() {
        return requestId;
    }

    public void setRequestId(String requestId) {
        this.requestId = requestId;
    }

    public static class TaskSuggestion {
        private String title;
        private String description;
        private TaskPriority priority;
        private Integer estimatedHours;
        private String category;

        public TaskSuggestion() {}

        public TaskSuggestion(String title, String description, TaskPriority priority, Integer estimatedHours, String category) {
            this.title = title;
            this.description = description;
            this.priority = priority;
            this.estimatedHours = estimatedHours;
            this.category = category;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public TaskPriority getPriority() {
            return priority;
        }

        public void setPriority(TaskPriority priority) {
            this.priority = priority;
        }

        public Integer getEstimatedHours() {
            return estimatedHours;
        }

        public void setEstimatedHours(Integer estimatedHours) {
            this.estimatedHours = estimatedHours;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }
    }
}




