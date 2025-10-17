# Prompt templates and builders for SmartBoardAI
# Contains functions to build dynamic prompts with context

from typing import Dict, Any, List, Optional

class PromptTemplates:
    """Template functions for building dynamic prompts"""
    
    @staticmethod
    def build_context_prompt(user_data: Optional[Dict[str, Any]], 
                           project_data: Optional[Dict[str, Any]], 
                           user_id: str, 
                           project_id: str) -> tuple[str, List[str]]:
        """
        Build context string from user and project data
        
        Returns:
            tuple: (context_text, used_keys)
        """
        context_lines = []
        used_keys = []
        
        # Project context
        if project_data:
            name = project_data.get("name") or project_data.get("title") or "unknown"
            context_lines.append(f"Project: {name} (id={project_id})")
            used_keys.append("project.name")
            
            if project_data.get("description"): 
                context_lines.append(f"Description: {project_data['description']}")
                used_keys.append("project.description")
            if project_data.get("deadline"): 
                context_lines.append(f"Deadline: {project_data['deadline']}")
                used_keys.append("project.deadline")
        
        # User context
        if user_data:
            dn = user_data.get("displayName") or user_data.get("name") or "unknown"
            context_lines.append(f"User: {dn} (id={user_id})")
            used_keys.append("user.displayName")
            
            if user_data.get("role"): 
                context_lines.append(f"Role: {user_data['role']}")
                used_keys.append("user.role")
        
        context_text = "\n".join(context_lines)
        return context_text, used_keys
    
    @staticmethod
    def build_steps_generation_context(user_data: Optional[Dict[str, Any]], 
                                    project_data: Optional[Dict[str, Any]], 
                                    request_params: Dict[str, Any]) -> str:
        """
        Build comprehensive context for step generation
        
        Args:
            user_data: User profile data
            project_data: Project context data
            request_params: Request parameters (project_type, complexity, etc.)
        
        Returns:
            str: Formatted context string
        """
        context_parts = []
        
        # User context
        if user_data:
            user_name = user_data.get("displayName") or user_data.get("name") or "User"
            user_role = user_data.get("role", "")
            context_parts.append(f"User: {user_name} ({user_role})")
        
        # Project context
        if project_data:
            project_name = project_data.get("name") or project_data.get("title") or "Project"
            context_parts.append(f"Project: {project_name}")
            if project_data.get("description"):
                context_parts.append(f"Existing description: {project_data['description']}")
            if project_data.get("deadline"):
                context_parts.append(f"Deadline: {project_data['deadline']}")
        
        # Request parameters
        if request_params.get("project_type"):
            context_parts.append(f"Project type: {request_params['project_type']}")
        if request_params.get("complexity"):
            context_parts.append(f"Complexity: {request_params['complexity']}")
        if request_params.get("timeline"):
            context_parts.append(f"Timeline: {request_params['timeline']}")
        if request_params.get("team_size"):
            context_parts.append(f"Team size: {request_params['team_size']} members")
        
        return "\n".join(context_parts)
    
    @staticmethod
    def build_task_generation_context(request_params: Dict[str, Any]) -> str:
        """
        Build context for task generation
        
        Args:
            request_params: Request parameters
        
        Returns:
            str: Formatted context string
        """
        context_parts = []
        
        if request_params.get("project_type"):
            context_parts.append(f"Project Type: {request_params['project_type']}")
        if request_params.get("complexity"):
            context_parts.append(f"Complexity: {request_params['complexity']}")
        if request_params.get("team_size"):
            context_parts.append(f"Team Size: {request_params['team_size']} members")
        if request_params.get("timeline"):
            context_parts.append(f"Timeline: {request_params['timeline']}")
        
        return "\n".join(context_parts) if context_parts else "General project"
