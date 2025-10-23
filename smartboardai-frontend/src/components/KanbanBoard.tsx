import { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ArrowLeft, Plus, MoreVertical, Clock, User, RefreshCw } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { api, type Task as APITask } from "../services/api";

interface KanbanBoardProps {
  onNavigateBack: () => void;
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

const ITEM_TYPE = "TASK";

// Convert API task to local task format
const convertAPITaskToLocal = (apiTask: APITask): Task => ({
  id: apiTask.id.toString(),
  title: apiTask.title,
  description: apiTask.description,
  status: apiTask.status as TaskStatus,
  priority: apiTask.priority,
  estimatedHours: apiTask.estimatedHours,
  createdAt: apiTask.createdAt,
});

const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: "TODO", title: "To Do", color: "bg-gray-100" },
  { id: "IN_PROGRESS", title: "In Progress", color: "bg-blue-100" },
  { id: "IN_REVIEW", title: "In Review", color: "bg-yellow-100" },
  { id: "DONE", title: "Done", color: "bg-green-100" },
];

const getPriorityColor = (priority?: string) => {
  switch (priority) {
    case "URGENT":
      return "bg-red-500 text-white";
    case "HIGH":
      return "bg-orange-500 text-white";
    case "MEDIUM":
      return "bg-yellow-500 text-black";
    case "LOW":
      return "bg-green-500 text-white";
    default:
      return "bg-gray-500 text-white";
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
}

function TaskCard({ task, onMoveTask }: TaskCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ITEM_TYPE,
    item: { id: task.id, status: task.status },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`mb-3 cursor-move ${isDragging ? "opacity-50" : ""}`}
    >
      <Card className="p-3 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-sm leading-tight">{task.title}</h4>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <MoreVertical className="h-3 w-3" />
          </Button>
        </div>
        
        {task.description && (
          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
            {task.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <Badge
            className={`text-xs ${getPriorityColor(task.priority)}`}
            variant="secondary"
          >
            {getPriorityLabel(task.priority)}
          </Badge>
          
          {task.estimatedHours && (
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              {task.estimatedHours}h
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

interface TaskColumnProps {
  column: { id: TaskStatus; title: string; color: string };
  tasks: Task[];
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
}

function TaskColumn({ column, tasks, onMoveTask }: TaskColumnProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ITEM_TYPE,
    drop: (item: { id: string; status: TaskStatus }) => {
      if (item.status !== column.id) {
        onMoveTask(item.id, column.id);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`flex-1 min-w-64 ${isOver ? "bg-blue-50" : ""}`}
    >
      <div className="bg-white rounded-lg shadow-sm border">
        <div className={`p-3 rounded-t-lg ${column.color}`}>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">{column.title}</h3>
            <Badge variant="secondary" className="bg-white/80 text-gray-600">
              {tasks.length}
            </Badge>
          </div>
        </div>
        
        <ScrollArea className="h-96 p-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onMoveTask={onMoveTask} />
          ))}
          
          {tasks.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <p className="text-sm">No tasks</p>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}

export function KanbanBoard({ onNavigateBack, currentUser }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const apiTasks = await api.getTasks(currentUser.id);
      const localTasks = apiTasks.map(convertAPITaskToLocal);
      setTasks(localTasks);
      setError(null);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Failed to load tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [currentUser]);

  const handleMoveTask = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await api.updateTaskStatus(parseInt(taskId), newStatus);
      
      // Update local state
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (err) {
      console.error("Error updating task status:", err);
      setError("Failed to update task. Please try again.");
    }
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <header className="flex items-center justify-between gap-4 px-4 py-4 border-b bg-card">
          <Button variant="ghost" size="icon" onClick={onNavigateBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Kanban Board</h1>
          <div className="w-10" />
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-500" />
            <p className="text-gray-600">Loading tasks...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <header className="flex items-center justify-between gap-4 px-4 py-4 border-b bg-card">
          <Button variant="ghost" size="icon" onClick={onNavigateBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Kanban Board</h1>
          <div className="w-10" />
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Please log in to view your Kanban board</p>
            <Button onClick={onNavigateBack}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between gap-4 px-4 py-4 border-b bg-card">
        <Button variant="ghost" size="icon" onClick={onNavigateBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">Kanban Board</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTasks}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

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
              />
            ))}
          </div>
        </DndProvider>
      </div>
    </div>
  );
}