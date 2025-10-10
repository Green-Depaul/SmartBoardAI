# Kanban Board Backend - SmartBoardAI

## 📋 Overview

This backend provides REST API endpoints for managing Kanban boards and tasks. It's built with Spring Boot and uses in-memory storage (can be easily upgraded to a database).

## 🏗️ Architecture

### Models (`model/`)
- **`Board.java`** - Represents a Kanban board
  - Has ID, title, description, userId
  - Contains multiple tasks
  - Timestamps for creation and updates

- **`Task.java`** - Represents a task card on the board
  - Has ID, boardId, title, description
  - Status: TODO, IN_PROGRESS, DONE
  - Priority: LOW, MEDIUM, HIGH, URGENT
  - Assignment and due date support
  - Ordering within columns

### Repositories (`repository/`)
- **`BoardRepository.java`** - In-memory storage for boards
- **`TaskRepository.java`** - In-memory storage for tasks
- Thread-safe using `ConcurrentHashMap`
- Ready to be replaced with JPA/database

### Services (`service/`)
- **`BoardService.java`** - Business logic for boards
- **`TaskService.java`** - Business logic for tasks
- Handles validation and relationships

### Controllers (`controller/`)
- **`BoardController.java`** - `/api/board` endpoints
- **`TaskController.java`** - `/api/board/items` endpoints
- RESTful API design
- Compatible with frontend tests

## 🔌 API Endpoints

### Board Endpoints

#### Get all boards
```http
GET /api/board
Response: List<Board>
```

#### Get board by ID
```http
GET /api/board/{id}
Response: Board
```

#### Get boards by user
```http
GET /api/board/user/{userId}
Response: List<Board>
```

#### Create board
```http
POST /api/board
Body: {
  "title": "My Board",
  "description": "Board description",
  "userId": "user123"
}
Response: Board (201 Created)
```

#### Update board
```http
PUT /api/board/{id}
Body: {
  "title": "Updated Title",
  "description": "Updated description"
}
Response: Board
```

#### Delete board
```http
DELETE /api/board/{id}
Response: 204 No Content
```

#### Get tasks for board
```http
GET /api/board/{boardId}/tasks
Response: List<Task>
```

### Task Endpoints (matches frontend tests)

#### Get all tasks
```http
GET /api/board/items
Response: List<Task>
```

#### Get task by ID
```http
GET /api/board/items/{id}
Response: Task
```

#### Get tasks by board
```http
GET /api/board/items?boardId={boardId}
Response: List<Task>
```

#### Get tasks by status
```http
GET /api/board/items?status=todo
Response: List<Task>
```

#### Create task
```http
POST /api/board/items
Body: {
  "title": "New Task",
  "description": "Task description",
  "status": "todo",
  "priority": "medium",
  "boardId": "board-id"
}
Response: Task (201 Created)
```

#### Update task
```http
PUT /api/board/items/{id}
Body: {
  "title": "Updated Task",
  "status": "in_progress",
  "priority": "high"
}
Response: Task
```

#### Move task to different status
```http
PATCH /api/board/items/{id}/status
Body: {
  "status": "done"
}
Response: Task
```

#### Delete task
```http
DELETE /api/board/items/{id}
Response: 204 No Content
```

## 🚀 Running the Application

### Prerequisites
- Java 17 or higher
- Maven

### Start the server
```bash
cd smartboard-api
./mvnw spring-boot:run
```

Server runs on **http://localhost:8080**

### Run tests
```bash
./mvnw test
```

## ✅ Acceptance Criteria Met

### ✓ Each board and task has an ID and basic details
- Board: id, title, description, userId, timestamps
- Task: id, boardId, title, description, status, priority, timestamps

### ✓ Tasks belong to a board
- Task has `boardId` field
- Board has list of tasks
- Relationship maintained in services

### ✓ CRUD operations work
- **List**: GET endpoints return all boards/tasks
- **Add**: POST endpoints create new boards/tasks
- **Update**: PUT/PATCH endpoints modify existing entities
- **Delete**: DELETE endpoints remove boards/tasks

### ✓ In-memory storage
- Uses `ConcurrentHashMap` for thread-safety
- Data persists during application runtime
- Can be easily upgraded to database

## 🧪 Testing

### Unit Tests Created
- `TaskTest.java` - Model tests
- `BoardTest.java` - Model tests
- `TaskRepositoryTest.java` - Repository tests

### Run all tests
```bash
./mvnw test
```

### Test Coverage
- ✅ Task creation and status changes
- ✅ Board creation and task management
- ✅ Repository CRUD operations
- ✅ Status and priority enum conversions

## 🔄 Data Flow

1. **Frontend** makes HTTP request → 
2. **Controller** receives request → 
3. **Service** handles business logic → 
4. **Repository** manages data storage → 
5. **Response** sent back to frontend

## 📦 Data Models

### Board JSON Example
```json
{
  "id": "board-uuid",
  "title": "Sprint 1 Board",
  "description": "Tasks for Sprint 1",
  "userId": "user123",
  "createdAt": "2024-10-10T10:00:00",
  "updatedAt": "2024-10-10T10:00:00",
  "tasks": [...]
}
```

### Task JSON Example
```json
{
  "id": "task-uuid",
  "boardId": "board-uuid",
  "title": "Implement login feature",
  "description": "Add user authentication",
  "status": "TODO",
  "priority": "HIGH",
  "assignedTo": "user456",
  "createdAt": "2024-10-10T10:00:00",
  "updatedAt": "2024-10-10T10:00:00",
  "dueDate": "2024-10-15T10:00:00",
  "order": 0
}
```

## 🔧 Configuration

### application.properties
```properties
server.port=8080
spring.application.name=smartboard-api
```

### CORS Configuration
Currently allows all origins for development. Update `CorsConfig.java` for production.

## 🚀 Next Steps

### To add database support:
1. Add JPA dependencies to `pom.xml`
2. Add `@Entity` annotations to models
3. Extend `JpaRepository` in repositories
4. Add database configuration to `application.properties`

### Example for PostgreSQL:
```xml
<!-- Add to pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
</dependency>
```

```properties
# Add to application.properties
spring.datasource.url=jdbc:postgresql://localhost:5432/smartboard
spring.datasource.username=postgres
spring.datasource.password=password
spring.jpa.hibernate.ddl-auto=update
```

## 📝 Notes

- **Frontend compatible**: Endpoints match what frontend tests expect
- **In-memory storage**: Data clears on restart (perfect for testing)
- **Thread-safe**: Uses concurrent collections
- **RESTful**: Follows REST API best practices
- **Lombok**: Reduces boilerplate code
- **Spring Boot**: Easy to run and test

## 🐛 Troubleshooting

**Port already in use:**
```bash
# Change port in application.properties
server.port=8081
```

**Tests failing:**
```bash
# Clean and rebuild
./mvnw clean install
```

**CORS errors:**
- Check `CorsConfig.java`
- Ensure frontend URL is allowed

## 👥 Team Integration

This backend is ready for:
- Frontend to connect and test
- Integration testing with Postman
- Adding authentication layer
- Database migration when needed
- AI service integration for task generation

---

**Created for SmartBoardAI Capstone Project**  
**Compatible with existing frontend and test suite** ✨

