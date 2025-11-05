package ai.smartboard.smartboard_api.service;

import ai.smartboard.smartboard_api.model.AIResponse;
import ai.smartboard.smartboard_api.model.TaskPriority;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class AIService {

    public AIResponse generateProjectPlan(String userInput) {
        // Parse the user input to understand the project type
        String projectType = determineProjectType(userInput);
        
        // Generate a structured plan based on the project type
        String plan = generateStructuredPlan(userInput, projectType);
        
        // Generate task suggestions
        List<AIResponse.TaskSuggestion> tasks = generateTaskSuggestions(userInput, projectType);
        
        // Create response message
        String message = String.format(
            "Great! I've analyzed your project: \"%s\" and created a structured plan for you. " +
            "Here's how I recommend breaking it down into manageable tasks:",
            userInput.length() > 100 ? userInput.substring(0, 100) + "..." : userInput
        );

        return new AIResponse(message, tasks, plan);
    }

    private String determineProjectType(String input) {
        String lowerInput = input.toLowerCase();
        
        if (lowerInput.contains("website") || lowerInput.contains("web app") || lowerInput.contains("frontend")) {
            return "web_development";
        } else if (lowerInput.contains("mobile") || lowerInput.contains("app") || lowerInput.contains("ios") || lowerInput.contains("android")) {
            return "mobile_development";
        } else if (lowerInput.contains("backend") || lowerInput.contains("api") || lowerInput.contains("database")) {
            return "backend_development";
        } else if (lowerInput.contains("design") || lowerInput.contains("ui") || lowerInput.contains("ux")) {
            return "design";
        } else if (lowerInput.contains("marketing") || lowerInput.contains("campaign") || lowerInput.contains("social media")) {
            return "marketing";
        } else if (lowerInput.contains("business") || lowerInput.contains("startup") || lowerInput.contains("company")) {
            return "business";
        } else {
            return "general";
        }
    }

    private String generateStructuredPlan(String input, String projectType) {
        StringBuilder plan = new StringBuilder();
        
        switch (projectType) {
            case "web_development":
                plan.append("🌐 Web Development Project Plan\n\n");
                plan.append("Phase 1: Planning & Setup (Week 1-2)\n");
                plan.append("• Define requirements and user stories\n");
                plan.append("• Set up development environment\n");
                plan.append("• Create project structure and repository\n\n");
                plan.append("Phase 2: Design & Prototyping (Week 2-3)\n");
                plan.append("• Create wireframes and mockups\n");
                plan.append("• Design user interface components\n");
                plan.append("• Plan responsive design strategy\n\n");
                plan.append("Phase 3: Development (Week 3-8)\n");
                plan.append("• Implement frontend components\n");
                plan.append("• Develop backend functionality\n");
                plan.append("• Integrate third-party services\n\n");
                plan.append("Phase 4: Testing & Deployment (Week 8-10)\n");
                plan.append("• Conduct thorough testing\n");
                plan.append("• Deploy to production environment\n");
                plan.append("• Monitor and optimize performance\n");
                break;
                
            case "mobile_development":
                plan.append("📱 Mobile App Development Plan\n\n");
                plan.append("Phase 1: Research & Planning (Week 1-2)\n");
                plan.append("• Market research and competitor analysis\n");
                plan.append("• Define app features and user flow\n");
                plan.append("• Choose technology stack and platform\n\n");
                plan.append("Phase 2: Design & Prototyping (Week 2-4)\n");
                plan.append("• Create app wireframes and user interface\n");
                plan.append("• Design user experience flow\n");
                plan.append("• Create interactive prototypes\n\n");
                plan.append("Phase 3: Development (Week 4-12)\n");
                plan.append("• Implement core app functionality\n");
                plan.append("• Integrate APIs and backend services\n");
                plan.append("• Implement user authentication\n\n");
                plan.append("Phase 4: Testing & Launch (Week 12-16)\n");
                plan.append("• Beta testing with real users\n");
                plan.append("• App store submission and approval\n");
                plan.append("• Launch and marketing campaign\n");
                break;
                
            case "backend_development":
                plan.append("⚙️ Backend Development Plan\n\n");
                plan.append("Phase 1: Architecture & Setup (Week 1-2)\n");
                plan.append("• Design system architecture\n");
                plan.append("• Set up development environment\n");
                plan.append("• Choose database and frameworks\n\n");
                plan.append("Phase 2: Core Development (Week 2-6)\n");
                plan.append("• Implement core business logic\n");
                plan.append("• Develop API endpoints\n");
                plan.append("• Set up authentication and authorization\n\n");
                plan.append("Phase 3: Integration & Testing (Week 6-8)\n");
                plan.append("• Integrate with external services\n");
                plan.append("• Implement comprehensive testing\n");
                plan.append("• Performance optimization\n\n");
                plan.append("Phase 4: Deployment & Monitoring (Week 8-10)\n");
                plan.append("• Deploy to production servers\n");
                plan.append("• Set up monitoring and logging\n");
                plan.append("• Documentation and handover\n");
                break;
                
            case "design":
                plan.append("🎨 Design Project Plan\n\n");
                plan.append("Phase 1: Discovery & Research (Week 1-2)\n");
                plan.append("• Understand client requirements\n");
                plan.append("• Research target audience\n");
                plan.append("• Analyze competitors and trends\n\n");
                plan.append("Phase 2: Concept & Ideation (Week 2-3)\n");
                plan.append("• Brainstorm design concepts\n");
                plan.append("• Create initial sketches and ideas\n");
                plan.append("• Present concepts to stakeholders\n\n");
                plan.append("Phase 3: Design Development (Week 3-6)\n");
                plan.append("• Create detailed designs\n");
                plan.append("• Develop design system and guidelines\n");
                plan.append("• Create interactive prototypes\n\n");
                plan.append("Phase 4: Refinement & Delivery (Week 6-8)\n");
                plan.append("• Incorporate feedback and revisions\n");
                plan.append("• Prepare final deliverables\n");
                plan.append("• Create style guides and documentation\n");
                break;
                
            default:
                plan.append("📋 General Project Plan\n\n");
                plan.append("Phase 1: Planning & Preparation (Week 1-2)\n");
                plan.append("• Define project scope and objectives\n");
                plan.append("• Gather requirements and resources\n");
                plan.append("• Create project timeline and milestones\n\n");
                plan.append("Phase 2: Development & Implementation (Week 2-8)\n");
                plan.append("• Execute core project tasks\n");
                plan.append("• Regular progress reviews and adjustments\n");
                plan.append("• Maintain quality standards\n\n");
                plan.append("Phase 3: Review & Refinement (Week 8-10)\n");
                plan.append("• Test and validate results\n");
                plan.append("• Gather feedback and make improvements\n");
                plan.append("• Prepare for project completion\n\n");
                plan.append("Phase 4: Completion & Handover (Week 10-12)\n");
                plan.append("• Finalize all deliverables\n");
                plan.append("• Document lessons learned\n");
                plan.append("• Plan for ongoing maintenance\n");
                break;
        }
        
        return plan.toString();
    }

    private List<AIResponse.TaskSuggestion> generateTaskSuggestions(String input, String projectType) {
        List<AIResponse.TaskSuggestion> tasks = new ArrayList<>();
        
        switch (projectType) {
            case "web_development":
                tasks.add(new AIResponse.TaskSuggestion(
                    "Set up development environment",
                    "Install and configure development tools, frameworks, and dependencies",
                    TaskPriority.HIGH, 4, "Setup"
                ));
                tasks.add(new AIResponse.TaskSuggestion(
                    "Create project wireframes",
                    "Design the basic structure and layout of the website",
                    TaskPriority.HIGH, 8, "Design"
                ));
                tasks.add(new AIResponse.TaskSuggestion(
                    "Implement responsive design",
                    "Ensure the website works well on all device sizes",
                    TaskPriority.MEDIUM, 12, "Frontend"
                ));
                tasks.add(new AIResponse.TaskSuggestion(
                    "Set up backend API",
                    "Create REST API endpoints for data management",
                    TaskPriority.HIGH, 16, "Backend"
                ));
                tasks.add(new AIResponse.TaskSuggestion(
                    "Implement user authentication",
                    "Add login, registration, and session management",
                    TaskPriority.MEDIUM, 10, "Security"
                ));
                tasks.add(new AIResponse.TaskSuggestion(
                    "Database design and setup",
                    "Design database schema and set up data storage",
                    TaskPriority.HIGH, 8, "Database"
                ));
                tasks.add(new AIResponse.TaskSuggestion(
                    "Testing and quality assurance",
                    "Write unit tests and perform integration testing",
                    TaskPriority.MEDIUM, 14, "Testing"
                ));
                tasks.add(new AIResponse.TaskSuggestion(
                    "Deployment and hosting setup",
                    "Deploy the application to production environment",
                    TaskPriority.MEDIUM, 6, "Deployment"
                ));
                break;
                
            case "mobile_development":
                tasks.add(new AIResponse.TaskSuggestion(
                    "Market research and analysis",
                    "Research target audience and competitor apps",
                    TaskPriority.HIGH, 8, "Research"
                ));
                tasks.add(new AIResponse.TaskSuggestion(
                    "App wireframing and prototyping",
                    "Create wireframes and interactive prototypes",
                    TaskPriority.HIGH, 12, "Design"
                ));
                tasks.add(new AIResponse.TaskSuggestion(
                    "Set up development environment",
                    "Install SDK, IDE, and necessary development tools",
                    TaskPriority.HIGH, 4, "Setup"
                ));
                tasks.add(new AIResponse.TaskSuggestion(
                    "Implement core app features",
                    "Develop the main functionality of the application",
                    TaskPriority.HIGH, 24, "Development"
                ));
                tasks.add(new AIResponse.TaskSuggestion(
                    "Integrate backend services",
                    "Connect app to APIs and backend systems",
                    TaskPriority.MEDIUM, 16, "Integration"
                ));
                tasks.add(new AIResponse.TaskSuggestion(
                    "User interface implementation",
                    "Create polished UI components and animations",
                    TaskPriority.MEDIUM, 20, "UI/UX"
                ));
                tasks.add(new AIResponse.TaskSuggestion(
                    "Beta testing and feedback",
                    "Conduct user testing and gather feedback",
                    TaskPriority.MEDIUM, 10, "Testing"
                ));
                tasks.add(new AIResponse.TaskSuggestion(
                    "App store submission",
                    "Prepare and submit app for store approval",
                    TaskPriority.MEDIUM, 8, "Launch"
                ));
                break;
                
            default:
                tasks.add(new AIResponse.TaskSuggestion(
                    "Project planning and scope definition",
                    "Define project goals, requirements, and success criteria",
                    TaskPriority.HIGH, 8, "Planning"
                ));
                tasks.add(new AIResponse.TaskSuggestion(
                    "Resource allocation and team setup",
                    "Assign team members and allocate necessary resources",
                    TaskPriority.HIGH, 4, "Management"
                ));
                tasks.add(new AIResponse.TaskSuggestion(
                    "Initial research and analysis",
                    "Conduct research to understand requirements and constraints",
                    TaskPriority.MEDIUM, 12, "Research"
                ));
                tasks.add(new AIResponse.TaskSuggestion(
                    "Core implementation",
                    "Execute the main project deliverables",
                    TaskPriority.HIGH, 32, "Development"
                ));
                tasks.add(new AIResponse.TaskSuggestion(
                    "Quality assurance and testing",
                    "Test deliverables and ensure quality standards",
                    TaskPriority.MEDIUM, 16, "Testing"
                ));
                tasks.add(new AIResponse.TaskSuggestion(
                    "Documentation and handover",
                    "Create documentation and prepare for project completion",
                    TaskPriority.MEDIUM, 8, "Documentation"
                ));
                break;
        }
        
        return tasks;
    }
}




