package ai.smartboard.smartboard_api.controller;

import ai.smartboard.smartboard_api.model.AIResponse;
import ai.smartboard.smartboard_api.service.AIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/ai")
@CrossOrigin(origins = "*")
public class AIController {

    private final AIService aiService;

    @Autowired
    public AIController(AIService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/generate-plan")
    public ResponseEntity<AIResponse> generateProjectPlan(@RequestBody Map<String, String> request) {
        String userInput = request.get("message");
        
        if (userInput == null || userInput.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        try {
            AIResponse response = aiService.generateProjectPlan(userInput.trim());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // Log the error (in production, use proper logging)
            System.err.println("Error generating AI plan: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "AI service is healthy");
        response.put("timestamp", java.time.Instant.now().toString());
        return ResponseEntity.ok(response);
    }
}



