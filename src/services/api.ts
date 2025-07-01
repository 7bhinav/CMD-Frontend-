import { Clinic, Service, CreateClinicRequest, LogEntry } from '../types/clinic';

const API_BASE_URL = 'http://localhost:3000/api';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Add debugging
      console.log(`API Response [${endpoint}]:`, {
        status: response.status,
        data: data,
        dataType: typeof data,
        isArray: Array.isArray(data),
        length: Array.isArray(data) ? data.length : 'N/A'
      });
      
      return { data };
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      return { error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  // Clinics endpoints
  async getClinics() {
    console.log('Calling getClinics API...');
    const result = await this.request<Clinic[]>('/clinics');
    console.log('getClinics result:', result);
    return result;
  }

  async createClinic(clinicData: CreateClinicRequest) {
    return this.request<Clinic>('/clinics', {
      method: 'POST',
      body: JSON.stringify(clinicData),
    });
  }

  // New cached endpoints
  async getClinicsByCity(city: string) {
    console.log(`Calling getClinicsByCity API for city: ${city}...`);
    const result = await this.request<Clinic[]>(`/clinics/city/${encodeURIComponent(city)}`);
    console.log('getClinicsByCity result:', result);
    return result;
  }

  async getClinicById(clinicId: string) {
    return this.request<Clinic>(`/clinics/${encodeURIComponent(clinicId)}`);
  }

  // Services endpoints
  async getServices() {
    console.log('Calling getServices API...');
    const result = await this.request<Service[]>('/services');
    console.log('getServices result:', result);
    return result;
  }

  // Logs endpoints
  async getLogs(filters?: { type?: string; priority?: string; limit?: number }): Promise<ApiResponse<LogEntry[]>> {
    const queryParams = new URLSearchParams(filters as Record<string, string>).toString();
    const endpoint = queryParams ? `/logs?${queryParams}` : '/logs';
    return this.request<LogEntry[]>(endpoint);
  }

  async clearLogs(): Promise<ApiResponse<void>> {
    return this.request<void>('/logs', {
      method: 'POST',
    });
  }
}

export const apiService = new ApiService();