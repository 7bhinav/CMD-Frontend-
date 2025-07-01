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