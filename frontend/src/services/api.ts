import {
  EventItem,
  EventListItem,
  EventCreateInput,
  BudgetSummary,
  BudgetItem,
  TasksListResponse,
  TaskItem,
  VendorsListResponse,
  VendorRecord,
  HealthStatus,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    try {
      const response = await fetch(url, { ...options, headers });

      if (response.status === 204) {
        return null as unknown as T;
      }

      if (!response.ok) {
        let errorDetail = `Request failed with status ${response.status}`;
        try {
          const errData = await response.json();
          if (errData && errData.detail) {
            errorDetail = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
          }
        } catch {
          // fallback to status text
        }
        throw new Error(errorDetail);
      }

      return await response.json();
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw err;
      }
      throw new Error('Network error connecting to EventSaathi API');
    }
  }

  // Health
  async getHealth(): Promise<HealthStatus> {
    return this.request<HealthStatus>('/api/health');
  }

  // Events
  async getEvents(): Promise<EventListItem[]> {
    return this.request<EventListItem[]>('/api/events');
  }

  async getEvent(id: string): Promise<EventItem> {
    return this.request<EventItem>(`/api/events/${id}`);
  }

  async createEvent(input: EventCreateInput): Promise<EventItem> {
    return this.request<EventItem>('/api/events', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async updateEvent(id: string, input: Partial<EventCreateInput>): Promise<EventItem> {
    return this.request<EventItem>(`/api/events/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  }

  async deleteEvent(id: string): Promise<void> {
    return this.request<void>(`/api/events/${id}`, {
      method: 'DELETE',
    });
  }

  async generatePlan(id: string): Promise<EventItem> {
    return this.request<EventItem>(`/api/events/${id}/generate-plan`, {
      method: 'POST',
    });
  }

  // Budget
  async getBudget(eventId: string): Promise<BudgetSummary> {
    return this.request<BudgetSummary>(`/api/events/${eventId}/budget`);
  }

  async addBudgetItem(
    eventId: string,
    data: { category: string; item_name: string; estimated_amount: number; actual_amount?: number; notes?: string; is_paid?: boolean }
  ): Promise<BudgetItem> {
    return this.request<BudgetItem>(`/api/events/${eventId}/budget/items`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBudgetItem(
    itemId: string,
    eventId: string,
    data: Partial<BudgetItem>
  ): Promise<BudgetItem> {
    return this.request<BudgetItem>(`/api/events/${eventId}/budget/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteBudgetItem(itemId: string, eventId: string): Promise<void> {
    return this.request<void>(`/api/events/${eventId}/budget/items/${itemId}`, {
      method: 'DELETE',
    });
  }

  getBudgetExportCsvUrl(eventId: string): string {
    return `${API_BASE}/api/events/${eventId}/budget/export-csv`;
  }

  // Tasks
  async getTasks(eventId: string, status?: string, priority?: string): Promise<TasksListResponse> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (priority) params.append('priority', priority);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<TasksListResponse>(`/api/events/${eventId}/tasks${query}`);
  }

  async addTask(
    eventId: string,
    data: { title: string; description?: string; due_date?: string; milestone_phase?: string; priority?: string; status?: string }
  ): Promise<TaskItem> {
    return this.request<TaskItem>(`/api/events/${eventId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTask(
    taskId: string,
    eventId: string,
    data: Partial<TaskItem>
  ): Promise<TaskItem> {
    return this.request<TaskItem>(`/api/events/${eventId}/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteTask(taskId: string, eventId: string): Promise<void> {
    return this.request<void>(`/api/events/${eventId}/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  // Vendors
  async getVendors(eventId: string, category?: string, status?: string): Promise<VendorsListResponse> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (status) params.append('status', status);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<VendorsListResponse>(`/api/events/${eventId}/vendors${query}`);
  }

  async addVendor(
    eventId: string,
    data: { category: string; name: string; contact_person?: string; phone?: string; email?: string; estimated_quote?: number; actual_quote?: number; status?: string; notes?: string; selection_criteria?: string }
  ): Promise<VendorRecord> {
    return this.request<VendorRecord>(`/api/events/${eventId}/vendors`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateVendor(
    vendorId: string,
    eventId: string,
    data: Partial<VendorRecord>
  ): Promise<VendorRecord> {
    return this.request<VendorRecord>(`/api/events/${eventId}/vendors/${vendorId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteVendor(vendorId: string, eventId: string): Promise<void> {
    return this.request<void>(`/api/events/${eventId}/vendors/${vendorId}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiService();
