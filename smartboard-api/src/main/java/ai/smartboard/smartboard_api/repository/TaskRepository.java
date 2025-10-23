package ai.smartboard.smartboard_api.repository;

import ai.smartboard.smartboard_api.model.Task;
import ai.smartboard.smartboard_api.model.TaskStatus;
import ai.smartboard.smartboard_api.model.TaskPriority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    
    // Find tasks by user
    @Query("SELECT t FROM Task t WHERE t.user.id = :userId")
    List<Task> findByUserId(@Param("userId") Long userId);
    
    // Find tasks by status
    List<Task> findByStatus(TaskStatus status);
    
    // Find tasks by user and status
    @Query("SELECT t FROM Task t WHERE t.user.id = :userId AND t.status = :status")
    List<Task> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") TaskStatus status);
    
    // Find tasks by priority
    List<Task> findByPriority(TaskPriority priority);
    
    // Find tasks by user and priority
    @Query("SELECT t FROM Task t WHERE t.user.id = :userId AND t.priority = :priority")
    List<Task> findByUserIdAndPriority(@Param("userId") Long userId, @Param("priority") TaskPriority priority);
    
    // Search tasks by title or description
    @Query("SELECT t FROM Task t WHERE t.user.id = :userId AND (LOWER(t.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(t.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<Task> searchTasksByUserIdAndText(@Param("userId") Long userId, @Param("searchTerm") String searchTerm);
    
    // Count tasks by user
    @Query("SELECT COUNT(t) FROM Task t WHERE t.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);
    
    // Count tasks by status for a user
    @Query("SELECT COUNT(t) FROM Task t WHERE t.user.id = :userId AND t.status = :status")
    long countByUserIdAndStatus(@Param("userId") Long userId, @Param("status") TaskStatus status);
    
    // Find tasks by user ordered by creation date
    @Query("SELECT t FROM Task t WHERE t.user.id = :userId ORDER BY t.createdAt DESC")
    List<Task> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);
    
    // Find tasks by user ordered by priority
    @Query("SELECT t FROM Task t WHERE t.user.id = :userId ORDER BY t.priority DESC")
    List<Task> findByUserIdOrderByPriorityDesc(@Param("userId") Long userId);
}
