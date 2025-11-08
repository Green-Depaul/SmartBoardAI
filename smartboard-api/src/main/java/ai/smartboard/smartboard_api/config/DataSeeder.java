package ai.smartboard.smartboard_api.config;

import ai.smartboard.smartboard_api.repository.UserRepository;
import ai.smartboard.smartboard_api.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * Seeds a demo user for quick login during development.
 */
@Component
public class DataSeeder implements ApplicationRunner {

    private final UserService userService;
    private final UserRepository userRepository;

    @Autowired
    public DataSeeder(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        final String demoEmail = "demo@smartboard.ai";
        if (!userRepository.existsByEmail(demoEmail)) {
            // Password is intentionally simple for demo purposes only
            userService.createUser(demoEmail, "demo1234", "Demo", "User");
        }
    }
}
