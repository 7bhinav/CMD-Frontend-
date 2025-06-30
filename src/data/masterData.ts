import { Service } from '../types/clinic';

export const masterServices: Service[] = [
  {
    id: 'SRV001',
    name: 'General Consultation',
    code: 'CONSULT',
    description: 'General medical consultation with certified doctors',
    averagePrice: 150,
    isActive: true
  },
  {
    id: 'SRV002',
    name: 'X-Ray Imaging',
    code: 'XRAY',
    description: 'Digital X-ray imaging and diagnostic services',
    averagePrice: 200,
    isActive: true
  },
  {
    id: 'SRV003',
    name: 'Blood Test',
    code: 'BLOOD',
    description: 'Comprehensive blood testing and laboratory analysis',
    averagePrice: 100,
    isActive: true
  },
  {
    id: 'SRV004',
    name: 'COVID-19 Test',
    code: 'COVID',
    description: 'RT-PCR and rapid antigen testing for COVID-19',
    averagePrice: 75,
    isActive: true
  },
  {
    id: 'SRV005',
    name: 'MRI Scan',
    code: 'MRI',
    description: 'Magnetic Resonance Imaging for detailed diagnostics',
    averagePrice: 800,
    isActive: true
  }
];

export const usStates = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming'
];