import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { ArrowLeft, Plus, Edit, Trash2, Calendar, User, AlertCircle } from "lucide-react";
import { javaApi, Task, Board } from "../services/api";
import { Alert, AlertDescription } from "./ui/alert";

interface BoardPageProps {
  onNavigateBack: () => void;
}

const statusColors = {
  TODO: "bg-gray-100 text-gray-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  DONE: "bg-green-100 text-green-800",
};

const priorityColors = {
  LOW: "bg-gray-100 text-gray-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-orange-100 text-orange-800",
  URGENT: "bg-red-100 text-red-800",
};

export function BoardPage({ onNavigateBack }: BoardPageProps) {
  const [board, setBoard] = useState<Board | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form state for creating/editing tasks
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    assignedTo: "",
    dueDate: "",
  });

  // Create a default board for demo purposes
  useEffect(() => {
    const initializeBoard = async () => {
      try {
        setLoading(true);
        setError(null);

        // Create a default board if none exists
        const boards = await javaApi.getBoards();
        let defaultBoard: Board;

        if (boards.length === 0) {
          defaultBoard = await javaApi.createBoard({
            title: "My Smart Board",
            description: "Tasks organized by AI",
            userId: "demo-user",
          });
        } else {
          defaultBoard = boards[0];
        }

        setBoard(defaultBoard);

        // Load tasks for this board
        const boardTasks = await javaApi.getTasksByBoard(defaultBoard.id);
        setTasks(boardTasks);
      } catch (err) {
        console.error("Failed to load board:", err);
        setError("Failed to load board. Please check if the backend is running.");
      } finally {
        setLoading(false);
      }
    };

    initializeBoard();
  }, []);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      status: "TODO",
      priority: "MEDIUM",
      assignedTo: "",
      dueDate: "",
    });
  };

  const handleCreateTask = async () => {
    if (!board || !formData.title.trim()) return;

    try {
      const newTask = await javaApi.createTask({
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        boardId: board.id,
        assignedTo: formData.assignedTo || undefined,
        dueDate: formData.dueDate || undefined,
      });

      setTasks(prev => [...prev, newTask]);
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (err) {
      console.error("Failed to create task:", err);
      setError("Failed to create task. Please try again.");
    }
  };

  const handleUpdateTask = async () => {
    if (!editingTask || !formData.title.trim()) return;

    try {
      const updatedTask = await javaApi.updateTask(editingTask.id, {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        assignedTo: formData.assignedTo || undefined,
        dueDate: formData.dueDate || undefined,
      });

      setTasks(prev => prev.map(task => 
        task.id === editingTask.id ? updatedTask : task
      ));
      setIsEditDialogOpen(false);
      setEditingTask(null);
      resetForm();
    } catch (err) {
      console.error("Failed to update task:", err);
      setError("Failed to update task. Please try again.");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      await javaApi.deleteTask(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (err) {
      console.error("Failed to delete task:", err);
      setError("Failed to delete task. Please try again.");
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const updatedTask = await javaApi.updateTaskStatus(taskId, newStatus);
      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ));
    } catch (err) {
      console.error("Failed to update task status:", err);
      setError("Failed to update task status. Please try again.");
    }
  };

  const openEditDialog = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assignedTo: task.assignedTo || "",
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : "",
    });
    setIsEditDialogOpen(true);
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onNavigateBack}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-medium">{board?.title || "My Board"}</h1>
            <p className="text-sm text-muted-foreground">{board?.description}</p>
          </div>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter task title"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter task description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODO">To Do</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="DONE">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Assigned To</label>
                  <Input
                    value={formData.assignedTo}
                    onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                    placeholder="Assignee name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Due Date</label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTask}>Create Task</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Kanban Board */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["TODO", "IN_PROGRESS", "DONE"].map((status) => (
            <div key={status} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium capitalize">{status.replace('_', ' ')}</h3>
                <Badge variant="secondary">{getTasksByStatus(status).length}</Badge>
              </div>
              <div className="space-y-3 min-h-[400px]">
                {getTasksByStatus(status).map((task) => (
                  <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-sm">{task.title}</CardTitle>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(task)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {task.description && (
                        <p className="text-xs text-muted-foreground mb-2">{task.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <Badge className={`text-xs ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </Badge>
                        <Select
                          value={task.status}
                          onValueChange={(value) => handleStatusChange(task.id, value)}
                        >
                          <SelectTrigger className="w-24 h-6 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="TODO">To Do</SelectItem>
                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                            <SelectItem value="DONE">Done</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        {task.assignedTo && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {task.assignedTo}
                          </div>
                        )}
                        {task.dueDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter task title"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter task description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODO">To Do</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="DONE">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Priority</label>
                <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Assigned To</label>
                <Input
                  value={formData.assignedTo}
                  onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                  placeholder="Assignee name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Due Date</label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateTask}>Update Task</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
