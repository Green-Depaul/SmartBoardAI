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
  id: string;
  title: string;
  description: string;
  priority: string;
  estimated_hours?: number;
  category?: string;
  dependencies: string[];
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  estimatedHours: number;
  userId?: number;
  createdAt: string | null;
  updatedAt: string;
  boardId?: string | null;
  assignedTo?: string | null;
  dueDate?: string | null;
  order?: number;
}

export interface TaskStats {
  totalTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  inReviewTasks: number;
  doneTasks: number;
}

export interface AIResponse {
  success: boolean;
  tasks: TaskSuggestion[];
  total_estimated_hours?: number;
  project_summary?: string;
  recommendations?: string[];
  error_message?: string;
  request_id?: string;
}

const BACKEND_BASE_URL =
  import.meta.env.VITE_BACKEND_BASE_URL ??
  (window.location.hostname === 'localhost' ? '/api' : 'http://localhost:8080/api');

const AI_SERVICE_BASE_URL =
  import.meta.env.VITE_AI_BASE_URL ??
  (window.location.hostname === 'localhost'
    ? 'http://localhost:8000/api'
    : 'http://localhost:8000/api');

const AI_PLAN_BASE_URL = `${AI_SERVICE_BASE_URL.replace(/\/$/, '')}/ai`;

// Base request function
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BACKEND_BASE_URL}${endpoint}`;
  
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

  // Handle 204 No Content responses (e.g., DELETE operations)
  if (response.status === 204) {
    return {} as T;
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
    requestWithBase<AIResponse>(
      AI_PLAN_BASE_URL,
      `/generate-plan`,
      {
        method: "POST",
        body: JSON.stringify({ message }),
      }
    ),

  // Task Services (aligned with backend /board/items and TaskController)
  // User-specific task retrieval using assignedTo parameter
  getTasks: (userId: number) => request<Task[]>(`/board/items?assignedTo=${userId}`),

  getTasksByStatus: (userId: number, status: string) =>
    request<Task[]>(`/board/items?assignedTo=${userId}`), // Filter by user first, then filter by status on frontend

  createTask: (payload: {
    title: string;
    description?: string;
    priority?: string;
    userId?: number;
  }) =>
    request<Task>(`/board/items`, {
      method: "POST",
      body: JSON.stringify({
        ...payload,
        assignedTo: payload.userId?.toString(),
      }),
    }),

  createTaskFromSuggestion: (payload: {
    userId: number;
    suggestion: TaskSuggestion;
  }) =>
    request<Task>(`/board/items`, {
      method: "POST",
      body: JSON.stringify({
        title: payload.suggestion.title,
        description: payload.suggestion.description,
        priority: payload.suggestion.priority,
        assignedTo: payload.userId.toString(),
      }),
    }),

  updateTaskStatus: (taskId: string, status: string) =>
    request<Task>(`/board/items/${taskId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  // Update full task (partial fields allowed) - backend supports PUT /board/items/{id}
  updateTask: (taskId: string, payload: Partial<Task>) =>
    request<Task>(`/board/items/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  deleteTask: (taskId: string) =>
    request<{ message: string }>(`/board/items/${taskId}`, {
      method: "DELETE",
    }),

  getTaskStats: (_userId: number) =>
    Promise.resolve({
      totalTasks: 0,
      todoTasks: 0,
      inProgressTasks: 0,
      inReviewTasks: 0,
      doneTasks: 0,
    } as TaskStats),

  // Health checks
  health: () =>
    request<{ status: string }>(`/users/health`),

  aiHealth: () =>
    requestWithBase<{ status: string; timestamp: string }>(
      AI_SERVICE_BASE_URL,
      `/health`
    ),

  taskHealth: () =>
    request<{ status: string }>(`/tasks/health`),
};

async function requestWithBase<T>(
  baseUrl: string,
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${baseUrl.replace(/\/$/, "")}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
