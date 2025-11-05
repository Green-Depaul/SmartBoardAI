package ai.smartboard.smartboard_api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ingestion")
@CrossOrigin(origins = "*")
public class IngestionController {

    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public IngestionController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * POST /api/ingestion/init
     * Returns a simple status indicating that the init.sql has been applied (on startup)
     * and that the H2 database is reachable.
     */
    @PostMapping("/init")
    public ResponseEntity<Map<String, Object>> initDatabase() {
        Map<String, Object> result = new HashMap<>();
        try {
            Integer tables = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='PUBLIC'",
                    Integer.class
            );
            result.put("status", "ok");
            result.put("tablesPresent", tables);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            result.put("status", "error");
            result.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(result);
        }
    }
}
