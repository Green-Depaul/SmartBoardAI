const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  return (await res.json()) as T;
}

// Types for our API responses
export interface Board {
  id: string;
  title: string;
  description: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  tasks?: Task[];
}

export interface Task {
  id: string;
  boardId: string;
  title: string;
  description: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  assignedTo?: string;
  dueDate?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface AIResponse {
  message_id: string;
  output: string;
  used_context_keys: string[];
  meta: {
    model: string;
  };
}

export interface ProjectStep {
  step_number: number;
  title: string;
  description: string;
  estimated_duration?: string;
  dependencies: string[];
  priority: string;
  category?: string;
}

export interface GenerateStepsResponse {
  message_id: string;
  project_steps: ProjectStep[];
  total_estimated_duration?: string;
  project_summary: string;
  recommendations: string[];
  meta: {
    model: string;
    steps_count: number;
    complexity: string;
    project_type?: string;
  };
}

// Java Backend API (Spring Boot)
export const javaApi = {
  // Board operations
  getBoards: () => request<Board[]>("/board"),
  getBoard: (id: string) => request<Board>(`/board/${id}`),
  getBoardsByUser: (userId: string) => request<Board[]>(`/board/user/${userId}`),
  createBoard: (payload: { title: string; description: string; userId: string }) =>
    request<Board>("/board", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateBoard: (id: string, payload: { title: string; description: string }) =>
    request<Board>(`/board/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteBoard: (id: string) =>
    request<void>(`/board/${id}`, { method: "DELETE" }),

  // Task operations
  getTasks: () => request<Task[]>("/board/items"),
  getTask: (id: string) => request<Task>(`/board/items/${id}`),
  getTasksByBoard: (boardId: string) => request<Task[]>(`/board/items?boardId=${boardId}`),
  getTasksByStatus: (status: string) => request<Task[]>(`/board/items?status=${status}`),
  createTask: (payload: {
    title: string;
    description: string;
    status: string;
    priority: string;
    boardId: string;
    assignedTo?: string;
    dueDate?: string;
  }) =>
    request<Task>("/board/items", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateTask: (id: string, payload: Partial<Task>) =>
    request<Task>(`/board/items/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  updateTaskStatus: (id: string, status: string) =>
    request<Task>(`/board/items/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  deleteTask: (id: string) =>
    request<void>(`/board/items/${id}`, { method: "DELETE" }),
};

// Python AI Service API
const AI_BASE_URL = import.meta.env.VITE_AI_API_BASE_URL || "http://localhost:8000";

async function aiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${AI_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AI API ${res.status}: ${text}`);
  }
  return (await res.json()) as T;
}

export const aiApi = {
  // Health check
  health: () => aiRequest<{ status: string; java_ok: boolean }>("/health"),

  // AI chat
  prompt: (payload: {
    user_id: string;
    project_id: string;
    message: string;
    temperature?: number;
    max_tokens?: number;
  }) =>
    aiRequest<AIResponse>("/prompt", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Generate project steps
  generateSteps: (payload: {
    user_id: string;
    project_id: string;
    project_description: string;
    project_type?: string;
    complexity: string;
    timeline?: string;
    team_size?: number;
    temperature?: number;
  }) =>
    aiRequest<GenerateStepsResponse>("/projects/generate-steps", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

// Legacy API for backward compatibility
export const api = {
  // Auth examples (adjust paths to your Spring controllers)
  login: (payload: { email: string; password: string }) =>
    request<{ token: string }>(`/auth/login`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  signup: (payload: { name: string; email: string; password: string }) =>
    request<{ id: string }>(`/auth/signup`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // AI ticket generation example
  generateTickets: (payload: { prompt: string }) =>
    request<{ tickets: Array<{ title: string; description?: string }> }>(
      `/ai/generate-tickets`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    ),
};

export type { };
