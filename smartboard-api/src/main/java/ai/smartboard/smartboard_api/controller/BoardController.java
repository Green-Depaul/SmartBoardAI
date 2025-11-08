package ai.smartboard.smartboard_api.controller;

import ai.smartboard.smartboard_api.model.Board;
import ai.smartboard.smartboard_api.model.Task;
import ai.smartboard.smartboard_api.service.BoardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Board operations
 * Provides endpoints for managing Kanban boards
 * Compatible with frontend expectations
 */
@RestController
@RequestMapping("/board")
@CrossOrigin(origins = "*") // Configure appropriately for production
public class BoardController {
    
    private final BoardService boardService;
    
    @Autowired
    public BoardController(BoardService boardService) {
        this.boardService = boardService;
    }
    
    /**
     * GET /api/board - Get all boards
     */
    @GetMapping
    public ResponseEntity<List<Board>> getAllBoards() {
        List<Board> boards = boardService.getAllBoards();
        return ResponseEntity.ok(boards);
    }
    
    /**
     * GET /api/board/{id} - Get board by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Board> getBoardById(@PathVariable String id) {
        return boardService.getBoardById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * GET /api/board/user/{userId} - Get boards by user ID
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Board>> getBoardsByUserId(@PathVariable String userId) {
        List<Board> boards = boardService.getBoardsByUserId(userId);
        return ResponseEntity.ok(boards);
    }
    
    /**
     * POST /api/board - Create a new board
     */
    @PostMapping
    public ResponseEntity<Board> createBoard(@RequestBody Board board) {
        try {
            Board createdBoard = boardService.createBoard(board);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdBoard);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    /**
     * PUT /api/board/{id} - Update a board
     */
    @PutMapping("/{id}")
    public ResponseEntity<Board> updateBoard(@PathVariable String id, @RequestBody Board board) {
        return boardService.updateBoard(id, board)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * DELETE /api/board/{id} - Delete a board
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBoard(@PathVariable String id) {
        if (boardService.deleteBoard(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
    
    /**
     * GET /api/board/{boardId}/tasks - Get all tasks for a board
     * This endpoint matches what the frontend tests expect
     */
    @GetMapping("/{boardId}/tasks")
    public ResponseEntity<List<Task>> getTasksForBoard(@PathVariable String boardId) {
        if (!boardService.boardExists(boardId)) {
            return ResponseEntity.notFound().build();
        }
        List<Task> tasks = boardService.getTasksForBoard(boardId);
        return ResponseEntity.ok(tasks);
    }
    
    /**
     * POST /api/board/{boardId}/tasks - Add a task to a board
     */
    @PostMapping("/{boardId}/tasks")
    public ResponseEntity<Task> addTaskToBoard(@PathVariable String boardId, @RequestBody Task task) {
        return boardService.addTaskToBoard(boardId, task)
                .map(createdTask -> ResponseEntity.status(HttpStatus.CREATED).body(createdTask))
                .orElse(ResponseEntity.notFound().build());
    }
}

