import { Clinic, Service, CreateClinicRequest } from '../types/clinic';

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
    return this.request<Clinic>('/clinic-create', {
      method: 'POST',
      body: JSON.stringify(clinicData),
    });
  }

  // Services endpoints
  async getServices() {
    return this.request<Service[]>('/services');
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

// Updated interfaces to match API response
export interface Service {
  id: string;
  serviceId: string; // Added for API compatibility
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
  serviceDescription: string; // Updated field name
  defaultPrice: number; // New field
  customPrice: number | null; // New field
  isOffered: boolean; // Updated field name
}

export interface Clinic {
  clinicId: string; // Updated field name
  name: string; // Updated field name
  businessName: string;
  streetAddress: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  services: ClinicService[];
}

// New interface for creating clinics
export interface CreateClinicRequest {
  name: string;
  businessName: string;
  streetAddress: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  serviceIds: string[];
  customPrices: Record<string, number>;
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