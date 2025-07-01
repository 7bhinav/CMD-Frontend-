import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Calendar, DollarSign, Activity } from 'lucide-react';
import { Clinic } from '../types/clinic';
import { useClinicCache } from '../hooks/useClinicCache';
import { useServices } from '../hooks/useServices';

export const Dashboard: React.FC = () => {
  const { clinics, isLoading, getCacheStats } = useClinicCache();
  const { services } = useServices();
  const [filteredClinics, setFilteredClinics] = useState<Clinic[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setFilteredClinics(clinics);
  }, [clinics]);

  const cacheStats = getCacheStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Clinics</p>
              <p className="text-2xl font-semibold text-gray-900">{clinics.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <MapPin className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Cities Covered</p>
              <p className="text-2xl font-semibold text-gray-900">
                {new Set(clinics.map(c => c.city)).size}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Service Price</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${services.length > 0 ? Math.round(services.reduce((acc, s) => acc + s.averagePrice, 0) / services.length) : 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Activity className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Cache Entries</p>
              <p className="text-2xl font-semibold text-gray-900">{cacheStats.size}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search clinics by name or business..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
          >
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input
                type="text"
                placeholder="Enter city name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
              <input
                type="text"
                placeholder="Enter state name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Services</label>
              <select
                multiple
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {services.map(service => (
                  <option key={service.serviceId} value={service.serviceId}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Clinics ({filteredClinics.length} found)
          </h2>
        </div>

        <div className="grid gap-6">
          {filteredClinics.map((clinic) => (
            <div key={clinic.clinicId} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {clinic.name}
                      </h3>
                      <p className="text-gray-600 mb-2">{clinic.businessName}</p>
                      <div className="flex items-center text-gray-500 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">
                          {clinic.streetAddress}, {clinic.city}, {clinic.state} {clinic.zipCode}
                        </span>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {clinic.clinicId}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Services Offered</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {clinic.services.filter(service => service.isOffered).map((service) => (
                        <div key={service.serviceId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{service.serviceName}</p>
                            <p className="text-sm text-gray-600">{service.serviceCode}</p>
                            <p className="text-xs text-gray-500">{service.serviceDescription}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">
                              ${service.customPrice || service.defaultPrice}
                            </p>
                            {service.customPrice && (
                              <p className="text-xs text-gray-500">
                                Default: ${service.defaultPrice}
                              </p>
                            )}
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              service.isOffered ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {service.isOffered ? 'Available' : 'Not Available'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredClinics.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No clinics found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};