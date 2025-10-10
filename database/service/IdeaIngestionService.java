package com.example.smartboard.db.service; // Update

import com.example.smartboard.db.model.ProjectIdea;
import com.example.smartboard.db.repository.ProjectIdeaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;

@Service
public class IdeaIngestionService {

    @Autowired
    private ProjectIdeaRepository projectIdeaRepository;

    public ProjectIdea ingestIdea(int projectId, String rawText) {
        ProjectIdea idea = new ProjectIdea();
        idea.setProjectId(projectId);
        idea.setRawText(rawText);
        idea.setSubmittedAt(new Timestamp(System.currentTimeMillis()));
        return projectIdeaRepository.save(idea);
    }
}
