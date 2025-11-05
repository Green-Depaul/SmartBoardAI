package ai.smartboard.smartboard_api.service;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class AiService {

    @Value("${python.service.url}")
    private String pythonServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public String generatePlan(String prompt, String projectType, String complexity, int maxTasks) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = Map.of(
                "prompt", prompt,
                "project_type", projectType,
                "complexity", complexity,
                "max_tasks", maxTasks
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(pythonServiceUrl, request, String.class);

            return response.getBody();

        } catch (Exception e) {
            return "{\"message\": \"AI not available. Please try again later.\"}";
        }
    }
}
