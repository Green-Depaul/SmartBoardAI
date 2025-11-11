package ai.smartboard.smartboard_api.controller;

import ai.smartboard.smartboard_api.model.User;
import ai.smartboard.smartboard_api.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*") // Configure CORS as needed
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * Create a new user (registration)
     * POST /users/register
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String password = request.get("password");
            String firstName = request.get("firstName");
            String lastName = request.get("lastName");

            User user = userService.createUser(email, password, firstName, lastName);
            
            // Remove sensitive information from response
            user.setPasswordHash(null);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(user);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create user"));
        }
    }

    /**
     * Authenticate user (login)
     * POST /users/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String password = request.get("password");

            User user = userService.authenticateUser(email, password);
            
            if (user != null) {
                // Remove sensitive information from response
                user.setPasswordHash(null);
                return ResponseEntity.ok(user);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid email or password"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Authentication failed"));
        }
    }

    /**
     * Get user by ID
     * GET /users/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            Optional<User> userOpt = userService.getUserById(id);
            
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                // Remove sensitive information from response
                user.setPasswordHash(null);
                return ResponseEntity.ok(user);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "User not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve user"));
        }
    }

    /**
     * Get user by email
     * GET /users/email/{email}
     */
    @GetMapping("/email/{email}")
    public ResponseEntity<?> getUserByEmail(@PathVariable String email) {
        try {
            Optional<User> userOpt = userService.findUserByEmail(email);
            
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                // Remove sensitive information from response
                user.setPasswordHash(null);
                return ResponseEntity.ok(user);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "User not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve user"));
        }
    }

    /**
     * Update user profile
     * PUT /users/{id}/profile
     */
    @PutMapping("/{id}/profile")
    public ResponseEntity<?> updateUserProfile(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            String firstName = request.get("firstName");
            String lastName = request.get("lastName");

            User updatedUser = userService.updateUserProfile(id, firstName, lastName);
            
            if (updatedUser != null) {
                // Remove sensitive information from response
                updatedUser.setPasswordHash(null);
                return ResponseEntity.ok(updatedUser);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "User not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update user profile"));
        }
    }

    /**
     * Update user password
     * PUT /users/{id}/password
     */
    @PutMapping("/{id}/password")
    public ResponseEntity<?> updatePassword(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            String currentPassword = request.get("currentPassword");
            String newPassword = request.get("newPassword");

            boolean success = userService.updatePassword(id, currentPassword, newPassword);
            
            if (success) {
                return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Invalid current password or user not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update password"));
        }
    }

    /**
     * Deactivate user account
     * PUT /users/{id}/deactivate
     */
    @PutMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivateUser(@PathVariable Long id) {
        try {
            boolean success = userService.deactivateUser(id);
            
            if (success) {
                return ResponseEntity.ok(Map.of("message", "User account deactivated"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "User not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to deactivate user"));
        }
    }

    /**
     * Reactivate user account
     * PUT /users/{id}/reactivate
     */
    @PutMapping("/{id}/reactivate")
    public ResponseEntity<?> reactivateUser(@PathVariable Long id) {
        try {
            boolean success = userService.reactivateUser(id);
            
            if (success) {
                return ResponseEntity.ok(Map.of("message", "User account reactivated"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "User not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to reactivate user"));
        }
    }

    /**
     * Search users by first name
     * GET /users/search/firstname/{firstName}
     */
    @GetMapping("/search/firstname/{firstName}")
    public ResponseEntity<?> searchUsersByFirstName(@PathVariable String firstName) {
        try {
            List<User> users = userService.searchUsersByFirstName(firstName);
            
            // Remove sensitive information from response
            users.forEach(user -> user.setPasswordHash(null));
            
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to search users"));
        }
    }

    /**
     * Search users by last name
     * GET /users/search/lastname/{lastName}
     */
    @GetMapping("/search/lastname/{lastName}")
    public ResponseEntity<?> searchUsersByLastName(@PathVariable String lastName) {
        try {
            List<User> users = userService.searchUsersByLastName(lastName);
            
            // Remove sensitive information from response
            users.forEach(user -> user.setPasswordHash(null));
            
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to search users"));
        }
    }

    /**
     * Get all users (admin endpoint)
     * GET /users
     */
    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userService.getAllUsers();
            
            // Remove sensitive information from response
            users.forEach(user -> user.setPasswordHash(null));
            
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve users"));
        }
    }

    /**
     * Health check endpoint
     * GET /users/health
     */
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok(Map.of("status", "User service is healthy"));
    }
}
