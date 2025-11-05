package ai.smartboard.smartboard_api.service;

import ai.smartboard.smartboard_api.model.User;
import ai.smartboard.smartboard_api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    /**
     * Create a new user with hashed password
     * @param email user's email address
     * @param password plain text password (will be hashed)
     * @param firstName user's first name
     * @param lastName user's last name
     * @return the created user
     * @throws IllegalArgumentException if email already exists
     */
    public User createUser(String email, String password, String firstName, String lastName) {
        // Check if user already exists
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("User with email " + email + " already exists");
        }

        // Validate input
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email cannot be null or empty");
        }
        if (password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException("Password cannot be null or empty");
        }
        if (firstName == null || firstName.trim().isEmpty()) {
            throw new IllegalArgumentException("First name cannot be null or empty");
        }
        if (lastName == null || lastName.trim().isEmpty()) {
            throw new IllegalArgumentException("Last name cannot be null or empty");
        }

        // Hash the password
        String hashedPassword = passwordEncoder.encode(password);

        // Create new user
        User user = new User();
        user.setEmail(email.toLowerCase().trim());
        user.setPasswordHash(hashedPassword);
        user.setFirstName(firstName.trim());
        user.setLastName(lastName.trim());
        user.setIsActive(true);
        user.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        user.setUpdatedAt(new Timestamp(System.currentTimeMillis()));

        return userRepository.save(user);
    }

    /**
     * Authenticate user with email and password
     * @param email user's email address
     * @param password plain text password
     * @return the user if authentication successful, null otherwise
     */
    public User authenticateUser(String email, String password) {
        Optional<User> userOpt = userRepository.findActiveByEmail(email.toLowerCase().trim());
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(password, user.getPasswordHash())) {
                return user;
            }
        }
        
        return null;
    }

    /**
     * Find user by email
     * @param email user's email address
     * @return Optional containing the user if found
     */
    public Optional<User> findUserByEmail(String email) {
        return userRepository.findByEmail(email.toLowerCase().trim());
    }

    /**
     * Find active user by email
     * @param email user's email address
     * @return Optional containing the active user if found
     */
    public Optional<User> findActiveUserByEmail(String email) {
        return userRepository.findActiveByEmail(email.toLowerCase().trim());
    }

    /**
     * Update user password
     * @param userId user's ID
     * @param currentPassword current plain text password
     * @param newPassword new plain text password
     * @return true if password updated successfully, false otherwise
     */
    public boolean updatePassword(Long userId, String currentPassword, String newPassword) {
        Optional<User> userOpt = userRepository.findById(userId);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // Verify current password
            if (passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
                // Hash new password and update
                String hashedNewPassword = passwordEncoder.encode(newPassword);
                user.setPasswordHash(hashedNewPassword);
                user.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
                userRepository.save(user);
                return true;
            }
        }
        
        return false;
    }

    /**
     * Deactivate user account
     * @param userId user's ID
     * @return true if user was deactivated, false if user not found
     */
    public boolean deactivateUser(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setIsActive(false);
            user.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
            userRepository.save(user);
            return true;
        }
        
        return false;
    }

    /**
     * Reactivate user account
     * @param userId user's ID
     * @return true if user was reactivated, false if user not found
     */
    public boolean reactivateUser(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setIsActive(true);
            user.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
            userRepository.save(user);
            return true;
        }
        
        return false;
    }

    /**
     * Update user profile information
     * @param userId user's ID
     * @param firstName new first name
     * @param lastName new last name
     * @return updated user if successful, null otherwise
     */
    public User updateUserProfile(Long userId, String firstName, String lastName) {
        Optional<User> userOpt = userRepository.findById(userId);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            if (firstName != null && !firstName.trim().isEmpty()) {
                user.setFirstName(firstName.trim());
            }
            if (lastName != null && !lastName.trim().isEmpty()) {
                user.setLastName(lastName.trim());
            }
            
            user.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
            return userRepository.save(user);
        }
        
        return null;
    }

    /**
     * Get all users (for admin purposes)
     * @return list of all users
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Get user by ID
     * @param userId user's ID
     * @return Optional containing the user if found
     */
    public Optional<User> getUserById(Long userId) {
        return userRepository.findById(userId);
    }

    /**
     * Search users by first name
     * @param firstName first name to search for
     * @return list of users with matching first name
     */
    public List<User> searchUsersByFirstName(String firstName) {
        return userRepository.findByFirstNameContainingIgnoreCase(firstName);
    }

    /**
     * Search users by last name
     * @param lastName last name to search for
     * @return list of users with matching last name
     */
    public List<User> searchUsersByLastName(String lastName) {
        return userRepository.findByLastNameContainingIgnoreCase(lastName);
    }
}
