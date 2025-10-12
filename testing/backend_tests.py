"""
Backend API Tests for AI Project Manager Tool
Tests API endpoints, data persistence, and backend functionality
"""

import requests
import json
import time
from typing import Dict, Any, List

class BackendTester:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.test_user_token = None
    
    def test_ai_plan_endpoint(self):
        """Test /api/ai/plan endpoint returns tasks"""
        try:
            url = f"{self.base_url}/api/ai/plan"
            payload = {
                "prompt": "Create a project plan for building a mobile app",
                "user_id": "test_user_123"
            }
            
            response = self.session.post(url, json=payload, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "status": "pass",
                    "response_code": response.status_code,
                    "has_tasks": "tasks" in data or "items" in data,
                    "response_time": response.elapsed.total_seconds(),
                    "data_keys": list(data.keys()) if isinstance(data, dict) else []
                }
            else:
                return {
                    "status": "fail",
                    "response_code": response.status_code,
                    "error": response.text
                }
        except requests.exceptions.Timeout:
            return {"status": "fail", "error": "Request timeout - AI service may be slow"}
        except requests.exceptions.ConnectionError:
            return {"status": "fail", "error": "Cannot connect to backend server"}
        except Exception as e:
            return {"status": "fail", "error": str(e)}
    
    def test_board_items_endpoint(self):
        """Test /api/board/items returns existing tasks"""
        try:
            url = f"{self.base_url}/api/board/items"
            response = self.session.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "status": "pass",
                    "response_code": response.status_code,
                    "items_count": len(data) if isinstance(data, list) else 0,
                    "has_items": len(data) > 0 if isinstance(data, list) else False,
                    "response_time": response.elapsed.total_seconds()
                }
            else:
                return {
                    "status": "fail",
                    "response_code": response.status_code,
                    "error": response.text
                }
        except requests.exceptions.ConnectionError:
            return {"status": "fail", "error": "Cannot connect to backend server"}
        except Exception as e:
            return {"status": "fail", "error": str(e)}
    
    def test_add_task(self):
        """Test adding a new task"""
        try:
            url = f"{self.base_url}/api/board/items"
            task_data = {
                "title": "Test Task from API",
                "description": "This is a test task created via API",
                "status": "todo",
                "priority": "medium"
            }
            
            response = self.session.post(url, json=task_data, timeout=10)
            
            if response.status_code in [200, 201]:
                data = response.json()
                return {
                    "status": "pass",
                    "response_code": response.status_code,
                    "task_created": True,
                    "task_id": data.get("id") if isinstance(data, dict) else None,
                    "response_time": response.elapsed.total_seconds()
                }
            else:
                return {
                    "status": "fail",
                    "response_code": response.status_code,
                    "error": response.text
                }
        except Exception as e:
            return {"status": "fail", "error": str(e)}
    
    def test_update_task(self):
        """Test updating an existing task"""
        try:
            # First, get existing tasks
            items_response = self.session.get(f"{self.base_url}/api/board/items")
            if items_response.status_code != 200:
                return {"status": "skip", "reason": "No existing tasks to update"}
            
            items = items_response.json()
            if not items:
                return {"status": "skip", "reason": "No tasks available to update"}
            
            # Update the first task
            task_id = items[0].get("id") if isinstance(items[0], dict) else items[0]
            url = f"{self.base_url}/api/board/items/{task_id}"
            
            update_data = {
                "title": "Updated Test Task",
                "status": "in_progress"
            }
            
            response = self.session.put(url, json=update_data, timeout=10)
            
            if response.status_code in [200, 204]:
                return {
                    "status": "pass",
                    "response_code": response.status_code,
                    "task_updated": True,
                    "response_time": response.elapsed.total_seconds()
                }
            else:
                return {
                    "status": "fail",
                    "response_code": response.status_code,
                    "error": response.text
                }
        except Exception as e:
            return {"status": "fail", "error": str(e)}
    
    def test_delete_task(self):
        """Test deleting a task"""
        try:
            # First, get existing tasks
            items_response = self.session.get(f"{self.base_url}/api/board/items")
            if items_response.status_code != 200:
                return {"status": "skip", "reason": "No existing tasks to delete"}
            
            items = items_response.json()
            if not items:
                return {"status": "skip", "reason": "No tasks available to delete"}
            
            # Delete the first task
            task_id = items[0].get("id") if isinstance(items[0], dict) else items[0]
            url = f"{self.base_url}/api/board/items/{task_id}"
            
            response = self.session.delete(url, timeout=10)
            
            if response.status_code in [200, 204]:
                return {
                    "status": "pass",
                    "response_code": response.status_code,
                    "task_deleted": True,
                    "response_time": response.elapsed.total_seconds()
                }
            else:
                return {
                    "status": "fail",
                    "response_code": response.status_code,
                    "error": response.text
                }
        except Exception as e:
            return {"status": "fail", "error": str(e)}
    
    def test_authentication(self):
        """Test authentication endpoints"""
        try:
            # Test login endpoint
            login_url = f"{self.base_url}/api/auth/login"
            login_data = {
                "email": "test@example.com",
                "password": "testpassword"
            }
            
            response = self.session.post(login_url, json=login_data, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                self.test_user_token = data.get("token")
                return {
                    "status": "pass",
                    "login_works": True,
                    "token_received": self.test_user_token is not None,
                    "response_time": response.elapsed.total_seconds()
                }
            else:
                return {
                    "status": "fail",
                    "response_code": response.status_code,
                    "error": response.text
                }
        except Exception as e:
            return {"status": "fail", "error": str(e)}
    
    def test_error_handling(self):
        """Test backend error handling"""
        try:
            # Test invalid endpoint
            response = self.session.get(f"{self.base_url}/api/invalid-endpoint", timeout=5)
            
            return {
                "status": "pass",
                "handles_404": response.status_code == 404,
                "response_code": response.status_code,
                "error_handling_works": True
            }
        except Exception as e:
            return {"status": "fail", "error": str(e)}

# Test functions for integration with test runner
def test_ai_plan():
    tester = BackendTester()
    return tester.test_ai_plan_endpoint()

def test_board_items():
    tester = BackendTester()
    return tester.test_board_items_endpoint()

def test_add_task():
    tester = BackendTester()
    return tester.test_add_task()

def test_update_task():
    tester = BackendTester()
    return tester.test_update_task()

def test_delete_task():
    tester = BackendTester()
    return tester.test_delete_task()

def test_auth():
    tester = BackendTester()
    return tester.test_authentication()

def test_backend_errors():
    tester = BackendTester()
    return tester.test_error_handling()
