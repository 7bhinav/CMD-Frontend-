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
      return { data };
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      return { error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  // Clinics endpoints
  async getClinics() {
    return this.request<Clinic[]>('/clinics');
  }

  async createClinic(clinicData: CreateClinicRequest) {
    return this.request<Clinic>('/clinics', {
      method: 'POST',
      body: JSON.stringify(clinicData),
    });
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

// Types
export interface Service {
  id: string;
  name: string;
  code: string;
  description: string;
  averagePrice: number;
  isActive: boolean;
}

export interface ClinicService {
  serviceId: string;
  serviceName: string;
  serviceCode: string;
  description: string;
  price: number;
  isActive: boolean;
}

export interface Clinic {
  id: string;
  clinicName: string;
  businessName: string;
  streetAddress: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  dateCreated: string;
  services: ClinicService[];
}

export interface CreateClinicRequest {
  clinicName: string;
  businessName: string;
  streetAddress: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  services: {
    serviceId: string;
    price: number;
    isActive: boolean;
  }[];
}

export interface SearchFilters {
  city: string;
  state: string;
  services: string[];
  searchTerm: string;
}

export interface LogEntry {
  id: string;
  message: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  type: 'Info' | 'Warning' | 'Error';
  timestamp: string;
  project: string;
  className: string;
  method: string;
}

export const apiService = new ApiService();