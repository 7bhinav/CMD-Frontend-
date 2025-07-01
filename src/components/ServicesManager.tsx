import React from 'react';
import { Activity, DollarSign, Code, FileText } from 'lucide-react';
import { useServices } from '../hooks/useServices';

export const ServicesManager: React.FC = () => {
  const { services, isLoading } = useServices();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <div className="p-2 bg-purple-100 rounded-lg mr-4">
            <Activity className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Service Catalog</h2>
            <p className="text-gray-600">Master data for all available medical services</p>
          </div>
        </div>

        {/* Service Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-blue-900">{services.length}</p>
                <p className="text-blue-700 text-sm">Total Services</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-green-900">
                  ${services.length > 0 ? Math.round(services.reduce((acc, s) => acc + s.averagePrice, 0) / services.length) : 0}
                </p>
                <p className="text-green-700 text-sm">Avg. Price</p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-purple-900">
                  {services.filter(s => s.isActive).length}
                </p>
                <p className="text-purple-700 text-sm">Active Services</p>
              </div>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid gap-6">
          {services.map((service) => (
            <div key={service.serviceId} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{service.name}</h3>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {service.code}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          service.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {service.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{service.description}</p>
                      
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center text-green-600">
                          <DollarSign className="h-5 w-5 mr-1" />
                          <span className="font-semibold">${service.averagePrice}</span>
                          <span className="text-gray-500 ml-1">avg. price</span>
                        </div>
                        
                        <div className="flex items-center text-gray-500">
                          <Code className="h-5 w-5 mr-1" />
                          <span className="text-sm">ID: {service.serviceId}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Service Details */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Service Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Service Code:</span>
                        <span className="ml-2 text-gray-600">{service.code}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Base Price:</span>
                        <span className="ml-2 text-gray-600">${service.averagePrice}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Status:</span>
                        <span className="ml-2 text-gray-600">
                          {service.isActive ? 'Available' : 'Not Available'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Service ID:</span>
                        <span className="ml-2 text-gray-600">{service.serviceId}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Service Integration Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start">
          <FileText className="h-6 w-6 text-blue-600 mr-3 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Service Integration</h3>
            <p className="text-blue-800 mb-3">
              These services represent the master catalog available in the CMD platform. Each clinic can configure which services they offer with custom pricing.
            </p>
            <div className="space-y-2 text-sm text-blue-700">
              <p>• Services are cached for optimal performance during clinic searches</p>
              <p>• Pricing can be customized per clinic while maintaining service standardization</p>
              <p>• Service status can be toggled at both master and clinic levels</p>
              <p>• Service codes are used for integration with external systems and billing</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};