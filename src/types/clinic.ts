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

export interface SearchFilters {
  city: string;
  state: string;
  services: string[];
  searchTerm: string;
}