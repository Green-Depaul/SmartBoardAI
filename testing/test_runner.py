#!/usr/bin/env python3
"""
Test Runner for AI Project Manager Tool
This script coordinates all testing activities and generates reports.
"""

import json
import time
from datetime import datetime
from typing import Dict, List, Any

class TestRunner:
    def __init__(self):
        self.test_results = []
        self.bugs_found = []
        self.start_time = datetime.now()
    
    def run_test(self, test_name: str, test_function, *args, **kwargs):
        """Run a single test and record results"""
        print(f"Running test: {test_name}")
        try:
            result = test_function(*args, **kwargs)
            self.test_results.append({
                "test_name": test_name,
                "status": "PASS" if result else "FAIL",
                "timestamp": datetime.now().isoformat(),
                "details": result if isinstance(result, dict) else {"result": result}
            })
            print(f"✓ {test_name}: {'PASS' if result else 'FAIL'}")
            return result
        except Exception as e:
            self.test_results.append({
                "test_name": test_name,
                "status": "ERROR",
                "timestamp": datetime.now().isoformat(),
                "error": str(e)
            })
            print(f"✗ {test_name}: ERROR - {str(e)}")
            return False
    
    def add_bug(self, title: str, description: str, severity: str = "Medium", steps_to_reproduce: str = ""):
        """Add a bug to the tracking list"""
        bug = {
            "id": len(self.bugs_found) + 1,
            "title": title,
            "description": description,
            "severity": severity,
            "steps_to_reproduce": steps_to_reproduce,
            "status": "Open",
            "created": datetime.now().isoformat()
        }
        self.bugs_found.append(bug)
        print(f"🐛 Bug #{bug['id']}: {title}")
    
    def generate_report(self):
        """Generate comprehensive test report"""
        end_time = datetime.now()
        duration = (end_time - self.start_time).total_seconds()
        
        report = {
            "test_summary": {
                "total_tests": len(self.test_results),
                "passed": len([r for r in self.test_results if r["status"] == "PASS"]),
                "failed": len([r for r in self.test_results if r["status"] == "FAIL"]),
                "errors": len([r for r in self.test_results if r["status"] == "ERROR"]),
                "duration_seconds": duration
            },
            "test_results": self.test_results,
            "bugs_found": self.bugs_found,
            "generated_at": end_time.isoformat()
        }
        
        # Save report to file
        with open("/Users/mcamac22/Testing_Midterm/test_report.json", "w") as f:
            json.dump(report, f, indent=2)
        
        return report

if __name__ == "__main__":
    runner = TestRunner()
    print("AI Project Manager Tool - Test Runner")
    print("=" * 50)
