import React, { useState, useEffect } from 'react';
import { Plus, Trash2, MapPin, Building, Save } from 'lucide-react';
import { Service, CreateClinicRequest } from '../types/clinic';
import { usStates } from '../data/masterData';
import { useClinicData } from '../hooks/useClinicData';
import { useLogger } from '../hooks/useLogger';
import { apiService } from '../services/api';

interface SelectedService {
  serviceId: string;
  name: string;
  code: string;
  averagePrice: number;
  customPrice?: number;
}

export const AddClinicForm: React.FC = () => {
  const { addClinic } = useClinicData();
  const { log } = useLogger();

  // Load services from API instead of predefined
  const [services, setServices] = useState<Service[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);

  const [formData, setFormData] = useState({
    name: '', // Changed from clinicName to name
    businessName: '',
    streetAddress: '',
    city: '',
    state: '',
    country: 'USA', // Changed from 'United States' to 'USA'
    zipCode: '',
    latitude: '',
    longitude: ''
  });

  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load services on component mount
  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setIsLoadingServices(true);
    try {
      const response = await apiService.getServices();
      if (response.data) {
        setServices(response.data.filter(service => service.isActive));
      } else {
        log(`Error loading services: ${response.error}`, 'High', 'Error', 'AddClinicForm', 'loadServices');
      }
    } catch (error) {
      log(`Error loading services: ${error}`, 'High', 'Error', 'AddClinicForm', 'loadServices');
    } finally {
      setIsLoadingServices(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Clinic name is required';
    if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required';
    if (!formData.streetAddress.trim()) newErrors.streetAddress = 'Street address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode)) newErrors.zipCode = 'Invalid ZIP code format';

    if (selectedServices.length === 0) {
      newErrors.services = 'At least one service must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addService = (serviceId: string) => {
    const masterService = services.find(s => s.serviceId === serviceId);
    if (!masterService) return;

    const newService: SelectedService = {
      serviceId: masterService.serviceId,
      name: masterService.name,
      code: masterService.code,
      averagePrice: masterService.averagePrice,
      customPrice: masterService.averagePrice
    };

    setSelectedServices(prev => [...prev, newService]);
    if (errors.services) {
      setErrors(prev => ({ ...prev, services: '' }));
    }
  };

  const handleServiceSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedServiceId = e.target.value;
    if (selectedServiceId) {
      addService(selectedServiceId);
      e.target.value = ''; // Reset dropdown after selection
    }
  };

  const removeService = (serviceId: string) => {
    setSelectedServices(prev => prev.filter(s => s.serviceId !== serviceId));
  };

  const updateServicePrice = (serviceId: string, price: number) => {
    setSelectedServices(prev =>
      prev.map(s => (s.serviceId === serviceId ? { ...s, customPrice: price } : s))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      log('Form validation failed', 'Medium', 'Warning', 'AddClinicForm', 'handleSubmit');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the clinic data in the new API format
      const clinicData: CreateClinicRequest = {
        name: formData.name,
        businessName: formData.businessName,
        streetAddress: formData.streetAddress,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        zipCode: formData.zipCode,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        serviceIds: selectedServices.map(s => s.serviceId),
        customPrices: selectedServices.reduce((acc, service) => {
          if (service.customPrice && service.customPrice !== service.averagePrice) {
            acc[service.serviceId] = service.customPrice;
          }
          return acc;
        }, {} as Record<string, number>)
      };

      console.log('Payload being sent to API:', clinicData);

      const success = await addClinic(clinicData);

      if (success) {
        log(`New clinic added successfully: ${clinicData.name}`, 'Low', 'Info', 'AddClinicForm', 'handleSubmit');

        // Reset form
        setFormData({
          name: '',
          businessName: '',
          streetAddress: '',
          city: '',
          state: '',
          country: 'USA',
          zipCode: '',
          latitude: '',
          longitude: ''
        });
        setSelectedServices([]);

        alert('Clinic added successfully!');
      } else {
        throw new Error('Failed to add clinic');
      }
    } catch (error) {
      log(`Error adding clinic: ${error}`, 'High', 'Error', 'AddClinicForm', 'handleSubmit');
      alert('Failed to add clinic. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableServices = services.filter(service => 
    !selectedServices.find(selected => selected.serviceId === service.serviceId)
  );

  if (isLoadingServices) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center mb-6">
          <div className="p-2 bg-blue-100 rounded-lg mr-4">
            <Building className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add New Clinic</h2>
            <p className="text-gray-600">Create a new clinic entry in the CMD platform</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Clinic Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter clinic name"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Name *</label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.businessName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter business name"
                />
                {errors.businessName && <p className="mt-1 text-sm text-red-600">{errors.businessName}</p>}
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
                <input
                  type="text"
                  value={formData.streetAddress}
                  onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.streetAddress ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter street address"
                />
                {errors.streetAddress && <p className="mt-1 text-sm text-red-600">{errors.streetAddress}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter city"
                  />
                  {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                  <select
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.state ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select state</option>
                    {usStates.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code *</label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.zipCode ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="12345 or 12345-6789"
                  />
                  {errors.zipCode && <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>}
                </div>
              </div>

              {/* Optional coordinates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Latitude (Optional)</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => handleInputChange('latitude', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter latitude"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Longitude (Optional)</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => handleInputChange('longitude', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter longitude"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Services Configuration */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Services Configuration</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Add Service</label>
              <select
                onChange={handleServiceSelection}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a service to add</option>
                {availableServices.map(service => (
                  <option key={service.serviceId} value={service.serviceId}>
                    {service.name} ({service.code}) - Default: ${service.averagePrice}
                  </option>
                ))}
              </select>
              {errors.services && <p className="mt-1 text-sm text-red-600">{errors.services}</p>}
            </div>

            {selectedServices.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Selected Services</h4>
                {selectedServices.map((service) => (
                  <div key={service.serviceId} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h5 className="font-medium text-gray-900">{service.name}</h5>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                            {service.code}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">Default Price: ${service.averagePrice}</p>

                        <div className="flex items-center space-x-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Custom Price ($)</label>
                            <input
                              type="number"
                              value={service.customPrice || ''}
                              onChange={(e) => updateServicePrice(service.serviceId, Number(e.target.value))}
                              className="w-32 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              min="0"
                              step="0.01"
                              placeholder={service.averagePrice.toString()}
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeService(service.serviceId)}
                        className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedServices.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Plus className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No services selected yet. Add services from the dropdown above.</p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting || selectedServices.length === 0}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Adding Clinic...</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>Add Clinic</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};