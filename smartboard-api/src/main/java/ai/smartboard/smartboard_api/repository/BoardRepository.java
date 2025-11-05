package ai.smartboard.smartboard_api.repository;

import ai.smartboard.smartboard_api.model.Board;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * In-memory repository for Board entities
 * Uses ConcurrentHashMap for thread-safety
 * Can be replaced with JPA repository when database is added
 */
@Repository
public class BoardRepository {
    
    private final Map<String, Board> boards = new ConcurrentHashMap<>();
    
    /**
     * Find all boards
     */
    public List<Board> findAll() {
        return new ArrayList<>(boards.values());
    }
    
    /**
     * Find board by ID
     */
    public Optional<Board> findById(String id) {
        return Optional.ofNullable(boards.get(id));
    }
    
    /**
     * Find boards by user ID
     */
    public List<Board> findByUserId(String userId) {
        return boards.values().stream()
                .filter(board -> board.getUserId().equals(userId))
                .collect(Collectors.toList());
    }
    
    /**
     * Save or update a board
     */
    public Board save(Board board) {
        if (board.getId() == null || board.getId().isEmpty()) {
            board.setId(UUID.randomUUID().toString());
        }
        boards.put(board.getId(), board);
        return board;
    }
    
    /**
     * Delete a board by ID
     */
    public boolean deleteById(String id) {
        return boards.remove(id) != null;
    }
    
    /**
     * Check if board exists
     */
    public boolean existsById(String id) {
        return boards.containsKey(id);
    }
    
    /**
     * Count all boards
     */
    public long count() {
        return boards.size();
    }
    
    /**
     * Delete all boards (useful for testing)
     */
    public void deleteAll() {
        boards.clear();
    }
}

