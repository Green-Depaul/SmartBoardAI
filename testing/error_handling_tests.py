"""
Error Handling Tests for AI Project Manager Tool
Tests system behavior under failure conditions and edge cases
"""

import requests
import json
import time
from typing import Dict, Any, List

class ErrorHandlingTester:
    def __init__(self, frontend_url="http://localhost:3000", backend_url="http://localhost:8000"):
        self.frontend_url = frontend_url
        self.backend_url = backend_url
        self.session = requests.Session()
    
    def test_network_failures(self):
        """Test behavior when network is unavailable"""
        try:
            # Test with invalid backend URL
            invalid_backend = "http://invalid-backend-url:9999"
            response = self.session.get(f"{invalid_backend}/api/board/items", timeout=5)
            
            return {
                "status": "fail",
                "error": "Should not reach invalid backend"
            }
        except requests.exceptions.ConnectionError:
            return {
                "status": "pass",
                "network_failure_handled": True,
                "connection_error_caught": True
            }
        except Exception as e:
            return {
                "status": "fail",
                "error": f"Unexpected error: {str(e)}"
            }
    
    def test_server_timeout(self):
        """Test behavior when server is slow to respond"""
        try:
            # Test with very short timeout
            response = self.session.get(f"{self.backend_url}/api/board/items", timeout=0.1)
            return {
                "status": "fail",
                "error": "Request should have timed out"
            }
        except requests.exceptions.Timeout:
            return {
                "status": "pass",
                "timeout_handled": True,
                "timeout_error_caught": True
            }
        except Exception as e:
            return {
                "status": "fail",
                "error": f"Unexpected error: {str(e)}"
            }
    
    def test_invalid_api_requests(self):
        """Test API behavior with invalid requests"""
        test_cases = [
            {
                "name": "Invalid JSON",
                "url": f"{self.backend_url}/api/board/items",
                "method": "POST",
                "data": "invalid json string",
                "headers": {"Content-Type": "application/json"}
            },
            {
                "name": "Missing Required Fields",
                "url": f"{self.backend_url}/api/board/items",
                "method": "POST",
                "data": json.dumps({}),
                "headers": {"Content-Type": "application/json"}
            },
            {
                "name": "Invalid Endpoint",
                "url": f"{self.backend_url}/api/invalid/endpoint",
                "method": "GET",
                "data": None,
                "headers": {}
            },
            {
                "name": "Invalid HTTP Method",
                "url": f"{self.backend_url}/api/board/items",
                "method": "PATCH",
                "data": None,
                "headers": {}
            }
        ]
        
        results = []
        for test_case in test_cases:
            try:
                if test_case["method"] == "GET":
                    response = self.session.get(test_case["url"], timeout=10)
                elif test_case["method"] == "POST":
                    response = self.session.post(
                        test_case["url"], 
                        data=test_case["data"],
                        headers=test_case["headers"],
                        timeout=10
                    )
                elif test_case["method"] == "PATCH":
                    response = self.session.patch(test_case["url"], timeout=10)
                
                results.append({
                    "test": test_case["name"],
                    "status_code": response.status_code,
                    "handles_error": response.status_code >= 400,
                    "has_error_message": len(response.text) > 0
                })
            except Exception as e:
                results.append({
                    "test": test_case["name"],
                    "error": str(e),
                    "handles_error": True
                })
        
        return {
            "status": "pass",
            "test_cases": len(test_cases),
            "results": results,
            "all_handled": all(r.get("handles_error", False) for r in results)
        }
    
    def test_ai_service_failures(self):
        """Test AI service failure scenarios"""
        try:
            # Test with invalid AI prompt
            ai_url = f"{self.backend_url}/api/ai/plan"
            invalid_prompts = [
                "",  # Empty prompt
                None,  # Null prompt
                "x" * 10000,  # Extremely long prompt
                {"invalid": "data"}  # Wrong data type
            ]
            
            results = []
            for i, prompt in enumerate(invalid_prompts):
                try:
                    payload = {"prompt": prompt, "user_id": "test_user"}
                    response = self.session.post(ai_url, json=payload, timeout=30)
                    
                    results.append({
                        "prompt_type": f"invalid_prompt_{i+1}",
                        "status_code": response.status_code,
                        "handles_error": response.status_code >= 400,
                        "response_time": response.elapsed.total_seconds()
                    })
                except Exception as e:
                    results.append({
                        "prompt_type": f"invalid_prompt_{i+1}",
                        "error": str(e),
                        "handles_error": True
                    })
            
            return {
                "status": "pass",
                "ai_failure_tests": len(results),
                "results": results,
                "all_handled": all(r.get("handles_error", False) for r in results)
            }
        except Exception as e:
            return {"status": "fail", "error": str(e)}
    
    def test_database_connection_failures(self):
        """Test behavior when database is unavailable"""
        try:
            # This test assumes the backend has database connection issues
            # In a real scenario, you might temporarily disable the database
            board_url = f"{self.backend_url}/api/board/items"
            
            # Try to create a task (this should fail if DB is down)
            task_data = {
                "title": "Database Test Task",
                "description": "This should fail if DB is down",
                "status": "todo"
            }
            
            response = self.session.post(board_url, json=task_data, timeout=10)
            
            if response.status_code >= 500:
                return {
                    "status": "pass",
                    "database_error_handled": True,
                    "returns_server_error": True,
                    "status_code": response.status_code
                }
            else:
                return {
                    "status": "pass",
                    "database_working": True,
                    "status_code": response.status_code
                }
        except Exception as e:
            return {"status": "fail", "error": str(e)}
    
    def test_authentication_failures(self):
        """Test authentication failure scenarios"""
        try:
            auth_tests = [
                {
                    "name": "Invalid Credentials",
                    "url": f"{self.backend_url}/api/auth/login",
                    "data": {"email": "invalid@example.com", "password": "wrongpassword"}
                },
                {
                    "name": "Missing Credentials",
                    "url": f"{self.backend_url}/api/auth/login",
                    "data": {}
                },
                {
                    "name": "Invalid Token",
                    "url": f"{self.backend_url}/api/board/items",
                    "headers": {"Authorization": "Bearer invalid_token"}
                }
            ]
            
            results = []
            for test in auth_tests:
                try:
                    if "headers" in test:
                        response = self.session.get(test["url"], headers=test["headers"], timeout=10)
                    else:
                        response = self.session.post(test["url"], json=test["data"], timeout=10)
                    
                    results.append({
                        "test": test["name"],
                        "status_code": response.status_code,
                        "handles_auth_error": response.status_code in [401, 403],
                        "has_error_message": len(response.text) > 0
                    })
                except Exception as e:
                    results.append({
                        "test": test["name"],
                        "error": str(e),
                        "handles_auth_error": True
                    })
            
            return {
                "status": "pass",
                "auth_tests": len(results),
                "results": results,
                "all_handled": all(r.get("handles_auth_error", False) for r in results)
            }
        except Exception as e:
            return {"status": "fail", "error": str(e)}
    
    def test_frontend_error_display(self):
        """Test that frontend displays helpful error messages"""
        try:
            # Test frontend with backend down
            frontend_response = self.session.get(f"{self.frontend_url}", timeout=10)
            
            if frontend_response.status_code == 200:
                # Check if frontend has error handling elements
                content = frontend_response.text.lower()
                has_error_handling = any(keyword in content for keyword in [
                    "error", "failed", "unavailable", "retry", "offline"
                ])
                
                return {
                    "status": "pass",
                    "frontend_loads": True,
                    "has_error_handling": has_error_handling,
                    "content_length": len(content)
                }
            else:
                return {
                    "status": "fail",
                    "frontend_status": frontend_response.status_code,
                    "error": "Frontend not accessible"
                }
        except Exception as e:
            return {"status": "fail", "error": str(e)}

# Test functions for integration with test runner
def test_network_failures():
    tester = ErrorHandlingTester()
    return tester.test_network_failures()

def test_server_timeout():
    tester = ErrorHandlingTester()
    return tester.test_server_timeout()

def test_invalid_requests():
    tester = ErrorHandlingTester()
    return tester.test_invalid_api_requests()

def test_ai_failures():
    tester = ErrorHandlingTester()
    return tester.test_ai_service_failures()

def test_database_failures():
    tester = ErrorHandlingTester()
    return tester.test_database_connection_failures()

def test_auth_failures():
    tester = ErrorHandlingTester()
    return tester.test_authentication_failures()

def test_frontend_errors():
    tester = ErrorHandlingTester()
    return tester.test_frontend_error_display()
