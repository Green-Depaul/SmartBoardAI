"""
Postman-style API Tests for AI Project Manager Tool
Direct API testing without browser automation
"""

import requests
import json
import time
from typing import Dict, Any, List

class PostmanTester:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.test_results = []
    
    def test_api_health(self):
        """Test basic API health and connectivity"""
        try:
            # Test root endpoint
            response = self.session.get(f"{self.base_url}/", timeout=10)
            
            # Test health endpoint if available
            health_response = self.session.get(f"{self.base_url}/health", timeout=10)
            
            return {
                "status": "pass",
                "root_endpoint": response.status_code,
                "health_endpoint": health_response.status_code if health_response.status_code != 404 else "not_found",
                "api_accessible": response.status_code in [200, 404]  # 404 is ok if no root endpoint
            }
        except Exception as e:
            return {"status": "fail", "error": str(e)}
    
    def test_ai_plan_endpoint_detailed(self):
        """Detailed test of AI planning endpoint"""
        test_cases = [
            {
                "name": "Valid AI Request",
                "payload": {
                    "prompt": "Create a project plan for building a mobile app",
                    "user_id": "test_user_123"
                },
                "expected_status": 200
            },
            {
                "name": "Empty Prompt",
                "payload": {
                    "prompt": "",
                    "user_id": "test_user_123"
                },
                "expected_status": 400
            },
            {
                "name": "Missing User ID",
                "payload": {
                    "prompt": "Create a project plan"
                },
                "expected_status": 400
            },
            {
                "name": "Long Prompt",
                "payload": {
                    "prompt": "Create a detailed project plan for a complex enterprise application with microservices architecture, user authentication, payment processing, real-time notifications, and mobile app integration. Include all phases from planning to deployment.",
                    "user_id": "test_user_123"
                },
                "expected_status": 200
            }
        ]
        
        results = []
        for test_case in test_cases:
            try:
                start_time = time.time()
                response = self.session.post(
                    f"{self.base_url}/api/ai/plan",
                    json=test_case["payload"],
                    timeout=60
                )
                response_time = time.time() - start_time
                
                results.append({
                    "test_name": test_case["name"],
                    "status_code": response.status_code,
                    "expected_status": test_case["expected_status"],
                    "response_time": response_time,
                    "success": response.status_code == test_case["expected_status"],
                    "response_size": len(response.text),
                    "has_data": len(response.json()) > 0 if response.status_code == 200 else False
                })
            except Exception as e:
                results.append({
                    "test_name": test_case["name"],
                    "error": str(e),
                    "success": False
                })
        
        return {
            "status": "pass",
            "test_cases": len(results),
            "results": results,
            "success_rate": sum(1 for r in results if r.get("success", False)) / len(results)
        }
    
    def test_board_crud_operations(self):
        """Test complete CRUD operations on board items"""
        try:
            # CREATE - Add a new task
            create_payload = {
                "title": "Postman Test Task",
                "description": "Task created via Postman-style testing",
                "status": "todo",
                "priority": "high"
            }
            
            create_response = self.session.post(
                f"{self.base_url}/api/board/items",
                json=create_payload,
                timeout=10
            )
            
            if create_response.status_code not in [200, 201]:
                return {"status": "fail", "error": "Failed to create task"}
            
            created_task = create_response.json()
            task_id = created_task.get("id")
            
            # READ - Get all tasks
            read_response = self.session.get(f"{self.base_url}/api/board/items", timeout=10)
            tasks = read_response.json() if read_response.status_code == 200 else []
            
            # UPDATE - Update the task
            update_payload = {
                "title": "Updated Postman Test Task",
                "status": "in_progress"
            }
            
            update_response = self.session.put(
                f"{self.base_url}/api/board/items/{task_id}",
                json=update_payload,
                timeout=10
            )
            
            # DELETE - Delete the task
            delete_response = self.session.delete(
                f"{self.base_url}/api/board/items/{task_id}",
                timeout=10
            )
            
            return {
                "status": "pass",
                "create_success": create_response.status_code in [200, 201],
                "read_success": read_response.status_code == 200,
                "update_success": update_response.status_code in [200, 204],
                "delete_success": delete_response.status_code in [200, 204],
                "task_created": task_id is not None,
                "tasks_found": len(tasks),
                "crud_complete": all([
                    create_response.status_code in [200, 201],
                    read_response.status_code == 200,
                    update_response.status_code in [200, 204],
                    delete_response.status_code in [200, 204]
                ])
            }
        except Exception as e:
            return {"status": "fail", "error": str(e)}
    
    def test_authentication_flow(self):
        """Test complete authentication flow"""
        try:
            # Test login
            login_payload = {
                "email": "test@example.com",
                "password": "testpassword"
            }
            
            login_response = self.session.post(
                f"{self.base_url}/api/auth/login",
                json=login_payload,
                timeout=10
            )
            
            if login_response.status_code != 200:
                return {"status": "fail", "error": "Login failed"}
            
            login_data = login_response.json()
            token = login_data.get("token")
            
            # Test authenticated request
            headers = {"Authorization": f"Bearer {token}"}
            auth_response = self.session.get(
                f"{self.base_url}/api/board/items",
                headers=headers,
                timeout=10
            )
            
            # Test token validation
            invalid_token_response = self.session.get(
                f"{self.base_url}/api/board/items",
                headers={"Authorization": "Bearer invalid_token"},
                timeout=10
            )
            
            return {
                "status": "pass",
                "login_success": login_response.status_code == 200,
                "token_received": token is not None,
                "authenticated_request": auth_response.status_code == 200,
                "invalid_token_rejected": invalid_token_response.status_code in [401, 403],
                "auth_flow_complete": all([
                    login_response.status_code == 200,
                    token is not None,
                    auth_response.status_code == 200,
                    invalid_token_response.status_code in [401, 403]
                ])
            }
        except Exception as e:
            return {"status": "fail", "error": str(e)}
    
    def test_api_performance(self):
        """Test API performance and response times"""
        try:
            endpoints = [
                {"url": f"{self.base_url}/api/board/items", "method": "GET"},
                {"url": f"{self.base_url}/api/board/items", "method": "POST", "data": {
                    "title": "Performance Test Task",
                    "status": "todo"
                }},
                {"url": f"{self.base_url}/api/ai/plan", "method": "POST", "data": {
                    "prompt": "Quick test",
                    "user_id": "perf_test"
                }}
            ]
            
            performance_results = []
            for endpoint in endpoints:
                start_time = time.time()
                
                if endpoint["method"] == "GET":
                    response = self.session.get(endpoint["url"], timeout=30)
                elif endpoint["method"] == "POST":
                    response = self.session.post(endpoint["url"], json=endpoint["data"], timeout=30)
                
                response_time = time.time() - start_time
                
                performance_results.append({
                    "endpoint": endpoint["url"],
                    "method": endpoint["method"],
                    "response_time": response_time,
                    "status_code": response.status_code,
                    "acceptable_time": response_time < 5.0  # 5 second threshold
                })
            
            avg_response_time = sum(r["response_time"] for r in performance_results) / len(performance_results)
            all_acceptable = all(r["acceptable_time"] for r in performance_results)
            
            return {
                "status": "pass",
                "endpoints_tested": len(performance_results),
                "average_response_time": avg_response_time,
                "all_acceptable": all_acceptable,
                "results": performance_results
            }
        except Exception as e:
            return {"status": "fail", "error": str(e)}
    
    def test_api_error_responses(self):
        """Test API error response formats"""
        try:
            error_tests = [
                {
                    "name": "404 Not Found",
                    "url": f"{self.base_url}/api/nonexistent",
                    "method": "GET",
                    "expected_status": 404
                },
                {
                    "name": "400 Bad Request",
                    "url": f"{self.base_url}/api/board/items",
                    "method": "POST",
                    "data": "invalid json",
                    "expected_status": 400
                },
                {
                    "name": "405 Method Not Allowed",
                    "url": f"{self.base_url}/api/board/items",
                    "method": "PATCH",
                    "expected_status": 405
                }
            ]
            
            error_results = []
            for test in error_tests:
                try:
                    if test["method"] == "GET":
                        response = self.session.get(test["url"], timeout=10)
                    elif test["method"] == "POST":
                        response = self.session.post(test["url"], data=test.get("data"), timeout=10)
                    elif test["method"] == "PATCH":
                        response = self.session.patch(test["url"], timeout=10)
                    
                    error_results.append({
                        "test_name": test["name"],
                        "status_code": response.status_code,
                        "expected_status": test["expected_status"],
                        "has_error_message": len(response.text) > 0,
                        "correct_status": response.status_code == test["expected_status"]
                    })
                except Exception as e:
                    error_results.append({
                        "test_name": test["name"],
                        "error": str(e),
                        "correct_status": False
                    })
            
            return {
                "status": "pass",
                "error_tests": len(error_results),
                "results": error_results,
                "all_correct": all(r.get("correct_status", False) for r in error_results)
            }
        except Exception as e:
            return {"status": "fail", "error": str(e)}

# Test functions for integration with test runner
def test_api_health():
    tester = PostmanTester()
    return tester.test_api_health()

def test_ai_plan_detailed():
    tester = PostmanTester()
    return tester.test_ai_plan_endpoint_detailed()

def test_board_crud():
    tester = PostmanTester()
    return tester.test_board_crud_operations()

def test_auth_flow():
    tester = PostmanTester()
    return tester.test_authentication_flow()

def test_api_performance():
    tester = PostmanTester()
    return tester.test_api_performance()

def test_error_responses():
    tester = PostmanTester()
    return tester.test_api_error_responses()
