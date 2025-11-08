import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { MaterialIcon } from "./ui/material-icon";
import { api, type AIResponse, type TaskSuggestion } from "../services/api";

interface ChatPageProps {
  onNavigateBack: () => void;
  onNavigateToKanban: () => void;
  currentUser?: { id: number; email: string; firstName: string; lastName: string };
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
  aiResponse?: AIResponse;
}

export function ChatPage({ onNavigateBack, onNavigateToKanban, currentUser, messages, setMessages }: ChatPageProps) {
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingTasks, setAddingTasks] = useState<Set<number>>(new Set());
  const [addedTasks, setAddedTasks] = useState<Set<number>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Add welcome message from AI assistant when chat loads (only if no messages exist)
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: "welcome",
        text: "👋 Hi! I'm your AI assistant. I can help you turn your ideas into organized tasks for your Kanban board. Just describe your project or idea, and I'll create a structured plan with actionable tasks!",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [messages.length, setMessages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");
    setIsTyping(true);
    setError(null);

    try {
      const aiResponse = await api.generatePlan(currentInput);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse.project_summary || "Here's your project plan with suggested tasks:",
        sender: "ai",
        timestamp: new Date(),
        aiResponse: aiResponse,
      };
      
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("Error calling AI service:", err);
      setError("Sorry, I couldn't process your request. Please try again.");
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I encountered an error while processing your request. Please try again.",
        sender: "ai",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAddTaskToKanban = async (taskSuggestion: TaskSuggestion, taskIndex: number) => {
    if (!currentUser) {
      setError("Please log in to add tasks to your Kanban board");
      return;
    }

    setAddingTasks(prev => new Set(prev).add(taskIndex));

    try {
      await api.createTaskFromSuggestion({
        userId: currentUser.id,
        suggestion: taskSuggestion
      });

      // Mark task as added
      setAddedTasks(prev => new Set(prev).add(taskIndex));

    } catch (err) {
      console.error("Error adding task to Kanban:", err);
      setError("Failed to add task to Kanban board. Please try again.");
    } finally {
      setAddingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskIndex);
        return newSet;
      });
    }
  };

  return (
    <div 
      className="flex flex-col h-screen"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      {/* Header */}
      <header 
        className="flex items-center justify-between gap-4 px-4 py-4"
        style={{ 
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-background-card)'
        }}
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onNavigateBack}
            className="shrink-0"
          >
            <MaterialIcon 
              name="arrow_back"
              size="small"
              style={{ color: 'var(--color-icon-primary)' }}
            />
          </Button>
          <div className="flex items-center gap-3">
            <div 
              className="p-2"
              style={{ 
                backgroundColor: '#FFFFFF',
                borderRadius: '50px',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--color-border)'
              }}
            >
              <MaterialIcon 
                name="smart_toy"
                size="small"
                style={{ color: '#1E4A7B' }}
              />
            </div>
            <div>
              <h2 
                className="text-lg"
                style={{ color: 'var(--color-text-primary)' }}
              >
                SmartBoardAI
              </h2>
              <p 
                className="text-sm"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Your AI task assistant
              </p>
            </div>
          </div>
        </div>
        <Button
          onClick={onNavigateToKanban}
          disabled={!currentUser}
          title={!currentUser ? "Log in to view your board" : undefined}
          className="shrink-0"
          style={{ 
            backgroundColor: 'var(--color-primary)',
            color: 'white'
          }}
          onMouseEnter={(e) => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.backgroundColor = 'var(--color-secondary)';
            }
          }}
          onMouseLeave={(e) => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.backgroundColor = 'var(--color-primary)';
            }
          }}
        >
          <MaterialIcon 
            name="view_kanban"
            size="small"
            className="mr-2"
            style={{ color: 'var(--color-icon-on-dark)' }}
          />
          View Board
        </Button>
      </header>

      {/* Chat Messages Area */}
      <ScrollArea className="flex-1 px-4">
        <div className="max-w-4xl mx-auto py-6 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.sender === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar */}
              <div
                className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: message.sender === "user" 
                    ? 'var(--color-primary)' 
                    : 'var(--color-secondary)',
                  color: 'white'
                }}
              >
                {message.sender === "user" ? (
                  <MaterialIcon 
                    name="person"
                    size="small"
                    style={{ color: 'white' }}
                  />
                ) : (
                  <MaterialIcon 
                    name="smart_toy"
                    size="small"
                    style={{ color: 'white' }}
                  />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`flex flex-col gap-1 max-w-[80%] md:max-w-[70%] ${
                  message.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`px-4 py-3 rounded-2xl ${
                    message.sender === "user"
                      ? "rounded-tr-sm"
                      : "rounded-tl-sm"
                  }`}
                  style={{
                    backgroundColor: message.sender === "user" 
                      ? 'var(--color-primary)' 
                      : 'var(--color-secondary)',
                    color: 'white'
                  }}
                >
                  <p className="break-words">{message.text}</p>
                  
                  {/* Display AI Response with structured plan and tasks */}
                  {message.aiResponse && (
                    <div className="mt-3 space-y-3">
                      {/* Task Suggestions - Compact View */}
                      <div 
                        className="rounded-lg p-3"
                        style={{ backgroundColor: 'var(--color-surface-hover)' }}
                      >
                        <h3 
                          className="font-semibold mb-2 text-sm flex items-center gap-2"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          <MaterialIcon name="task_alt" size="small" style={{ color: 'var(--color-icon-accent)' }} />
                          {message.aiResponse.tasks.length} Tasks Generated
                        </h3>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {message.aiResponse.tasks.slice(0, 5).map((task: any, index: number) => (
                            <div 
                              key={index} 
                              className="rounded p-2 text-xs"
                              style={{ 
                                backgroundColor: 'var(--color-background)',
                                borderLeft: '2px solid var(--color-secondary)'
                              }}
                            >
                              <div className="flex items-start justify-between mb-1">
                                <h4 
                                  className="font-medium text-xs"
                                  style={{ color: 'var(--color-text-primary)' }}
                                >
                                  {task.title}
                                </h4>
                                <span 
                                  className="px-2 py-1 rounded-md text-xs"
                                  style={{
                                    backgroundColor: task.priority === 'HIGH' || task.priority === 'URGENT' 
                                      ? 'var(--color-error)' 
                                      : task.priority === 'MEDIUM'
                                      ? 'var(--color-warning)'
                                      : 'var(--color-success)',
                                    color: task.priority === 'HIGH' || task.priority === 'URGENT' 
                                      ? 'var(--color-text-on-error)' 
                                      : task.priority === 'MEDIUM'
                                      ? 'var(--color-text-on-warning)'
                                      : 'var(--color-text-on-success)',
                                    opacity: '0.9',
                                    borderRadius: '6px'
                                  }}
                                >
                                  {task.priority}
                                </span>
                              </div>
                              <p 
                                className="text-xs mb-2 line-clamp-2"
                                style={{ color: 'var(--color-text-secondary)' }}
                              >
                                {task.description}
                              </p>
                              <div className="flex items-center justify-between">
                                <span 
                                  className="text-xs px-2 py-1 rounded-md"
                                  style={{
                                    backgroundColor: 'var(--color-info)',
                                    color: 'var(--color-text-on-info)',
                                    borderRadius: '6px'
                                  }}
                                >
                                  {task.category}
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAddTaskToKanban(task, index)}
                                  disabled={addingTasks.has(index) || addedTasks.has(index) || !currentUser}
                                  className="text-xs h-6 px-3 rounded-md"
                                  style={{
                                    fontSize: '11px',
                                    borderRadius: '6px',
                                    backgroundColor: addedTasks.has(index) ? 'var(--color-success)' : undefined,
                                    borderColor: addedTasks.has(index) ? 'var(--color-success)' : undefined,
                                    color: addedTasks.has(index) ? '#2C3E50' : undefined,
                                    opacity: addedTasks.has(index) ? 1 : undefined
                                  }}
                                >
                                  {addingTasks.has(index) ? (
                                    <>
                                      <MaterialIcon 
                                        name="refresh"
                                        size={12}
                                        className="mr-1 animate-spin"
                                        style={{ color: '#2C3E50' }}
                                      />
                                      <span style={{ color: '#2C3E50' }}>Adding...</span>
                                    </>
                                  ) : addedTasks.has(index) ? (
                                    <>
                                      <MaterialIcon 
                                        name="check"
                                        size={12}
                                        className="mr-1"
                                        style={{ color: '#2C3E50', opacity: 1 }}
                                      />
                                      <span style={{ color: '#2C3E50', opacity: 1 }}>Added</span>
                                    </>
                                  ) : (
                                    <>
                                      <MaterialIcon 
                                        name="add"
                                        size={12}
                                        className="mr-1"
                                        style={{ color: 'var(--color-icon-secondary)' }}
                                      />
                                      <span>Add to Board</span>
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          ))}
                          {message.aiResponse.tasks.length > 5 && (
                            <div 
                              className="text-center py-2 text-xs"
                              style={{ color: 'var(--color-text-secondary)' }}
                            >
                              + {message.aiResponse.tasks.length - 5} more tasks
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                                <span 
                                  className="text-xs px-2"
                                  style={{ color: 'var(--color-text-secondary)' }}
                                >
                                  {message.timestamp.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3">
              <div className="shrink-0 h-8 w-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                <MaterialIcon 
                  name="smart_toy"
                  size="small"
                  style={{ color: 'var(--color-icon-primary)' }}
                />
              </div>
              <div 
                className="px-4 py-3 rounded-2xl rounded-tl-sm"
                style={{ 
                  backgroundColor: 'var(--color-secondary)',
                  color: 'white'
                }}
              >
                <div className="flex gap-1">
                  <span
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{ 
                      backgroundColor: 'var(--color-text-secondary)',
                      opacity: '0.5',
                      animationDelay: "0ms" 
                    }}
                  ></span>
                  <span
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{ 
                      backgroundColor: 'var(--color-text-secondary)',
                      opacity: '0.5',
                      animationDelay: "150ms" 
                    }}
                  ></span>
                  <span
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{ 
                      backgroundColor: 'var(--color-text-secondary)',
                      opacity: '0.5',
                      animationDelay: "300ms" 
                    }}
                  ></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div 
        className="border-t sticky bottom-0 z-10"
        style={{ 
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-background-card)'
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="relative">
            {/* Custom textarea chat input with vertical button container */}
            <div className="flex border rounded-lg overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
              <textarea
                placeholder="Describe your project or idea..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isTyping}
                className="flex-1 p-4 resize-none outline-none"
                style={{ 
                  backgroundColor: 'var(--color-background-input)',
                  color: 'var(--color-text-primary)',
                  border: 'none',
                  borderRight: 'none',
                  height: '80px',
                  fontSize: '16px',
                  lineHeight: '1.5',
                  resize: 'none'
                }}
                rows={3}
              />
              
              {/* Vertical button container on the right side */}
              <div 
                className="relative flex flex-col items-center p-2" 
                style={{ 
                  backgroundColor: 'var(--color-background-input)', 
                  borderLeft: 'none',
                  width: '40px', 
                  height: '80px' 
                }}
              >
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-primary text-white p-0"
                  style={{ 
                    backgroundColor: 'var(--color-primary)', 
                    color: '#ffffff', 
                    opacity: 1,
                    width: '24px',
                    height: '24px',
                    minWidth: '24px',
                    minHeight: '24px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'absolute',
                    bottom: '8px',
                    left: '50%',
                    transform: 'translateX(-50%)'
                  }}
                >
                  <MaterialIcon name="send" style={{ fontSize: '16px' }} />
                </Button>
              </div>
            </div>
          </div>
          <p 
            className="text-xs mt-2 text-center"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Press Enter to send • AI will generate structured plans and task suggestions
          </p>
        </div>
      </div>
    </div>
  );
}
