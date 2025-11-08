import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter, DialogClose } from "./ui/dialog";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { MaterialIcon } from "./ui/material-icon";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "./ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import { api, type Task as APITask, type AIResponse } from "../services/api";

interface KanbanBoardProps {
  onNavigateBack: () => void;
  onLogout?: () => void;
  currentUser?: { id: number; email: string; firstName: string; lastName: string };
}

export type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  estimatedHours?: number;
  createdAt?: string;
}

const columns: { id: TaskStatus; title: string; color: string; gradient: string }[] = [
  { 
    id: "TODO", 
    title: "To Do", 
    color: "kanban-column-todo",
    gradient: "bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-l-info"
  },
  { 
    id: "IN_PROGRESS", 
    title: "In Progress", 
    color: "kanban-column-progress",
    gradient: "bg-gradient-to-br from-blue-50 to-blue-200 border-l-4 border-l-secondary"
  },
  { 
    id: "IN_REVIEW", 
    title: "In Review", 
    color: "kanban-column-review",
    gradient: "bg-gradient-to-br from-amber-50 to-amber-100 border-l-4 border-l-warning"
  },
  { 
    id: "DONE", 
    title: "Done", 
    color: "kanban-column-done",
    gradient: "bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-l-success"
  },
];

const ITEM_TYPE = "TASK";

