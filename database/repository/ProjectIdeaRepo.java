package com.example.smartboard.db.repository; // Update

import com.example.smartboard.db.model.ProjectIdea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectIdeaRepository extends JpaRepository<ProjectIdea, Long> {
}
