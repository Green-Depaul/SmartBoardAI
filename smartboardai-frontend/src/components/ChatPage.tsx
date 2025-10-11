import React, { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ArrowLeft, Send, Bot, User, AlertCircle, Plus } from "lucide-react";
import { aiApi, javaApi, ProjectStep } from "../services/api";
import { Alert, AlertDescription } from "./ui/alert";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  projectSteps?: ProjectStep[];
}

interface ChatPageProps {
  onNavigateBack: () => void;
}

export function ChatPage({ onNavigateBack }: ChatPageProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm SmartBoardAI. I can help you turn your ideas into organized task plans. What would you like to work on today?",
      sender: "ai",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleGenerateSteps = async (projectDescription: string) => {
    try {
      setError(null);
      
      const response = await aiApi.generateSteps({
        user_id: "demo-user",
        project_id: "demo-project",
        project_description: projectDescription,
        complexity: "medium",
        temperature: 0.7,
      });

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `I've generated ${response.project_steps.length} detailed steps for your project:\n\n${response.project_summary}`,
        sender: "ai",
        timestamp: new Date(),
        projectSteps: response.project_steps,
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (err) {
      console.error("Failed to generate project steps:", err);
      setError("Failed to generate project steps. Please try again.");
    }
  };

  const handleImportTasks = async (projectSteps: ProjectStep[]) => {
    try {
      setError(null);
      
      // Get or create a default board
      const boards = await javaApi.getBoards();
      let boardId: string;
      
      if (boards.length === 0) {
        const newBoard = await javaApi.createBoard({
          title: "AI Generated Tasks",
          description: "Tasks imported from AI chat",
          userId: "demo-user",
        });
        boardId = newBoard.id;
      } else {
        boardId = boards[0].id;
      }

      // Create tasks for each project step
      const createdTasks = [];
      for (const step of projectSteps) {
        const task = await javaApi.createTask({
          title: step.title,
          description: step.description,
          status: "TODO",
          priority: step.priority.toUpperCase() as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
          boardId: boardId,
          dueDate: step.estimated_duration ? undefined : undefined, // Could parse duration to actual date
        });
        createdTasks.push(task);
      }

      const importMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `✅ Successfully imported ${createdTasks.length} tasks to your board! You can view them by clicking "View Board".`,
        sender: "ai",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, importMessage]);
    } catch (err) {
      console.error("Failed to import tasks:", err);
      setError("Failed to import tasks to board. Please try again.");
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);
    setError(null);

    try {
      // Check if the message looks like a project description
      const isProjectDescription = userMessage.content.length > 50 && 
        (userMessage.content.toLowerCase().includes('project') || 
         userMessage.content.toLowerCase().includes('build') ||
         userMessage.content.toLowerCase().includes('create') ||
         userMessage.content.toLowerCase().includes('develop'));

      if (isProjectDescription) {
        // Generate project steps for longer, project-like descriptions
        await handleGenerateSteps(userMessage.content);
      } else {
        // Regular AI chat for shorter messages
        const response = await aiApi.prompt({
          user_id: "demo-user",
          project_id: "demo-project",
          message: userMessage.content,
          temperature: 0.7,
          max_tokens: 512,
        });

        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: response.output,
          sender: "ai",
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiResponse]);
      }
    } catch (err) {
      console.error("Failed to get AI response:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to get AI response";
      
      // Show user-friendly error message
      if (errorMessage.includes("Failed to fetch") || errorMessage.includes("NetworkError")) {
        setError("Couldn't connect to AI service—please check if the backend is running and try again.");
      } else if (errorMessage.includes("504")) {
        setError("AI service is taking too long to respond—please try again.");
      } else if (errorMessage.includes("429")) {
        setError("Too many requests—please wait a moment and try again.");
      } else {
        setError(`AI service error: ${errorMessage}`);
      }

      // Add error message to chat
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble connecting right now. Please make sure the AI service is running and try again.",
        sender: "ai",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-card px-4 py-3 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onNavigateBack}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-medium">SmartBoardAI Chat</h1>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="px-4 py-2">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex w-full mb-6 ${message.sender === "user" ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 ${
                message.sender === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
              style={{
                borderRadius: message.sender === "user" 
                  ? "20px 20px 20px 5px" 
                  : "20px 20px 5px 20px"
              }}
            >
              <div className="flex items-start gap-2">
                {message.sender === "ai" && (
                  <Bot className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                )}
                {message.sender === "user" && (
                  <User className="h-4 w-4 mt-0.5 text-primary-foreground shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  {message.projectSteps && message.projectSteps.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Generated Tasks:</p>
                      {message.projectSteps.slice(0, 3).map((step, index) => (
                        <div key={index} className="text-xs bg-muted/50 p-2 rounded border-l-2 border-primary/50">
                          <div className="font-medium">{step.title}</div>
                          <div className="text-muted-foreground mt-1">{step.description}</div>
                          <div className="flex gap-2 mt-1">
                            <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                              {step.priority}
                            </span>
                            {step.estimated_duration && (
                              <span className="text-xs bg-gray-100 text-gray-800 px-1 rounded">
                                {step.estimated_duration}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                      {message.projectSteps.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          ... and {message.projectSteps.length - 3} more tasks
                        </p>
                      )}
                      <Button
                        size="sm"
                        onClick={() => handleImportTasks(message.projectSteps!)}
                        className="mt-2"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Import All Tasks to Board
                      </Button>
                    </div>
                  )}
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex w-full justify-end">
            <div 
              className="bg-muted text-muted-foreground px-4 py-3 max-w-[80%]"
              style={{ borderRadius: "20px 20px 5px 20px" }}
            >
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary shrink-0" />
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t bg-card px-4 py-4">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here..."
            className="flex-1"
            disabled={isTyping}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            size="icon"
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
