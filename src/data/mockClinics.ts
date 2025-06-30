import { Clinic } from '../types/clinic';

export const mockClinics: Clinic[] = [
  {
    id: 'CL202200001',
    clinicName: 'HealthFirst Medical Center',
    businessName: 'HealthFirst LLC',
    streetAddress: '123 Medical Plaza Drive',
    city: 'Los Angeles',
    state: 'California',
    country: 'United States',
    zipCode: '90210',
    latitude: 34.0522,
    longitude: -118.2437,
    dateCreated: '2024-01-15T09:00:00Z',
    services: [
      {
        serviceId: 'SRV001',
        serviceName: 'General Consultation',
        serviceCode: 'CONSULT',
        description: 'General medical consultation with certified doctors',
        price: 150,
        isActive: true
      },
      {
        serviceId: 'SRV003',
        serviceName: 'Blood Test',
        serviceCode: 'BLOOD',
        description: 'Comprehensive blood testing and laboratory analysis',
        price: 100,
        isActive: true
      }
    ]
  },
  {
    id: 'CL202200002',
    clinicName: 'Metropolitan Diagnostic Center',
    businessName: 'Metro Health Solutions Inc.',
    streetAddress: '456 Healthcare Boulevard',
    city: 'New York',
    state: 'New York',
    country: 'United States',
    zipCode: '10001',
    latitude: 40.7128,
    longitude: -74.0060,
    dateCreated: '2024-01-20T10:30:00Z',
    services: [
      {
        serviceId: 'SRV002',
        serviceName: 'X-Ray Imaging',
        serviceCode: 'XRAY',
        description: 'Digital X-ray imaging and diagnostic services',
        price: 200,
        isActive: true
      },
      {
        serviceId: 'SRV005',
        serviceName: 'MRI Scan',
        serviceCode: 'MRI',
        description: 'Magnetic Resonance Imaging for detailed diagnostics',
        price: 800,
        isActive: true
      }
    ]
  },
  {
    id: 'CL202200003',
    clinicName: 'Community Care Clinic',
    businessName: 'Community Health Partners',
    streetAddress: '789 Wellness Street',
    city: 'Chicago',
    state: 'Illinois',
    country: 'United States',
    zipCode: '60601',
    latitude: 41.8781,
    longitude: -87.6298,
    dateCreated: '2024-02-05T14:15:00Z',
    services: [
      {
        serviceId: 'SRV001',
        serviceName: 'General Consultation',
        serviceCode: 'CONSULT',
        description: 'General medical consultation with certified doctors',
        price: 120,
        isActive: true
      },
      {
        serviceId: 'SRV004',
        serviceName: 'COVID-19 Test',
        serviceCode: 'COVID',
        description: 'RT-PCR and rapid antigen testing for COVID-19',
        price: 75,
        isActive: true
      }
    ]
  }
];