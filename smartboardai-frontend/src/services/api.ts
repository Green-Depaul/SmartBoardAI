// API service for communicating with the backend

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SignupResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskSuggestion {
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  estimatedHours: number;
  category: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  estimatedHours: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskStats {
  totalTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  inReviewTasks: number;
  doneTasks: number;
}

export interface AIResponse {
  message: string;
  suggestedTasks: TaskSuggestion[];
  plan: string;
}

// Base request function
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `/api${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

export const api = {
  // User Authentication
  login: (payload: { email: string; password: string }) =>
    request<User>(`/users/login`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
    
  signup: (payload: { 
    email: string; 
    password: string; 
    firstName: string; 
    lastName: string; 
  }) =>
    request<SignupResponse>(`/users/register`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // AI Services
  generatePlan: (message: string) =>
    request<AIResponse>(`/ai/generate-plan`, {
      method: "POST",
      body: JSON.stringify({ message }),
    }),

  // Task Services
  getTasks: (userId: number) =>
    request<Task[]>(`/tasks/user/${userId}`),

  getTasksByStatus: (userId: number, status: string) =>
    request<Task[]>(`/tasks/user/${userId}/status/${status}`),

  createTask: (payload: {
    userId: number;
    title: string;
    description: string;
    priority: string;
    estimatedHours: number;
  }) =>
    request<Task>(`/tasks`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  createTaskFromSuggestion: (payload: {
    userId: number;
    suggestion: TaskSuggestion;
  }) =>
    request<Task>(`/tasks/from-suggestion`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateTaskStatus: (taskId: number, status: string) =>
    request<Task>(`/tasks/${taskId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),

  deleteTask: (taskId: number) =>
    request<{ message: string }>(`/tasks/${taskId}`, {
      method: "DELETE",
    }),

  getTaskStats: (userId: number) =>
    request<TaskStats>(`/tasks/user/${userId}/stats`),

  // Health checks
  health: () =>
    request<{ status: string }>(`/users/health`),

  aiHealth: () =>
    request<{ status: string; timestamp: string }>(`/ai/health`),

  taskHealth: () =>
    request<{ status: string }>(`/tasks/health`),
};
