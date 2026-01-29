import { StudyPlan, StudyTask, UserProfile } from "@/types/study";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://smartlearner-backend-2.onrender.com/api';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('token');

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Authentication
  async register(data: {
    name: string;
    email: string;
    password: string;
    examDate?: string;
    goal?: string;
    dailyAvailableTime?: number;
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async updateProfile(data: {
    name?: string;
    examDate?: string;
    goal?: string;
    dailyAvailableTime?: number;
  }) {
    return this.request('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Study Plans
  async createStudyPlan(data: {
    name: string;
    totalDuration: string;
    tasks: Array<{
      name: string;
      estimatedTime: string;
      difficulty: 'Easy' | 'Medium' | 'Hard';
    }>;
    examDate?: string;
    goal?: string;
  }) {
    return this.request('/study-plan/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCurrentStudyPlan() {
    return this.request('/study-plan/current');
  }

  async getAllStudyPlans() {
    return this.request('/study-plan/all');
  }

  async updateTaskStatus(data: {
    planId: string;
    taskId: string;
    completed: boolean;
  }) {
    return this.request('/study-plan/task-status', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getProgress() {
    return this.request('/study-plan/progress');
  }

  // Tasks
  async addTask(data: { title: string; duration: number; date?: string }) {
    return this.request('/tasks/add', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTasks(date?: string) {
    const params = date ? `?date=${date}` : '';
    return this.request(`/tasks${params}`);
  }

  async getDailyPlan() {
    return this.request('/tasks/daily-plan');
  }

  async updateTask(taskId: string, data: { completed: boolean }) {
    return this.request(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTask(taskId: string) {
    return this.request(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient(API_BASE_URL);