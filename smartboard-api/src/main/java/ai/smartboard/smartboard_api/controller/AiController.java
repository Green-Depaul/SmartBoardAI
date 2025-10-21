package ai.smartboard.smartboard_api.controller;

import ai.smartboard.smartboard_api.service.AiService;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/generate")
    public String generatePlan(@RequestBody Map<String, Object> request) {
        return aiService.generatePlan(
            (String) request.get("prompt"),
            (String) request.get("project_type"),
            (String) request.get("complexity"),
            (int) request.get("max_tasks")
        );
    }
}
