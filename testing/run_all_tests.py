#!/usr/bin/env python3
"""
Main Test Runner for AI Project Manager Tool
Runs all test suites and generates comprehensive reports
"""

import sys
import os
import json
from datetime import datetime

# Add current directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from test_runner import TestRunner
from frontend_tests import (
    test_landing_page, test_login_signup, test_ai_page, 
    test_kanban_board, test_error_handling
)
from backend_tests import (
    test_ai_plan, test_board_items, test_add_task, 
    test_update_task, test_delete_task, test_auth, test_backend_errors
)
from integration_tests import (
    test_complete_workflow, test_data_persistence, test_concurrent_users
)
from error_handling_tests import (
    test_network_failures, test_server_timeout, test_invalid_requests,
    test_ai_failures, test_database_failures, test_auth_failures, test_frontend_errors
)
from postman_tests import (
    test_api_health, test_ai_plan_detailed, test_board_crud,
    test_auth_flow, test_api_performance, test_error_responses
)

def main():
    """Run all test suites"""
    print("AI Project Manager Tool - Comprehensive Test Suite")
    print("=" * 60)
    print(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Initialize test runner
    runner = TestRunner()
    
    # Frontend Tests
    print("🔍 FRONTEND TESTS")
    print("-" * 30)
    runner.run_test("Landing Page Loads", test_landing_page)
    runner.run_test("Login/Signup Forms", test_login_signup)
    runner.run_test("AI Page Functionality", test_ai_page)
    runner.run_test("Kanban Board Operations", test_kanban_board)
    runner.run_test("Frontend Error Handling", test_error_handling)
    print()
    
    # Backend Tests
    print("🔧 BACKEND TESTS")
    print("-" * 30)
    runner.run_test("AI Plan Endpoint", test_ai_plan)
    runner.run_test("Board Items Endpoint", test_board_items)
    runner.run_test("Add Task", test_add_task)
    runner.run_test("Update Task", test_update_task)
    runner.run_test("Delete Task", test_delete_task)
    runner.run_test("Authentication", test_auth)
    runner.run_test("Backend Error Handling", test_backend_errors)
    print()
    
    # Integration Tests
    print("🔗 INTEGRATION TESTS")
    print("-" * 30)
    runner.run_test("Complete User Workflow", test_complete_workflow)
    runner.run_test("Data Persistence", test_data_persistence)
    runner.run_test("Concurrent Users", test_concurrent_users)
    print()
    
    # Error Handling Tests
    print("⚠️  ERROR HANDLING TESTS")
    print("-" * 30)
    runner.run_test("Network Failures", test_network_failures)
    runner.run_test("Server Timeout", test_server_timeout)
    runner.run_test("Invalid Requests", test_invalid_requests)
    runner.run_test("AI Service Failures", test_ai_failures)
    runner.run_test("Database Failures", test_database_failures)
    runner.run_test("Authentication Failures", test_auth_failures)
    runner.run_test("Frontend Error Display", test_frontend_errors)
    print()
    
    # Postman-style Tests
    print("📮 POSTMAN-STYLE TESTS")
    print("-" * 30)
    runner.run_test("API Health Check", test_api_health)
    runner.run_test("AI Plan Detailed", test_ai_plan_detailed)
    runner.run_test("Board CRUD Operations", test_board_crud)
    runner.run_test("Authentication Flow", test_auth_flow)
    runner.run_test("API Performance", test_api_performance)
    runner.run_test("Error Response Formats", test_error_responses)
    print()
    
    # Generate and display report
    print("📊 TEST SUMMARY")
    print("=" * 60)
    report = runner.generate_report()
    
    # Display summary
    summary = report["test_summary"]
    print(f"Total Tests: {summary['total_tests']}")
    print(f"Passed: {summary['passed']}")
    print(f"Failed: {summary['failed']}")
    print(f"Errors: {summary['errors']}")
    print(f"Duration: {summary['duration_seconds']:.2f} seconds")
    print()
    
    # Show failed tests
    failed_tests = [r for r in report["test_results"] if r["status"] in ["FAIL", "ERROR"]]
    if failed_tests:
        print("❌ FAILED TESTS:")
        for test in failed_tests:
            print(f"  - {test['test_name']}: {test['status']}")
            if 'error' in test:
                print(f"    Error: {test['error']}")
        print()
    
    # Show bugs found
    if report["bugs_found"]:
        print("🐛 BUGS FOUND:")
        for bug in report["bugs_found"]:
            print(f"  #{bug['id']}: {bug['title']} ({bug['severity']})")
        print()
    
    # Save detailed report
    report_file = "/Users/mcamac22/Testing_Midterm/test_report.json"
    print(f"📄 Detailed report saved to: {report_file}")
    
    # Create human-readable summary
    create_summary_report(report)
    
    return report

def create_summary_report(report):
    """Create a human-readable summary report"""
    summary_file = "/Users/mcamac22/Testing_Midterm/test_summary.md"
    
    with open(summary_file, "w") as f:
        f.write("# AI Project Manager Tool - Test Results\n\n")
        f.write(f"**Test Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        
        # Summary statistics
        summary = report["test_summary"]
        f.write("## Test Summary\n\n")
        f.write(f"- **Total Tests:** {summary['total_tests']}\n")
        f.write(f"- **Passed:** {summary['passed']}\n")
        f.write(f"- **Failed:** {summary['failed']}\n")
        f.write(f"- **Errors:** {summary['errors']}\n")
        f.write(f"- **Duration:** {summary['duration_seconds']:.2f} seconds\n\n")
        
        # Test results by category
        f.write("## Test Results by Category\n\n")
        
        categories = {
            "Frontend": ["Landing Page Loads", "Login/Signup Forms", "AI Page Functionality", "Kanban Board Operations", "Frontend Error Handling"],
            "Backend": ["AI Plan Endpoint", "Board Items Endpoint", "Add Task", "Update Task", "Delete Task", "Authentication", "Backend Error Handling"],
            "Integration": ["Complete User Workflow", "Data Persistence", "Concurrent Users"],
            "Error Handling": ["Network Failures", "Server Timeout", "Invalid Requests", "AI Service Failures", "Database Failures", "Authentication Failures", "Frontend Error Display"],
            "API Testing": ["API Health Check", "AI Plan Detailed", "Board CRUD Operations", "Authentication Flow", "API Performance", "Error Response Formats"]
        }
        
        for category, tests in categories.items():
            f.write(f"### {category}\n\n")
            for test_name in tests:
                test_result = next((r for r in report["test_results"] if r["test_name"] == test_name), None)
                if test_result:
                    status_emoji = "✅" if test_result["status"] == "PASS" else "❌"
                    f.write(f"- {status_emoji} {test_name}: {test_result['status']}\n")
            f.write("\n")
        
        # Bugs section
        if report["bugs_found"]:
            f.write("## Bugs Found\n\n")
            for bug in report["bugs_found"]:
                f.write(f"### Bug #{bug['id']}: {bug['title']}\n\n")
                f.write(f"**Severity:** {bug['severity']}\n\n")
                f.write(f"**Description:** {bug['description']}\n\n")
                if bug['steps_to_reproduce']:
                    f.write(f"**Steps to Reproduce:**\n{bug['steps_to_reproduce']}\n\n")
                f.write("---\n\n")
        
        # Recommendations
        f.write("## Recommendations\n\n")
        failed_count = summary['failed'] + summary['errors']
        if failed_count == 0:
            f.write("🎉 All tests passed! The system is ready for deployment.\n")
        elif failed_count <= 3:
            f.write("⚠️ A few tests failed. Review and fix the issues before deployment.\n")
        else:
            f.write("🚨 Multiple test failures detected. Significant work needed before deployment.\n")
    
    print(f"📄 Summary report saved to: {summary_file}")

if __name__ == "__main__":
    try:
        report = main()
        exit_code = 0 if report["test_summary"]["failed"] + report["test_summary"]["errors"] == 0 else 1
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n\n⚠️ Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Test runner failed: {str(e)}")
        sys.exit(1)
