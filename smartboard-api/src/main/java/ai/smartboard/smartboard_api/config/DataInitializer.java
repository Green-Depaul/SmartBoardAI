package ai.smartboard.smartboard_api.config;

import ai.smartboard.smartboard_api.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Autowired
    private UserService userService;

    @Bean
    public ApplicationRunner initializeData() {
        return args -> {
            try {
                // Create demo user if it doesn't exist
                if (userService.findUserByEmail("demo@smartboard.ai").isEmpty()) {
                    userService.createUser("demo@smartboard.ai", "demo1234", "Demo", "User");
                    System.out.println("Demo user created: demo@smartboard.ai / demo1234");
                } else {
                    System.out.println("Demo user already exists");
                }
            } catch (Exception e) {
                System.err.println("Error creating demo user: " + e.getMessage());
            }
        };
    }
}