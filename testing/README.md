# AI Project Manager Tool - Testing Suite

This directory contains comprehensive tests for the AI Project Manager Tool built with Together.AI. The testing suite covers all aspects of the application from frontend UI to backend APIs.

## 🧪 Test Categories

### 1. Frontend Tests (`frontend_tests.py`)
- **Landing Page**: Verifies the main page loads without errors
- **Login/Signup Forms**: Tests form input handling and validation
- **AI Page**: Tests AI message sending and response receiving
- **Kanban Board**: Tests task creation, movement, and deletion
- **Error Handling**: Tests user-friendly error messages

### 2. Backend Tests (`backend_tests.py`)
- **AI Plan Endpoint** (`/api/ai/plan`): Tests AI task generation
- **Board Items** (`/api/board/items`): Tests task retrieval
- **CRUD Operations**: Tests adding, updating, and deleting tasks
- **Authentication**: Tests login and token validation
- **Error Responses**: Tests proper error handling

### 3. Integration Tests (`integration_tests.py`)
- **Complete Workflow**: End-to-end user journey testing
- **Data Persistence**: Tests that data survives across sessions
- **Concurrent Users**: Tests system behavior with multiple users

### 4. Error Handling Tests (`error_handling_tests.py`)
- **Network Failures**: Tests behavior when network is unavailable
- **Server Timeouts**: Tests handling of slow responses
- **Invalid Requests**: Tests API error responses
- **AI Service Failures**: Tests AI service error scenarios
- **Database Failures**: Tests database connection issues

### 5. Postman-style Tests (`postman_tests.py`)
- **API Health**: Basic connectivity tests
- **Detailed AI Testing**: Comprehensive AI endpoint testing
- **CRUD Operations**: Direct API testing
- **Performance**: Response time and load testing
- **Error Formats**: API error response validation

## 🚀 Quick Start

### Prerequisites
```bash
# Install Python dependencies
pip install -r requirements.txt

# Install Chrome driver for Selenium tests
# On macOS: brew install chromedriver
# On Ubuntu: sudo apt-get install chromium-chromedriver
```

### Running Tests

#### Run All Tests
```bash
python run_all_tests.py
```

#### Run Specific Test Categories
```bash
# Frontend tests only
python -c "from frontend_tests import *; from test_runner import TestRunner; runner = TestRunner(); runner.run_test('Landing Page', test_landing_page)"

# Backend tests only
python -c "from backend_tests import *; from test_runner import TestRunner; runner = TestRunner(); runner.run_test('AI Plan', test_ai_plan)"

# Integration tests only
python -c "from integration_tests import *; from test_runner import TestRunner; runner = TestRunner(); runner.run_test('Complete Workflow', test_complete_workflow)"
```

## 📊 Test Results

After running tests, you'll find:

- **`test_report.json`**: Detailed JSON report with all test results
- **`test_summary.md`**: Human-readable summary with recommendations
- **Console Output**: Real-time test progress and results

## 🐛 Bug Tracking

When tests fail, bugs are automatically tracked with:
- **ID**: Unique bug identifier
- **Title**: Brief description
- **Description**: Detailed issue explanation
- **Severity**: High/Medium/Low priority
- **Steps to Reproduce**: How to recreate the issue
- **Status**: Open/In Progress/Resolved

## 🔧 Configuration

### Environment Variables
Create a `.env` file to configure test settings:

```env
# Server URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000

# Test settings
TEST_TIMEOUT=30
HEADLESS_BROWSER=true
AI_RESPONSE_TIMEOUT=60

# Database settings (if applicable)
DATABASE_URL=postgresql://user:pass@localhost:5432/test_db
```

### Custom Test Configuration
Modify test parameters in individual test files:
- **Timeouts**: Adjust response time expectations
- **Test Data**: Customize test inputs and scenarios
- **Assertions**: Modify success criteria

## 📋 Acceptance Criteria Coverage

This test suite covers all required acceptance criteria:

✅ **Landing page loads with no errors**
- Tested in `frontend_tests.py::test_landing_page_loads()`

✅ **Log In / Sign Up pages show and handle form input**
- Tested in `frontend_tests.py::test_login_signup_forms()`

✅ **AI page sends a message and receives a valid response**
- Tested in `frontend_tests.py::test_ai_page_functionality()`
- Also tested in `backend_tests.py::test_ai_plan_endpoint()`

✅ **Kanban board can add, move, and delete tasks**
- Tested in `frontend_tests.py::test_kanban_board_functionality()`
- Also tested in `backend_tests.py` CRUD operations

✅ **Error handling shows helpful messages instead of crashes**
- Tested in `error_handling_tests.py` and `frontend_tests.py::test_error_handling()`

✅ **Backend endpoints tested using Postman-style requests**
- All endpoints tested in `postman_tests.py`
- `/api/ai/plan` returns tasks
- `/api/board/items` returns existing tasks
- CRUD operations work as expected

## 🎯 Test Execution Strategy

### Manual Testing
1. **Browser Testing**: Use the frontend tests to verify UI functionality
2. **API Testing**: Use Postman or curl to test endpoints directly
3. **User Workflows**: Follow complete user journeys from login to task completion

### Automated Testing
1. **CI/CD Integration**: Run `python run_all_tests.py` in your pipeline
2. **Scheduled Testing**: Set up regular test runs to catch regressions
3. **Performance Monitoring**: Use performance tests to track system health

## 📈 Test Metrics

The test suite tracks:
- **Test Coverage**: Percentage of features tested
- **Pass Rate**: Success rate of all tests
- **Response Times**: API and UI performance metrics
- **Error Rates**: Frequency and types of failures
- **Bug Count**: Number of issues found and resolved

## 🔄 Continuous Improvement

### Adding New Tests
1. **Identify Gap**: Find untested functionality
2. **Write Test**: Create test function following existing patterns
3. **Integrate**: Add to appropriate test file and runner
4. **Document**: Update this README with new test coverage

### Test Maintenance
- **Update Tests**: Modify tests when requirements change
- **Remove Obsolete**: Delete tests for removed features
- **Optimize Performance**: Improve slow-running tests
- **Enhance Coverage**: Add edge cases and error scenarios

## 🆘 Troubleshooting

### Common Issues

**Chrome Driver Issues**
```bash
# Update Chrome driver
brew upgrade chromedriver  # macOS
sudo apt-get update && sudo apt-get upgrade chromium-chromedriver  # Ubuntu
```

**Connection Refused**
- Ensure backend server is running on configured port
- Check firewall settings
- Verify URL configuration

**Test Timeouts**
- Increase timeout values in test configuration
- Check server performance
- Verify network connectivity

**Selenium Issues**
- Update browser and driver versions
- Check headless mode configuration
- Verify element selectors

## 📞 Support

For questions about the testing suite:
1. Check this README for common solutions
2. Review test logs and error messages
3. Examine the generated test reports
4. Contact the development team with specific issues

---

**Last Updated**: October 2024  
**Test Suite Version**: 1.0  
**Compatible with**: AI Project Manager Tool v1.0+