function MenuButton({ task, onEdit, onDelete }: { task: Task; onEdit?: (id: string) => void; onDelete?: (id: string) => void; }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <button
          type="button"
          className={"inline-flex items-center justify-center h-6 w-6 p-0 rounded-md hover:bg-accent"}
          onClick={(e) => e.stopPropagation()}
          aria-label="More"
        >
          <MaterialIcon 
            name="more_horiz"
            size={12}
            style={{ color: 'var(--color-icon-secondary)' }}
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem onSelect={() => onEdit && onEdit(task.id)}>Edit</DropdownMenuItem>
        <DropdownMenuItem data-variant="destructive" onSelect={() => onDelete && onDelete(task.id)}>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Convert API task to local task format
const convertAPITaskToLocal = (apiTask: APITask): Task => ({
  id: apiTask.id,
  title: apiTask.title,
  description: apiTask.description ?? undefined,
  status: apiTask.status as TaskStatus,
  priority: apiTask.priority,
  estimatedHours: apiTask.estimatedHours,
  createdAt: apiTask.createdAt ?? undefined,
});

const getPriorityColor = (priority?: string) => {
  switch (priority) {
    case "URGENT":
      return "var(--color-error)";
    case "HIGH":
      return "var(--color-warning)";
    case "MEDIUM":
      return "var(--color-warning)";
    case "LOW":
      return "var(--color-success)";
    default:
      return "var(--color-warning)";
  }
};

const getPriorityTextColor = (priority?: string) => {
  switch (priority) {
    case "URGENT":
      return "var(--color-text-on-error)"; // Text-Inverse for error backgrounds
    case "HIGH":
      return "var(--color-text-on-warning)"; // Text-Secondary for warning backgrounds
    case "MEDIUM":
      return "var(--color-text-on-warning)"; // Text-Secondary for warning backgrounds
    case "LOW":
      return "var(--color-text-on-success)"; // Text-Secondary for success backgrounds
    default:
      return "var(--color-text-on-warning)"; // Text-Secondary for warning backgrounds
  }
};

const getPriorityLabel = (priority?: string) => {
  switch (priority) {
    case "URGENT":
      return "Urgent";
    case "HIGH":
      return "High";
    case "MEDIUM":
      return "Medium";
    case "LOW":
      return "Low";
    default:
      return "Medium";
  }
};

interface TaskCardProps {
  task: Task;
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
  onEditTask?: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
}

function TaskCard({ task, onMoveTask, onEditTask, onDeleteTask }: TaskCardProps) {
  const [{ isDragging }, drag, dragPreview] = useDrag(() => ({
    type: ITEM_TYPE,
    item: { id: task.id, status: task.status },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={(node) => {
        // make the whole card draggable and use the drag preview for the visual
        drag(node as unknown as Element);
        dragPreview(node as unknown as Element);
      }}
      className={`mb-3 transition-all duration-200 ${
        isDragging 
          ? "opacity-50 transform rotate-2 scale-105 z-50" 
          : "hover:scale-[1.02] hover:shadow-lg"
      }`}
    >
      <Card 
        className="p-3 transition-all duration-200 relative overflow-hidden border cursor-grab active:cursor-grabbing hover:shadow-lg rounded-lg"
        style={{ 
          backgroundColor: isDragging ? '#EBF8FF' : 'var(--color-surface)',
          borderColor: isDragging ? 'var(--color-secondary)' : 'var(--color-border)',
          boxShadow: isDragging ? 'var(--shadow-xl)' : undefined,
          borderRadius: '8px'
        }}
        onMouseEnter={(e) => {
          if (!isDragging) {
            e.currentTarget.style.backgroundColor = 'var(--color-background-hover)';
            e.currentTarget.style.borderColor = 'var(--color-primary)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isDragging) {
            e.currentTarget.style.backgroundColor = 'var(--color-surface)';
            e.currentTarget.style.borderColor = 'var(--color-border)';
          }
        }}
      >
        {/* Priority indicator bar */}
        <div 
          className="absolute left-0 top-0 h-full transition-all duration-300"
          style={{
            width: isDragging ? '8px' : '4px',
            backgroundColor: 
              task.priority === 'URGENT' ? 'var(--color-error)' :
              task.priority === 'HIGH' ? 'var(--color-warning)' :
              task.priority === 'MEDIUM' ? 'var(--color-warning)' :
              'var(--color-success)'
          }}
        />

        <div className="flex items-start justify-between mb-2">
          <h4 
            className="font-medium leading-tight flex-1 pr-2"
            style={{ color: 'var(--color-text)' }}
          >
            {task.title}
          </h4>
          <div className="flex items-center gap-1">
            {/* Controlled context menu so it opens on left-click (not just right-click) */}
            <MenuButton task={task} onEdit={onEditTask} onDelete={onDeleteTask} />
          </div>
        </div>
        
        {task.description && (
          <p 
            className="text-sm mb-3 line-clamp-2 leading-relaxed"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {task.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <Badge
            className="text-xs transition-all duration-200"
            style={{ 
              backgroundColor: getPriorityColor(task.priority),
              color: getPriorityTextColor(task.priority)
            }}
          >
            {getPriorityLabel(task.priority)}
          </Badge>
          
          <div 
            className="flex items-center gap-2 text-sm"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {task.estimatedHours && (
              <div className="flex items-center">
                <MaterialIcon 
                  name="schedule"
                  size={12}
                  className="mr-1"
                  style={{ color: 'var(--color-icon-secondary)' }}
                />
                {task.estimatedHours}h
              </div>
            )}
            {/* Friendly label: show created date or assignee (assignee can be wired in by backend) */}
            <div className="text-xs opacity-60">
              {(() => {
                const assignee = (task as any).assignee;
                if (assignee) {
                  // try common name fields
                  return assignee.name || `${assignee.firstName || ''} ${assignee.lastName || ''}`.trim() || assignee.email || 'Assigned';
                }
                if (task.createdAt) {
                  try {
                    const d = new Date(task.createdAt);
                    return `Created ${d.toLocaleDateString()}`;
                  } catch {
                    return 'Created';
                  }
                }
                return '';
              })()}
            </div>
          </div>
        </div>

        {/* Drag overlay indicator */}
        {isDragging && (
          <div 
            className="absolute inset-0 border-2 border-dashed rounded-md flex items-center justify-center"
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.1)', // var(--color-info) with opacity
              borderColor: 'var(--color-info)'
            }}
          >
            <span 
              className="font-medium text-xs"
              style={{ color: 'var(--color-info)' }}
            >
              Dragging...
            </span>
          </div>
        )}
      </Card>
    </div>
  );
}

interface TaskColumnProps {
  column: { id: TaskStatus; title: string; color: string };
  tasks: Task[];
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
  onEditTask?: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
}

function TaskColumn({ column, tasks, onMoveTask, onEditTask, onDeleteTask }: TaskColumnProps) {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ITEM_TYPE,
    drop: (item: { id: string; status: TaskStatus }, monitor) => {
      console.log("🎯 Drop event triggered:", { item, targetColumn: column.id });
      if (item.status !== column.id) {
        console.log("✅ Status change needed, calling onMoveTask...");
        onMoveTask(item.id, column.id);
        return { moved: true, from: item.status, to: column.id };
      } else {
        console.log("ℹ️ Same status, no action needed");
        return { moved: false };
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }));

  const getColumnColor = (status: TaskStatus) => {
    switch (status) {
      case 'TODO': return '#E3F2FD';      // Light blue
      case 'IN_PROGRESS': return '#FFF3E0'; // Light orange
      case 'IN_REVIEW': return '#F3E5F5';   // Light purple
      case 'DONE': return '#E8F5E8';        // Light green
      default: return 'var(--color-surface)';
    }
  };

  return (
    <div
      ref={drop}
      className={`flex-1 min-w-64 transition-all duration-300 ${
        isOver && canDrop 
          ? "scale-105 shadow-xl" 
          : isOver 
          ? "scale-102" 
          : ""
      }`}
    >
      <div 
        className="rounded-lg shadow-sm border transition-all duration-300"
        style={{ 
          backgroundColor: 'var(--color-surface)',
          borderColor: isOver && canDrop ? 'var(--color-success)' : 'var(--color-border)'
        }}
      >
        <div 
          className="p-4 rounded-t-lg relative overflow-hidden"
          style={{ backgroundColor: getColumnColor(column.id) }}
        >
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--color-primary)' }}>
                {column.title}
              </h3>
            </div>
            <Badge 
              className="font-semibold shadow-sm"
              style={{ 
                backgroundColor: 'var(--color-primary)', 
                color: 'white'
              }}
            >
              {tasks.length}
            </Badge>
          </div>
        </div>
        
        <ScrollArea className="h-96 p-3 relative">
          {/* Drop zone indicator */}
          {isOver && canDrop && (
            <div 
              className="absolute inset-2 border-2 border-dashed rounded-md flex items-center justify-center z-40 animate-pulse"
              style={{ 
                borderColor: 'var(--color-success)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)'
              }}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">✨</div>
                <p className="font-medium text-sm" style={{ color: 'var(--color-success)' }}>Drop here!</p>
              </div>
            </div>
          )}
          
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onMoveTask={onMoveTask} onEditTask={onEditTask} onDeleteTask={onDeleteTask} />
          ))}
          
          {tasks.length === 0 && !isOver && (
            <div className="text-center py-12" style={{ color: 'var(--color-text-muted)' }}>
              <p className="text-sm font-medium">No {column.title.toLowerCase()} tasks</p>
              <p className="text-xs mt-1 opacity-75">
                Drag tasks here from other columns
              </p>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}

export function KanbanBoard({ onNavigateBack, onLogout, currentUser }: KanbanBoardProps) {

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  
  // AI Chat related state
  const [aiMessages, setAiMessages] = useState<any[]>([]);
  const [aiIsTyping, setAiIsTyping] = useState(false);
  const aiInputRef = useRef<HTMLInputElement>(null);
  
  // Notifications (toasts) removed from UI. Keep a logger function so existing calls remain safe.
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    // Previously this displayed an on-screen toast. Now we just log for debugging.
    console.log(`[notification:${type}] ${message}`);
  };

  const fetchTasks = async () => {
    // For development, provide a default user if no currentUser is available
    const userToUse = currentUser || { id: 1, email: 'dev@test.com', firstName: 'Dev', lastName: 'User' };
    console.log('Fetching tasks for user:', userToUse);

    try {
      setLoading(true);
      const apiTasks = await api.getTasks(userToUse.id);
      const localTasks = apiTasks.map(convertAPITaskToLocal);
      setTasks(localTasks);
      setError(null);
      showNotification(`Loaded ${localTasks.length} tasks successfully! 🎯`, 'success');
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Failed to load tasks. Please try again.");
      showNotification("Failed to load tasks", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData: {
    title: string;
    description?: string;
    priority?: string;
  }) => {
    try {
      const newTask = await api.createTask(taskData);
      const localTask = convertAPITaskToLocal(newTask);
      setTasks(prev => [...prev, localTask]);
      setShowAddTask(false);
      showNotification(`Task "${taskData.title}" created! 🎉`, 'success');
    } catch (err) {
      console.error("Error creating task:", err);
      showNotification("Failed to create task", 'error');
    }
  };

  useEffect(() => {
    fetchTasks();
    console.log('🧩 KanbanBoard component mounted (dev indicator)');
  }, [currentUser]);

  const handleMoveTask = async (taskId: string, newStatus: TaskStatus) => {
    console.log("🎯 handleMoveTask called:", { taskId, newStatus });
    
    // Find the task being moved for better logging
    const taskToMove = tasks.find(t => t.id === taskId);
    console.log("📋 Moving task:", taskToMove?.title, "from", taskToMove?.status, "to", newStatus);
    
    // Optimistic update - update UI immediately for better UX
    const originalTasks = tasks;
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
    
    try {
      console.log("🔄 Calling API to update task status...");
      const updatedTask = await api.updateTaskStatus(taskId, newStatus);
      console.log("✅ API call successful:", updatedTask);
      
      // Update with the actual response from server
      const localUpdatedTask = convertAPITaskToLocal(updatedTask);
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? localUpdatedTask : task
        )
      );
      
      // Clear any previous errors
      setError(null);
      showNotification(`Task moved to ${newStatus.replace('_', ' ')}! 🎯`, 'success');
      console.log("🎉 Task moved successfully!");
      
    } catch (err) {
      console.error("❌ Error updating task status:", err);
      
      // Revert optimistic update on error
      setTasks(originalTasks);
      
      // Show user-friendly error message
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setError(`Failed to move task: ${errorMessage}`);
      showNotification("Failed to move task - reverted", 'error');
      
      console.log("🔄 Reverted to original state due to API error");
    }
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  };

  const handleDeleteTask = async (taskId: string) => {
    console.log('handleDeleteTask called with taskId:', taskId);
    try {
      showNotification('Deleting task...', 'info');
      console.log('Making API call to delete task:', taskId);
      const result = await api.deleteTask(taskId);
      console.log('API call successful, result:', result, 'updating local state');
      setTasks(prev => prev.filter(t => t.id !== taskId));
      showNotification('Task deleted', 'success');
    } catch (err) {
      console.error('Error deleting task:', err);
      console.error('Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : 'No stack trace',
        taskId: taskId
      });
      showNotification(`Failed to delete task: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
    }
  };
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingForm, setEditingForm] = useState<{
    title: string;
    description: string;
    priority?: string;
  }>({ title: '', description: '', priority: 'MEDIUM' });
  const editTitleRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (showEditModal) {
      // Focus the title input when the modal opens for quicker editing
      setTimeout(() => editTitleRef.current?.focus(), 50);
    }
  }, [showEditModal]);

  // Use the shared Dialog component from `src/components/ui/dialog.tsx` instead of a
  // custom ModalWrapper. The Radix-based Dialog handles portals, overlay, focus trap
  // and animations consistently across the app.

  const handleEditTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    setEditingTaskId(taskId);
    setEditingForm({
      title: task.title || '',
      description: task.description || '',
      priority: (task.priority as string) || 'MEDIUM',
    });
    setShowEditModal(true);
  };

  const submitEditTask = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    console.log('submitEditTask called with editingTaskId:', editingTaskId);
    if (!editingTaskId) return;

    const payload: Partial<APITask> = {
      title: editingForm.title,
      description: editingForm.description,
      // If you want to persist priority too, include it here
      priority: editingForm.priority as any,
    };

    console.log('Submitting edit with payload:', payload);

    const originalTasks = tasks;
    // Optimistic UI update
    setTasks(prev => prev.map(t => t.id === editingTaskId ? { ...t, title: editingForm.title, description: editingForm.description, priority: editingForm.priority as any } : t));

    try {
      showNotification('Saving changes...', 'info');
      console.log('Making API call to update task:', editingTaskId);
      const updated = await api.updateTask(editingTaskId, payload);
      console.log('API call successful, updated task:', updated);
      const localUpdated = convertAPITaskToLocal(updated);
      setTasks(prev => prev.map(t => t.id === editingTaskId ? localUpdated : t));
      showNotification('Task updated', 'success');
      setShowEditModal(false);
      setEditingTaskId(null);
    } catch (err) {
      console.error('Error updating task:', err);
      console.error('Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : 'No stack trace',
        taskId: editingTaskId,
        payload: payload
      });
      // Revert optimistic update
      setTasks(originalTasks);
      showNotification(`Failed to update task: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
    }
  };

  // AI Chat handlers
  const handleAISendMessage = async () => {
    if (!aiInputRef.current?.value.trim() || aiIsTyping) return;

    const userMessage = aiInputRef.current.value.trim();
    aiInputRef.current.value = '';

    // Add user message to chat
    setAiMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setAiIsTyping(true);

    try {
      // Call AI API
      const response = await api.generatePlan(userMessage);
      
      if (response.success) {
        // Automatically add all tasks to the kanban board
        if (response.tasks && response.tasks.length > 0) {
          let addedTasksCount = 0;
          
          for (const aiTask of response.tasks) {
            try {
              const newTask = await api.createTask({
                title: aiTask.title,
                description: aiTask.description,
                priority: aiTask.priority || 'MEDIUM'
              });
              
              const localNewTask = convertAPITaskToLocal(newTask);
              setTasks(prev => [...prev, localNewTask]);
              addedTasksCount++;
            } catch (error) {
              console.error('Error adding task:', error);
            }
          }
          
          // Show success message with task count
          const responseText = addedTasksCount > 0 
            ? `I've analyzed your request and automatically added ${addedTasksCount} task${addedTasksCount > 1 ? 's' : ''} to your kanban board. ${response.project_summary || ''}`
            : response.project_summary || 'I\'ve analyzed your request but couldn\'t create any tasks.';
            
          setAiMessages(prev => [...prev, { 
            type: 'ai', 
            text: responseText
          }]);
          
          if (addedTasksCount > 0) {
            showNotification(`${addedTasksCount} task${addedTasksCount > 1 ? 's' : ''} added to your board!`, 'success');
          }
        } else {
          // No tasks generated
          setAiMessages(prev => [...prev, { 
            type: 'ai', 
            text: response.project_summary || 'I\'ve analyzed your request but couldn\'t identify specific tasks to create. Try being more specific about what you\'d like to accomplish.'
          }]);
        }
      } else {
        setAiMessages(prev => [...prev, { 
          type: 'ai', 
          text: 'Sorry, I encountered an error while processing your request. Please try again.'
        }]);
      }
    } catch (error) {
      console.error('AI Error:', error);
      setAiMessages(prev => [...prev, { 
        type: 'ai', 
        text: 'Sorry, I encountered an error while processing your request. Please try again.'
      }]);
    } finally {
      setAiIsTyping(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
        <header className="flex items-center justify-between px-6 py-4 border-b">
          <Button variant="ghost" size="icon" onClick={onNavigateBack}>
            <MaterialIcon 
              name="arrow_back"
              size="small"
              style={{ color: 'var(--color-icon-primary)' }}
            />
          </Button>
          <h1 className="text-xl font-semibold">Kanban Board</h1>
          <div className="w-10" />
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MaterialIcon 
              name="refresh"
              size="large"
              className="animate-spin mb-4 mx-auto"
              style={{ color: 'var(--color-icon-primary)' }}
            />
            <p className="text-gray-600">Loading tasks...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex flex-col h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
        <header 
          className="flex items-center justify-between gap-4 px-4 py-4 border-b"
          style={{ 
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)'
          }}
        >
          <Button variant="ghost" size="icon" onClick={onNavigateBack}>
            <MaterialIcon 
              name="arrow_back"
              size="small"
              style={{ color: 'var(--color-icon-primary)' }}
            />
          </Button>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--color-primary)' }}>Kanban Board</h1>
          <div className="w-10" />
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>Please log in to view your Kanban board</p>
            <Button onClick={onNavigateBack} className="btn-primary">Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Dev banner removed for production-like view */}
      {/* Header */}
      <header className="flex items-center justify-between gap-4 px-4 py-4 border-b bg-card">
        <Button variant="ghost" size="icon" onClick={onNavigateBack}>
          <MaterialIcon 
            name="arrow_back"
            size="small"
            style={{ color: 'var(--color-icon-primary)' }}
          />
        </Button>
        <div className="flex items-center justify-center flex-1">
          <div className="flex items-center">
            <span className="inline-block bg-red-500 text-white text-xs px-2 py-0.5 rounded-md">DEV MOD</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            size="sm"
            onClick={() => setShowAddTask(true)}
            className="btn-primary"
            style={{ 
              backgroundColor: 'var(--color-primary)', 
              color: '#ffffff', 
              opacity: 1 
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
            <span 
              className="mr-2"
              style={{ color: '#ffffff' }}
            >
              +
            </span>
            Add Task
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setShowAIChat(true)}
            style={{ borderColor: 'var(--color-border)' }}
            className="hover:bg-surface-hover"
          >
            <MaterialIcon 
              name="chat"
              size="small"
              className="mr-2"
              style={{ color: 'var(--color-icon-accent)' }}
            />
            AI Assistant
          </Button>
          {onLogout && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={onLogout}
              style={{ borderColor: 'var(--color-border)' }}
              className="hover:bg-surface-hover"
              title="Logout"
            >
              <MaterialIcon 
                name="logout"
                size="small"
                className="mr-2"
                style={{ color: 'var(--color-icon-primary)' }}
              />
              Logout
            </Button>
          )}
        </div>
      </header>

  {/* Error banner removed: errors are still tracked in state (setError) but not shown as a top banner here. */}

  {/* Empty-state banner removed per request. When there are no tasks the columns will simply render empty drop zones instead. */}

  {/* Kanban Board */}
  <div className="flex-1 overflow-hidden">
        <DndProvider backend={HTML5Backend}>
          <div className="flex gap-4 p-4 h-full overflow-x-auto">
            {columns.map((column) => (
              <TaskColumn
                key={column.id}
                column={column}
                tasks={getTasksByStatus(column.id)}
                onMoveTask={handleMoveTask}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
              />
            ))}
          </div>
        </DndProvider>
      </div>

      {/* Toasts removed: notifications are now logged to the console */}

      {/* Add Task Dialog (using shared Dialog component) */}
      <Dialog open={showAddTask} onOpenChange={(open) => setShowAddTask(open)}>
        {showAddTask && (
          <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <DialogTitle id="add-task-title" className="text-lg font-semibold">Create New Task</DialogTitle>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleCreateTask({
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                priority: formData.get('priority') as string,
              });
            }}>
              <div className="dialog-body space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input 
                    name="title"
                    type="text" 
                    required
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:outline-none"
                    style={{
                      borderColor: 'var(--color-border)',
                      backgroundColor: 'var(--color-background-input)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--color-border-focus)';
                      e.target.style.boxShadow = '0 0 0 2px rgba(74, 144, 226, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--color-border)';
                      e.target.style.boxShadow = 'none';
                    }}
                    placeholder="Enter task title..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea 
                    name="description"
                    rows={3}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter task description..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select 
                    name="priority"
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    defaultValue="MEDIUM"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="dialog-actions mt-4 flex justify-end gap-2" style={{ marginTop: 16 }}>
                <Button
                  type="submit"
                  className="bg-primary text-white"
                  style={{ backgroundColor: 'var(--primary)', color: '#ffffff', opacity: 1 }}
                >
                  Create Task
                </Button>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
              </div>
            </form>
          </DialogContent>
        )}
      </Dialog>

      {/* Edit Task Dialog (using shared Dialog component) */}
      <Dialog open={showEditModal} onOpenChange={(open) => {
        setShowEditModal(open);
        if (!open) setEditingTaskId(null);
      }}>
        {showEditModal && (
          <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <DialogTitle id="edit-task-title" className="text-lg font-semibold">Edit Task</DialogTitle>
            </div>

            <form onSubmit={submitEditTask}>
              <div className="dialog-body space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input 
                    name="title"
                    ref={editTitleRef}
                    value={editingForm.title}
                    onChange={(e) => setEditingForm(f => ({ ...f, title: e.target.value }))}
                    type="text" 
                    required
                    className="w-full p-2 border rounded-lg"
                    placeholder="Enter task title..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea 
                    name="description"
                    value={editingForm.description}
                    onChange={(e) => setEditingForm(f => ({ ...f, description: e.target.value }))}
                    rows={4}
                    className="w-full p-2 border rounded-lg"
                    placeholder="Enter task description..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select 
                    name="priority"
                    value={editingForm.priority}
                    onChange={(e) => setEditingForm(f => ({ ...f, priority: e.target.value }))}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="dialog-actions mt-4 flex justify-end gap-2" style={{ marginTop: 16 }}>
                <Button 
                  type="submit" 
                  className="bg-primary text-white" 
                  style={{ 
                    backgroundColor: 'var(--color-primary)', 
                    color: '#ffffff', 
                    opacity: 1,
                    border: 'none'
                  }}
                >
                  Save
                </Button>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
              </div>
            </form>
          </DialogContent>
        )}
      </Dialog>

      {/* AI Chat Drawer */}
      {showAIChat && (
        <>
          {/* Transparent Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-30 z-40"
            onClick={() => setShowAIChat(false)}
          />
          
          {/* Drawer - 1/3 of page width */}
          <div 
            className="fixed right-0 top-0 h-full shadow-xl z-50 transform transition-transform duration-300 ease-in-out"
            style={{
              position: 'fixed',
              right: 0,
              top: 0,
              height: '100vh',
              width: '33.333333%', // 1/3 of page width
              backgroundColor: 'white',
              zIndex: 50,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              minWidth: '320px', // Minimum width for mobile
              maxWidth: '500px',  // Maximum width for very large screens
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden' // This is crucial for proper flex scrolling
            }}
          >
            {/* Header */}
                        {/* Header */}
            <div className="flex items-center justify-between p-4 border-b" style={{ flexShrink: 0 }}>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MaterialIcon 
                  name="smart_toy"
                  size="small"
                  style={{ color: 'var(--color-icon-primary)' }}
                />
                AI Assistant
              </h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowAIChat(false)}
              >
                <MaterialIcon 
                  name="close"
                  size="small"
                  style={{ color: 'var(--color-icon-secondary)' }}
                />
              </Button>
            </div>
            
            {/* Messages Container - Scrollable */}
            <div 
              className="flex-1 min-h-0"
              style={{ 
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div className="p-4 space-y-3 flex-1">
                {aiMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${
                      message.type === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: message.type === "user" 
                          ? 'var(--color-primary)' 
                          : 'var(--color-secondary)',
                        color: 'white'
                      }}
                    >
                      <MaterialIcon 
                        name={message.type === "user" ? "person" : "smart_toy"}
                        size="small"
                        style={{ color: 'white' }}
                      />
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`px-4 py-3 rounded-2xl max-w-[80%] ${
                        message.type === "user"
                          ? "rounded-tr-sm"
                          : "rounded-tl-sm"
                      }`}
                      style={{
                        backgroundColor: message.type === "user" 
                          ? 'var(--color-primary)' 
                          : 'var(--color-secondary)',
                        color: 'white',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word'
                      }}
                    >
                      <p className="break-words text-sm whitespace-pre-wrap">
                        {message.text}
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* AI Typing Indicator */}
                {aiIsTyping && (
                  <div className="flex gap-3">
                    <div 
                      className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'var(--color-secondary)', color: 'white' }}
                    >
                      <MaterialIcon name="smart_toy" size="small" style={{ color: 'white' }} />
                    </div>
                    <div 
                      className="px-4 py-3 rounded-2xl rounded-tl-sm"
                      style={{ backgroundColor: 'var(--color-secondary)', color: 'white' }}
                    >
                      <div className="flex gap-1">
                        <span className="animate-pulse">●</span>
                        <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>●</span>
                        <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>●</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Input Area - Fixed at bottom */}
            <div 
              className="p-4 border-t bg-white" 
              style={{ 
                borderColor: 'var(--color-border)',
                flexShrink: 0
              }}
            >
              <div className="flex gap-2">
                <input
                  ref={aiInputRef}
                  type="text"
                  placeholder="Ask me to help organize your tasks or create new ones..."
                  className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  style={{
                    borderColor: 'var(--color-border)',
                    backgroundColor: 'var(--color-background-input)'
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAISendMessage();
                    }
                  }}
                />
                <Button 
                  onClick={handleAISendMessage}
                  className="bg-primary text-white px-4"
                  style={{ backgroundColor: 'var(--color-primary)', color: '#ffffff', opacity: 1 }}
                  disabled={aiIsTyping}
                >
                  <MaterialIcon 
                    name="send"
                    size="small"
                    style={{ color: '#ffffff' }}
                  />
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
