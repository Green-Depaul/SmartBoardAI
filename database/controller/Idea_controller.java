package com.example.smartboard.db.controller; // Update

import com.example.smartboard.db.model.ProjectIdea;
import com.example.smartboard.db.service.IdeaIngestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ideas")
public class IdeaController {

    @Autowired
    private IdeaIngestionService ideaIngestionService;

    @PostMapping
    public ProjectIdea createIdea(
            @RequestParam int projectId,
            @RequestParam String rawText
    ) {
        return ideaIngestionService.ingestIdea(projectId, rawText);
    }
}
