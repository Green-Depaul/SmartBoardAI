"""
Integration Tests for AI Project Manager Tool
Tests complete user workflows and system integration
"""

import requests
import json
import time
from typing import Dict, Any, List

class IntegrationTester:
    def __init__(self, frontend_url="http://localhost:3000", backend_url="http://localhost:8000"):
        self.frontend_url = frontend_url
        self.backend_url = backend_url
        self.session = requests.Session()
        self.user_token = None
    
    def test_complete_user_workflow(self):
        """Test complete user workflow from login to task management"""
        try:
            # Step 1: Login
            login_result = self._test_login()
            if not login_result["success"]:
                return {"status": "fail", "step": "login", "error": login_result["error"]}
            
            # Step 2: Get AI plan
            ai_result = self._test_ai_planning()
            if not ai_result["success"]:
                return {"status": "fail", "step": "ai_planning", "error": ai_result["error"]}
            
            # Step 3: Create tasks from AI plan
            task_creation = self._test_task_creation_from_ai()
            if not task_creation["success"]:
                return {"status": "fail", "step": "task_creation", "error": task_creation["error"]}
            
            # Step 4: Manage tasks on board
            board_management = self._test_board_management()
            if not board_management["success"]:
                return {"status": "fail", "step": "board_management", "error": board_management["error"]}
            
            return {
                "status": "pass",
                "workflow_complete": True,
                "steps_completed": ["login", "ai_planning", "task_creation", "board_management"],
                "total_time": time.time() - self.start_time if hasattr(self, 'start_time') else 0
            }
        except Exception as e:
            return {"status": "fail", "error": str(e)}
    
    def _test_login(self):
        """Test user login process"""
        try:
            login_url = f"{self.backend_url}/api/auth/login"
            login_data = {
                "email": "test@example.com",
                "password": "testpassword"
            }
            
            response = self.session.post(login_url, json=login_data, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                self.user_token = data.get("token")
                return {"success": True, "token": self.user_token}
            else:
                return {"success": False, "error": f"Login failed: {response.status_code}"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def _test_ai_planning(self):
        """Test AI planning workflow"""
        try:
            ai_url = f"{self.backend_url}/api/ai/plan"
            ai_prompt = {
                "prompt": "Create a detailed project plan for building a task management app",
                "user_id": "test_user_123"
            }
            
            response = self.session.post(ai_url, json=ai_prompt, timeout=60)
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "tasks_generated": len(data.get("tasks", [])),
                    "ai_response": data
                }
            else:
                return {"success": False, "error": f"AI planning failed: {response.status_code}"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def _test_task_creation_from_ai(self):
        """Test creating tasks from AI-generated plan"""
        try:
            # Get AI plan first
            ai_url = f"{self.backend_url}/api/ai/plan"
            ai_prompt = {
                "prompt": "Create 3 tasks for a simple project",
                "user_id": "test_user_123"
            }
            
            ai_response = self.session.post(ai_url, json=ai_prompt, timeout=30)
            if ai_response.status_code != 200:
                return {"success": False, "error": "AI planning failed"}
            
            ai_data = ai_response.json()
            tasks = ai_data.get("tasks", [])
            
            # Create tasks on board
            created_tasks = []
            for task in tasks[:3]:  # Limit to 3 tasks for testing
                board_url = f"{self.backend_url}/api/board/items"
                task_data = {
                    "title": task.get("title", "AI Generated Task"),
                    "description": task.get("description", ""),
                    "status": "todo",
                    "priority": task.get("priority", "medium")
                }
                
                response = self.session.post(board_url, json=task_data, timeout=10)
                if response.status_code in [200, 201]:
                    created_tasks.append(response.json())
            
            return {
                "success": True,
                "tasks_created": len(created_tasks),
                "created_tasks": created_tasks
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def _test_board_management(self):
        """Test board management operations"""
        try:
            # Get existing tasks
            board_url = f"{self.backend_url}/api/board/items"
            response = self.session.get(board_url, timeout=10)
            
            if response.status_code != 200:
                return {"success": False, "error": "Failed to get board items"}
            
            tasks = response.json()
            if not tasks:
                return {"success": False, "error": "No tasks found on board"}
            
            # Test updating a task
            task_id = tasks[0].get("id") if isinstance(tasks[0], dict) else tasks[0]
            update_url = f"{self.backend_url}/api/board/items/{task_id}"
            update_data = {"status": "in_progress"}
            
            update_response = self.session.put(update_url, json=update_data, timeout=10)
            update_success = update_response.status_code in [200, 204]
            
            # Test moving task to different status
            move_data = {"status": "done"}
            move_response = self.session.put(update_url, json=move_data, timeout=10)
            move_success = move_response.status_code in [200, 204]
            
            return {
                "success": True,
                "tasks_found": len(tasks),
                "update_works": update_success,
                "move_works": move_success
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def test_data_persistence(self):
        """Test that data persists across sessions"""
        try:
            # Create a task
            board_url = f"{self.backend_url}/api/board/items"
            task_data = {
                "title": "Persistence Test Task",
                "description": "This task should persist across sessions",
                "status": "todo"
            }
            
            create_response = self.session.post(board_url, json=task_data, timeout=10)
            if create_response.status_code not in [200, 201]:
                return {"status": "fail", "error": "Failed to create task"}
            
            created_task = create_response.json()
            task_id = created_task.get("id")
            
            # Wait a moment
            time.sleep(2)
            
            # Get all tasks and verify our task exists
            get_response = self.session.get(board_url, timeout=10)
            if get_response.status_code != 200:
                return {"status": "fail", "error": "Failed to retrieve tasks"}
            
            all_tasks = get_response.json()
            task_exists = any(task.get("id") == task_id for task in all_tasks)
            
            return {
                "status": "pass" if task_exists else "fail",
                "task_created": True,
                "task_persists": task_exists,
                "total_tasks": len(all_tasks)
            }
        except Exception as e:
            return {"status": "fail", "error": str(e)}
    
    def test_concurrent_users(self):
        """Test system behavior with multiple concurrent users"""
        try:
            # Simulate multiple users creating tasks
            import threading
            import queue
            
            results = queue.Queue()
            
            def create_task_for_user(user_id):
                try:
                    board_url = f"{self.backend_url}/api/board/items"
                    task_data = {
                        "title": f"Concurrent Task from User {user_id}",
                        "description": f"Task created by user {user_id}",
                        "status": "todo",
                        "user_id": user_id
                    }
                    
                    response = self.session.post(board_url, json=task_data, timeout=10)
                    results.put({
                        "user_id": user_id,
                        "success": response.status_code in [200, 201],
                        "response_code": response.status_code
                    })
                except Exception as e:
                    results.put({"user_id": user_id, "success": False, "error": str(e)})
            
            # Create 3 concurrent users
            threads = []
            for i in range(3):
                thread = threading.Thread(target=create_task_for_user, args=(f"user_{i}",))
                threads.append(thread)
                thread.start()
            
            # Wait for all threads to complete
            for thread in threads:
                thread.join(timeout=30)
            
            # Collect results
            concurrent_results = []
            while not results.empty():
                concurrent_results.append(results.get())
            
            success_count = sum(1 for r in concurrent_results if r.get("success", False))
            
            return {
                "status": "pass" if success_count == 3 else "fail",
                "concurrent_users": 3,
                "successful_operations": success_count,
                "results": concurrent_results
            }
        except Exception as e:
            return {"status": "fail", "error": str(e)}

# Test functions for integration with test runner
def test_complete_workflow():
    tester = IntegrationTester()
    return tester.test_complete_user_workflow()

def test_data_persistence():
    tester = IntegrationTester()
    return tester.test_data_persistence()

def test_concurrent_users():
    tester = IntegrationTester()
    return tester.test_concurrent_users()
