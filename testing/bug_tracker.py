#!/usr/bin/env python3
"""
Bug Tracker for AI Project Manager Tool Testing
Manages bug reports, tickets, and issue tracking
"""

import json
import uuid
from datetime import datetime
from typing import Dict, List, Any, Optional

class BugTracker:
    def __init__(self, bug_file="/Users/mcamac22/Testing_Midterm/bugs.json"):
        self.bug_file = bug_file
        self.bugs = self.load_bugs()
    
    def load_bugs(self) -> List[Dict]:
        """Load existing bugs from file"""
        try:
            with open(self.bug_file, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return []
        except json.JSONDecodeError:
            return []
    
    def save_bugs(self):
        """Save bugs to file"""
        with open(self.bug_file, 'w') as f:
            json.dump(self.bugs, f, indent=2)
    
    def create_bug(self, title: str, description: str, severity: str = "Medium", 
                   steps_to_reproduce: str = "", component: str = "", 
                   environment: str = "", assignee: str = "") -> str:
        """Create a new bug report"""
        bug_id = str(uuid.uuid4())[:8]
        
        bug = {
            "id": bug_id,
            "title": title,
            "description": description,
            "severity": severity,
            "priority": self._calculate_priority(severity),
            "status": "Open",
            "component": component,
            "environment": environment,
            "assignee": assignee,
            "steps_to_reproduce": steps_to_reproduce,
            "created": datetime.now().isoformat(),
            "updated": datetime.now().isoformat(),
            "reporter": "Test Suite",
            "tags": [],
            "attachments": [],
            "comments": []
        }
        
        self.bugs.append(bug)
        self.save_bugs()
        return bug_id
    
    def _calculate_priority(self, severity: str) -> str:
        """Calculate priority based on severity"""
        priority_map = {
            "Critical": "P0",
            "High": "P1", 
            "Medium": "P2",
            "Low": "P3"
        }
        return priority_map.get(severity, "P2")
    
    def update_bug(self, bug_id: str, updates: Dict[str, Any]) -> bool:
        """Update an existing bug"""
        for bug in self.bugs:
            if bug["id"] == bug_id:
                for key, value in updates.items():
                    if key in bug:
                        bug[key] = value
                bug["updated"] = datetime.now().isoformat()
                self.save_bugs()
                return True
        return False
    
    def add_comment(self, bug_id: str, comment: str, author: str = "Test Suite") -> bool:
        """Add a comment to a bug"""
        for bug in self.bugs:
            if bug["id"] == bug_id:
                comment_obj = {
                    "id": str(uuid.uuid4())[:8],
                    "author": author,
                    "comment": comment,
                    "timestamp": datetime.now().isoformat()
                }
                bug["comments"].append(comment_obj)
                bug["updated"] = datetime.now().isoformat()
                self.save_bugs()
                return True
        return False
    
    def get_bug(self, bug_id: str) -> Optional[Dict]:
        """Get a specific bug by ID"""
        for bug in self.bugs:
            if bug["id"] == bug_id:
                return bug
        return None
    
    def get_bugs_by_status(self, status: str) -> List[Dict]:
        """Get all bugs with a specific status"""
        return [bug for bug in self.bugs if bug["status"] == status]
    
    def get_bugs_by_severity(self, severity: str) -> List[Dict]:
        """Get all bugs with a specific severity"""
        return [bug for bug in self.bugs if bug["severity"] == severity]
    
    def get_bugs_by_component(self, component: str) -> List[Dict]:
        """Get all bugs for a specific component"""
        return [bug for bug in self.bugs if bug["component"] == component]
    
    def close_bug(self, bug_id: str, resolution: str = "Fixed") -> bool:
        """Close a bug with resolution"""
        return self.update_bug(bug_id, {
            "status": "Closed",
            "resolution": resolution,
            "closed": datetime.now().isoformat()
        })
    
    def reopen_bug(self, bug_id: str) -> bool:
        """Reopen a closed bug"""
        return self.update_bug(bug_id, {
            "status": "Reopened",
            "reopened": datetime.now().isoformat()
        })
    
    def get_bug_summary(self) -> Dict[str, Any]:
        """Get summary statistics of bugs"""
        total = len(self.bugs)
        by_status = {}
        by_severity = {}
        by_component = {}
        
        for bug in self.bugs:
            # Count by status
            status = bug["status"]
            by_status[status] = by_status.get(status, 0) + 1
            
            # Count by severity
            severity = bug["severity"]
            by_severity[severity] = by_severity.get(severity, 0) + 1
            
            # Count by component
            component = bug["component"] or "Unassigned"
            by_component[component] = by_component.get(component, 0) + 1
        
        return {
            "total_bugs": total,
            "by_status": by_status,
            "by_severity": by_severity,
            "by_component": by_component,
            "open_bugs": by_status.get("Open", 0),
            "closed_bugs": by_status.get("Closed", 0)
        }
    
    def export_bugs(self, format: str = "json") -> str:
        """Export bugs in specified format"""
        if format.lower() == "json":
            return json.dumps(self.bugs, indent=2)
        elif format.lower() == "csv":
            return self._export_csv()
        else:
            raise ValueError("Unsupported format. Use 'json' or 'csv'")
    
    def _export_csv(self) -> str:
        """Export bugs as CSV"""
        if not self.bugs:
            return "No bugs to export"
        
        import csv
        import io
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        headers = ["ID", "Title", "Severity", "Status", "Component", "Created", "Updated"]
        writer.writerow(headers)
        
        # Write bug data
        for bug in self.bugs:
            row = [
                bug["id"],
                bug["title"],
                bug["severity"],
                bug["status"],
                bug["component"],
                bug["created"],
                bug["updated"]
            ]
            writer.writerow(row)
        
        return output.getvalue()
    
    def create_bug_from_test_failure(self, test_name: str, error_message: str, 
                                    test_category: str = "Unknown") -> str:
        """Create a bug automatically from a test failure"""
        title = f"Test Failure: {test_name}"
        description = f"Test '{test_name}' failed with error: {error_message}"
        steps = f"1. Run test: {test_name}\n2. Observe failure\n3. Check error message"
        
        return self.create_bug(
            title=title,
            description=description,
            severity="Medium",
            steps_to_reproduce=steps,
            component=test_category
        )

def main():
    """Command-line interface for bug tracker"""
    import sys
    
    tracker = BugTracker()
    
    if len(sys.argv) < 2:
        print("Usage: python bug_tracker.py <command> [args]")
        print("Commands:")
        print("  create <title> <description> [severity]")
        print("  list [status]")
        print("  show <bug_id>")
        print("  update <bug_id> <field> <value>")
        print("  close <bug_id> [resolution]")
        print("  summary")
        return
    
    command = sys.argv[1]
    
    if command == "create":
        if len(sys.argv) < 4:
            print("Usage: create <title> <description> [severity]")
            return
        title = sys.argv[2]
        description = sys.argv[3]
        severity = sys.argv[4] if len(sys.argv) > 4 else "Medium"
        bug_id = tracker.create_bug(title, description, severity)
        print(f"Created bug {bug_id}")
    
    elif command == "list":
        status = sys.argv[2] if len(sys.argv) > 2 else None
        if status:
            bugs = tracker.get_bugs_by_status(status)
        else:
            bugs = tracker.bugs
        
        print(f"Found {len(bugs)} bugs:")
        for bug in bugs:
            print(f"  {bug['id']}: {bug['title']} ({bug['status']}, {bug['severity']})")
    
    elif command == "show":
        if len(sys.argv) < 3:
            print("Usage: show <bug_id>")
            return
        bug_id = sys.argv[2]
        bug = tracker.get_bug(bug_id)
        if bug:
            print(json.dumps(bug, indent=2))
        else:
            print(f"Bug {bug_id} not found")
    
    elif command == "summary":
        summary = tracker.get_bug_summary()
        print("Bug Summary:")
        print(f"  Total bugs: {summary['total_bugs']}")
        print(f"  Open: {summary['open_bugs']}")
        print(f"  Closed: {summary['closed_bugs']}")
        print("\nBy Status:")
        for status, count in summary['by_status'].items():
            print(f"  {status}: {count}")
        print("\nBy Severity:")
        for severity, count in summary['by_severity'].items():
            print(f"  {severity}: {count}")
    
    else:
        print(f"Unknown command: {command}")

if __name__ == "__main__":
    main()
