package ai.smartboard.smartboard_api.repository;

import ai.smartboard.smartboard_api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    /**
     * Find user by email address
     * @param email the email address to search for
     * @return Optional containing the user if found
     */
    Optional<User> findByEmail(String email);
    
    /**
     * Check if a user exists with the given email
     * @param email the email address to check
     * @return true if user exists, false otherwise
     */
    boolean existsByEmail(String email);
    
    /**
     * Find active user by email address
     * @param email the email address to search for
     * @return Optional containing the active user if found
     */
    @Query("SELECT u FROM User u WHERE u.email = :email AND u.isActive = true")
    Optional<User> findActiveByEmail(@Param("email") String email);
    
    /**
     * Find users by first name (case-insensitive)
     * @param firstName the first name to search for
     * @return list of users with matching first name
     */
    @Query("SELECT u FROM User u WHERE LOWER(u.firstName) LIKE LOWER(CONCAT('%', :firstName, '%'))")
    java.util.List<User> findByFirstNameContainingIgnoreCase(@Param("firstName") String firstName);
    
    /**
     * Find users by last name (case-insensitive)
     * @param lastName the last name to search for
     * @return list of users with matching last name
     */
    @Query("SELECT u FROM User u WHERE LOWER(u.lastName) LIKE LOWER(CONCAT('%', :lastName, '%'))")
    java.util.List<User> findByLastNameContainingIgnoreCase(@Param("lastName") String lastName);
}
