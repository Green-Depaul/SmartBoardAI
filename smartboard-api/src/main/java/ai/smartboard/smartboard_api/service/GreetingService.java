package ai.smartboard.smartboard_api.service;

import org.springframework.stereotype.Service;

@Service
public class GreetingService {
    public String makeGreeting(String name) {
        return "Hello, " + (name == null || name.isBlank() ? "SmartBoardAI" : name) + "!";
    }
}