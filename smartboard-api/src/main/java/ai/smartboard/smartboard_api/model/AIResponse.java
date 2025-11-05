package ai.smartboard.smartboard_api.model;

import java.util.List;

public class AIResponse {
    private String message;
    private List<TaskSuggestion> suggestedTasks;
    private String plan;

    public AIResponse() {}

    public AIResponse(String message, List<TaskSuggestion> suggestedTasks, String plan) {
        this.message = message;
        this.suggestedTasks = suggestedTasks;
        this.plan = plan;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<TaskSuggestion> getSuggestedTasks() {
        return suggestedTasks;
    }

    public void setSuggestedTasks(List<TaskSuggestion> suggestedTasks) {
        this.suggestedTasks = suggestedTasks;
    }

    public String getPlan() {
        return plan;
    }

    public void setPlan(String plan) {
        this.plan = plan;
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




