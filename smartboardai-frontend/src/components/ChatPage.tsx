import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { ArrowLeft, Send, Bot, User, LayoutGrid, CheckCircle, Clock, AlertCircle, Plus } from "lucide-react";
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

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
        text: aiResponse.message,
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
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

      // Show success message
      const successMessage: Message = {
        id: `success-${Date.now()}`,
        text: `✅ Added "${taskSuggestion.title}" to your Kanban board!`,
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, successMessage]);

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
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between gap-4 px-4 py-4 border-b bg-card">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onNavigateBack}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg">Smart Board AI</h2>
              <p className="text-sm text-muted-foreground">
                Your AI task assistant
              </p>
            </div>
          </div>
        </div>
        <Button
          onClick={onNavigateToKanban}
          className="shrink-0 bg-[#2563eb] hover:bg-[#1e40af]"
        >
          <LayoutGrid className="h-4 w-4 mr-2" />
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
                className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {message.sender === "user" ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
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
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-secondary text-secondary-foreground rounded-tl-sm"
                  }`}
                >
                  <p className="break-words">{message.text}</p>
                  
                  {/* Display AI Response with structured plan and tasks */}
                  {message.aiResponse && (
                    <div className="mt-4 space-y-4">
                      {/* Structured Plan */}
                      <div className="bg-white/10 rounded-lg p-4">
                        <h3 className="font-semibold mb-2 text-sm">📋 Structured Plan</h3>
                        <pre className="text-xs whitespace-pre-wrap font-mono leading-relaxed">
                          {message.aiResponse.plan}
                        </pre>
                      </div>
                      
                      {/* Task Suggestions */}
                      <div className="bg-white/10 rounded-lg p-4">
                        <h3 className="font-semibold mb-3 text-sm">✅ Suggested Tasks</h3>
                        <div className="space-y-2">
                          {message.aiResponse.suggestedTasks.map((task, index) => (
                            <div key={index} className="bg-white/5 rounded p-3 border-l-2 border-blue-400">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-medium text-sm">{task.title}</h4>
                                <div className="flex items-center gap-2 text-xs">
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    task.priority === 'HIGH' || task.priority === 'URGENT' 
                                      ? 'bg-red-500/20 text-red-300' 
                                      : task.priority === 'MEDIUM'
                                      ? 'bg-yellow-500/20 text-yellow-300'
                                      : 'bg-green-500/20 text-green-300'
                                  }`}>
                                    {task.priority}
                                  </span>
                                  <span className="text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {task.estimatedHours}h
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground mb-2">{task.description}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                                  {task.category}
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAddTaskToKanban(task, index)}
                                  disabled={addingTasks.has(index) || !currentUser}
                                  className="text-xs h-6 px-2"
                                >
                                  {addingTasks.has(index) ? (
                                    <>
                                      <Clock className="h-3 w-3 mr-1 animate-spin" />
                                      Adding...
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="h-3 w-3 mr-1" />
                                      Add to Kanban
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-xs text-muted-foreground px-2">
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
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-secondary text-secondary-foreground px-4 py-3 rounded-2xl rounded-tl-sm">
                <div className="flex gap-1">
                  <span
                    className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></span>
                  <span
                    className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></span>
                  <span
                    className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Describe your project or idea..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isTyping}
              className="flex-1 bg-input-background border-border"
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
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Press Enter to send • AI will generate structured plans and task suggestions
          </p>
        </div>
      </div>
    </div>
  );
}
