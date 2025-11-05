package ai.smartboard.smartboard_api.service;

import ai.smartboard.smartboard_api.model.Board;
import ai.smartboard.smartboard_api.model.Task;
import ai.smartboard.smartboard_api.repository.BoardRepository;
import ai.smartboard.smartboard_api.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service layer for Board operations
 * Handles business logic for Kanban boards
 */
@Service
public class BoardService {
    
    private final BoardRepository boardRepository;
    private final TaskRepository taskRepository;
    
    @Autowired
    public BoardService(BoardRepository boardRepository, TaskRepository taskRepository) {
        this.boardRepository = boardRepository;
        this.taskRepository = taskRepository;
    }
    
    /**
     * Get all boards
     */
    public List<Board> getAllBoards() {
        List<Board> boards = boardRepository.findAll();
        // Load tasks for each board
        boards.forEach(this::loadTasksForBoard);
        return boards;
    }
    
    /**
     * Get board by ID
     */
    public Optional<Board> getBoardById(String id) {
        Optional<Board> board = boardRepository.findById(id);
        board.ifPresent(this::loadTasksForBoard);
        return board;
    }
    
    /**
     * Get boards by user ID
     */
    public List<Board> getBoardsByUserId(String userId) {
        List<Board> boards = boardRepository.findByUserId(userId);
        boards.forEach(this::loadTasksForBoard);
        return boards;
    }
    
    /**
     * Create a new board
     */
    public Board createBoard(Board board) {
        if (board.getId() == null || board.getId().isEmpty()) {
            board = new Board(board.getTitle(), board.getDescription(), board.getUserId());
        }
        return boardRepository.save(board);
    }
    
    /**
     * Update an existing board
     */
    public Optional<Board> updateBoard(String id, Board updatedBoard) {
        return boardRepository.findById(id)
                .map(existingBoard -> {
                    if (updatedBoard.getTitle() != null) {
                        existingBoard.setTitle(updatedBoard.getTitle());
                    }
                    if (updatedBoard.getDescription() != null) {
                        existingBoard.setDescription(updatedBoard.getDescription());
                    }
                    existingBoard.touch();
                    return boardRepository.save(existingBoard);
                });
    }
    
    /**
     * Delete a board and all its tasks
     */
    public boolean deleteBoard(String id) {
        if (boardRepository.existsById(id)) {
            // Delete all tasks associated with this board
            taskRepository.deleteByBoardId(id);
            // Delete the board
            return boardRepository.deleteById(id);
        }
        return false;
    }
    
    /**
     * Add a task to a board
     */
    public Optional<Task> addTaskToBoard(String boardId, Task task) {
        return boardRepository.findById(boardId)
                .map(board -> {
                    task.setBoardId(boardId);
                    Task savedTask = taskRepository.save(task);
                    board.touch();
                    boardRepository.save(board);
                    return savedTask;
                });
    }
    
    /**
     * Get all tasks for a board
     */
    public List<Task> getTasksForBoard(String boardId) {
        return taskRepository.findByBoardId(boardId);
    }
    
    /**
     * Helper method to load tasks for a board
     */
    private void loadTasksForBoard(Board board) {
        List<Task> tasks = taskRepository.findByBoardId(board.getId());
        board.setTasks(tasks);
    }
    
    /**
     * Check if board exists
     */
    public boolean boardExists(String id) {
        return boardRepository.existsById(id);
    }
}

