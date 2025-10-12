import { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ArrowLeft, Plus, MoreVertical, Clock, User } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";

interface KanbanBoardProps {
  onNavigateBack: () => void;
}

export type TaskStatus = "backlog" | "ready" | "in-progress" | "in-review" | "done";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: "low" | "medium" | "high";
  assignee?: string;
  dueDate?: string;
}

const ITEM_TYPE = "TASK";

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Design landing page mockups",
    description: "Create initial wireframes and high-fidelity designs",
    status: "done",
    priority: "high",
    assignee: "Design Team",
    dueDate: "Oct 5",
  },
  {
    id: "2",
    title: "Set up project repository",
    description: "Initialize Git repo and configure CI/CD pipeline",
    status: "done",
    priority: "high",
    assignee: "DevOps",
    dueDate: "Oct 6",
  },
  {
    id: "3",
    title: "Implement authentication system",
    description: "Build login and signup functionality",
    status: "in-review",
    priority: "high",
    assignee: "Backend Team",
    dueDate: "Oct 12",
  },
  {
    id: "4",
    title: "Create chat interface",
    description: "Build AI chat component with message handling",
    status: "in-review",
    priority: "high",
    assignee: "Frontend Team",
    dueDate: "Oct 12",
  },
  {
    id: "5",
    title: "Develop Kanban board UI",
    description: "Create drag-and-drop task board with columns",
    status: "in-progress",
    priority: "high",
    assignee: "Frontend Team",
    dueDate: "Oct 14",
  },
  {
    id: "6",
    title: "Integrate AI API for task generation",
    description: "Connect to AI service for intelligent task breakdown",
    status: "ready",
    priority: "high",
    assignee: "Backend Team",
    dueDate: "Oct 16",
  },
  {
    id: "7",
    title: "Implement task editing and deletion",
    description: "Add CRUD operations for task management",
    status: "ready",
    priority: "medium",
    assignee: "Full Stack",
    dueDate: "Oct 18",
  },
  {
    id: "8",
    title: "Add user profile settings",
    description: "Create profile page with customization options",
    status: "backlog",
    priority: "medium",
    assignee: "Frontend Team",
    dueDate: "Oct 20",
  },
  {
    id: "9",
    title: "Set up database schema",
    description: "Design and implement database structure for tasks and users",
    status: "backlog",
    priority: "high",
    assignee: "Backend Team",
    dueDate: "Oct 22",
  },
  {
    id: "10",
    title: "Create analytics dashboard",
    description: "Build dashboard to track project progress and metrics",
    status: "backlog",
    priority: "low",
    assignee: "Full Stack",
    dueDate: "Oct 25",
  },
  {
    id: "11",
    title: "Write API documentation",
    description: "Document all API endpoints and usage examples",
    status: "backlog",
    priority: "medium",
    assignee: "Backend Team",
    dueDate: "Oct 28",
  },
];

interface TaskCardProps {
  task: Task;
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
}

function TaskCard({ task, onMoveTask }: TaskCardProps) {
  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: { id: task.id, status: task.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const priorityColors = {
    low: "bg-blue-100 text-blue-700 border-blue-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    high: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <div
      ref={drag}
      className={`bg-white rounded-lg border border-gray-200 p-4 cursor-move hover:shadow-md transition-shadow ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="flex-1">{task.title}</h3>
        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 mb-3">{task.description}</p>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {task.priority && (
          <Badge
            variant="outline"
            className={`text-xs ${priorityColors[task.priority]}`}
          >
            {task.priority}
          </Badge>
        )}
        {task.assignee && (
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <User className="h-3 w-3" />
            <span>{task.assignee}</span>
          </div>
        )}
        {task.dueDate && (
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Clock className="h-3 w-3" />
            <span>{task.dueDate}</span>
          </div>
        )}
      </div>
    </div>
  );
}

interface ColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
  color: string;
}

function Column({ status, title, tasks, onMoveTask, color }: ColumnProps) {
  const [{ isOver }, drop] = useDrop({
    accept: ITEM_TYPE,
    drop: (item: { id: string; status: TaskStatus }) => {
      if (item.status !== status) {
        onMoveTask(item.id, status);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div className="flex flex-col min-w-[300px] max-w-[350px] flex-shrink-0 h-full">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${color}`}></div>
          <h2 className="uppercase text-sm tracking-wide text-gray-600">
            {title}
          </h2>
          <Badge variant="secondary" className="rounded-full h-6 w-6 flex items-center justify-center p-0 text-xs">
            {tasks.length}
          </Badge>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div
        ref={drop}
        className={`flex-1 rounded-lg p-3 transition-colors ${
          isOver ? "bg-blue-50" : "bg-gray-50"
        } overflow-hidden`}
      >
        <ScrollArea className="h-full">
          <div className="space-y-3 pr-4">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} onMoveTask={onMoveTask} />
            ))}
            {tasks.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                Drop tasks here
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

export function KanbanBoard({ onNavigateBack }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const handleMoveTask = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  const columns: { status: TaskStatus; title: string; color: string }[] = [
    { status: "backlog", title: "Backlog", color: "bg-gray-400" },
    { status: "ready", title: "Ready", color: "bg-blue-400" },
    { status: "in-progress", title: "In Progress", color: "bg-yellow-400" },
    { status: "in-review", title: "In Review", color: "bg-purple-400" },
    { status: "done", title: "Done", color: "bg-green-400" },
  ];

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={onNavigateBack}
                className="shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl">Smart Board AI - Task Board</h1>
                <p className="text-sm text-gray-600">
                  Organize and track your project tasks
                </p>
              </div>
            </div>
            <Button className="bg-[#2563eb] hover:bg-[#1e40af]">
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </div>
        </header>

        {/* Kanban Board */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="h-full p-6">
            <div className="flex gap-4 h-full">
              {columns.map((column) => (
                <Column
                  key={column.status}
                  status={column.status}
                  title={column.title}
                  tasks={tasks.filter((task) => task.status === column.status)}
                  onMoveTask={handleMoveTask}
                  color={column.color}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
