package ai.smartboard.smartboard_api.service;

import ai.smartboard.smartboard_api.model.AIResponse;
import ai.smartboard.smartboard_api.model.TaskPriority;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AIService {

    @Value("${python.service.base-url:http://localhost:8081}")
    private String pythonBaseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public AIResponse generateProjectPlan(String userInput) {
        // Build request payload for Python middleware
        String url = pythonBaseUrl.replaceAll("/$", "") + "/api/projects/generate_plan";

        Map<String, Object> payload = new HashMap<>();
        payload.put("prompt", userInput);
        payload.put("max_tasks", 8);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        try {
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(url, entity, Map.class);

            // Log the response for debugging
            System.out.println("Python service response: " + response);

            // Transform Python response to our AIResponse
            String plan = "Generated plan";
            if (response != null && response.get("project_summary") != null) {
                plan = String.valueOf(response.get("project_summary"));
            }

            List<AIResponse.TaskSuggestion> suggestions = new ArrayList<>();
            Object tasksObj = response != null ? response.get("tasks") : null;
            System.out.println("Tasks object type: " + (tasksObj != null ? tasksObj.getClass().getName() : "null"));
            System.out.println("Tasks object: " + tasksObj);
            
            if (tasksObj instanceof List<?> tasksList) {
                System.out.println("Tasks list size: " + tasksList.size());
                for (Object item : tasksList) {
                    System.out.println("Task item: " + item + " (type: " + item.getClass().getName() + ")");
                    if (item instanceof Map<?, ?> taskMap) {
                        Object titleObj = taskMap.get("title");
                        String title = titleObj != null ? titleObj.toString() : "Task";
                        Object descObj = taskMap.get("description");
                        String description = descObj != null ? descObj.toString() : "";
                        Object prioObj = taskMap.get("priority");
                        String priorityStr = prioObj != null ? prioObj.toString() : "medium";
                        Integer est = null;
                        Object estObj = taskMap.get("estimated_hours");
                        if (estObj instanceof Number n) {
                            est = n.intValue();
                        }
                        String category = (String) taskMap.getOrDefault("category", null);

                        TaskPriority priority = switch (priorityStr.toLowerCase()) {
                            case "low" -> TaskPriority.LOW;
                            case "high" -> TaskPriority.HIGH;
                            case "urgent" -> TaskPriority.URGENT;
                            default -> TaskPriority.MEDIUM;
                        };

                        suggestions.add(new AIResponse.TaskSuggestion(title, description, priority, est, category));
                    }
                }
            } else {
                System.out.println("Tasks object is not a List. Type: " + (tasksObj != null ? tasksObj.getClass().getName() : "null"));
            }

            System.out.println("Final suggestions count: " + suggestions.size());

            AIResponse aiResponse = new AIResponse(true, suggestions, plan);
            // Calculate total estimated hours
            int totalHours = suggestions.stream()
                .mapToInt(task -> task.getEstimatedHours() != null ? task.getEstimatedHours() : 0)
                .sum();
            aiResponse.setTotalEstimatedHours(totalHours);
            return aiResponse;
        } catch (Exception e) {
            // Log the full exception
            System.err.println("Error calling Python service: " + e.getMessage());
            e.printStackTrace();
            
            // Fallback minimal response on error
            List<AIResponse.TaskSuggestion> suggestions = new ArrayList<>();
            suggestions.add(new AIResponse.TaskSuggestion(
                    "Outline project goals",
                    "Write down key outcomes and scope",
                    TaskPriority.MEDIUM,
                    2,
                    "Planning"
            ));
            AIResponse fallbackResponse = new AIResponse(false, suggestions, "Plan generation failed; please try again later.");
            fallbackResponse.setErrorMessage("Python middleware unavailable; showing a minimal fallback.");
            return fallbackResponse;
        }
    }
}




