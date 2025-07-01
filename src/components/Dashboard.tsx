import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, MapPin, DollarSign, Activity, Loader2 } from 'lucide-react';
import { Clinic } from '../types/clinic';
import { useClinicData } from '../hooks/useClinicData';
import { useServices } from '../hooks/useServices';

export const Dashboard: React.FC = () => {
  const { clinics, isLoading, searchClinicsByCity, getClinicById } = useClinicData();
  const { services } = useServices();
  const [filteredClinics, setFilteredClinics] = useState<Clinic[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Debug current data
  console.log('Dashboard render:', {
    clinicsCount: clinics.length,
    filteredClinicsCount: filteredClinics.length,
    isLoading,
    searchTerm,
    cityFilter,
    stateFilter
  });

  useEffect(() => {
    console.log('Setting filtered clinics from clinics:', clinics.length);
    setFilteredClinics(clinics);
  }, [clinics]);

  // Client-side filtering for basic search
  const clientSideFilteredClinics = useMemo(() => {
    console.log('Computing client-side filtered clinics...');
    const filtered = clinics.filter(clinic => {
      const matchesSearch = !searchTerm || 
        clinic.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clinic.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (clinic.clinicId || (clinic as any).id)?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCity = !cityFilter || 
        clinic.city?.toLowerCase().includes(cityFilter.toLowerCase());
      
      const matchesState = !stateFilter || 
        clinic.state?.toLowerCase().includes(stateFilter.toLowerCase());
      
      return matchesSearch && matchesCity && matchesState;
    });
    
    console.log('Client-side filtering result:', {
      totalClinics: clinics.length,
      filteredCount: filtered.length,
      filters: { searchTerm, cityFilter, stateFilter }
    });
    
    return filtered;
  }, [clinics, searchTerm, cityFilter, stateFilter]);

  // Smart search function that tries client-side first, then API
  const performSmartSearch = async () => {
    console.log('Starting smart search...');
    setIsSearching(true);
    
    try {
      // If we have results from client-side filtering, use those
      if (clientSideFilteredClinics.length > 0) {
        console.log('Using client-side results:', clientSideFilteredClinics.length);
        setFilteredClinics(clientSideFilteredClinics);
        setIsSearching(false);
        return;
      }

      // If no client-side results and we have a city filter, try API search
      if (cityFilter.trim()) {
        console.log('No client-side results, trying API search for city:', cityFilter);
        const apiResults = await searchClinicsByCity(cityFilter.trim());
        console.log('API search returned:', apiResults.length, 'results');
        
        // Apply additional filters to API results
        const finalResults = apiResults.filter(clinic => {
          const matchesSearch = !searchTerm || 
            clinic.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            clinic.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (clinic.clinicId || (clinic as any).id)?.toLowerCase().includes(searchTerm.toLowerCase());
          
          const matchesState = !stateFilter || 
            clinic.state?.toLowerCase().includes(stateFilter.toLowerCase());
          
          return matchesSearch && matchesState;
        });

        console.log('Final API results after additional filtering:', finalResults.length);
        setFilteredClinics(finalResults);
      } else {
        // No city filter and no client results, show empty
        console.log('No city filter and no client results, showing empty');
        setFilteredClinics([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setFilteredClinics(clientSideFilteredClinics);
    } finally {
      setIsSearching(false);
    }
  };

  // Trigger search when filters change
  useEffect(() => {
    console.log('Filters changed, debouncing search...');
    const timeoutId = setTimeout(() => {
      performSmartSearch();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm, cityFilter, stateFilter, clientSideFilteredClinics]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSmartSearch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Debug Info (Remove in production) */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
        <strong>Debug Info:</strong> 
        Total Clinics: {clinics.length}, 
        Filtered: {filteredClinics.length}, 
        Loading: {isLoading ? 'Yes' : 'No'},
        Searching: {isSearching ? 'Yes' : 'No'}
      </div>

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
              <p className="text-sm font-medium text-gray-600">Showing Results</p>
              <p className="text-2xl font-semibold text-gray-900">{filteredClinics.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSearchSubmit}>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by clinic name, business name, or clinic ID..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                </div>
              )}
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              type="button"
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
            >
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </button>
          </div>
        </form>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City (Smart Search)
              </label>
              <input
                type="text"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                placeholder="Enter city name - will search API if not found locally"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Searches locally first, then uses cached API if no matches
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
              <input
                type="text"
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                placeholder="Enter state name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Search Info */}
        {(searchTerm || cityFilter || stateFilter) && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              {clientSideFilteredClinics.length > 0 ? (
                <span>✓ Found results in loaded data</span>
              ) : cityFilter ? (
                <span>🔍 Searching API for "{cityFilter}" - results are cached for performance</span>
              ) : (
                <span>ℹ️ No matches in current data. Try adding a city filter for API search.</span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Clinics ({filteredClinics.length} found)
          </h2>
          {isSearching && (
            <div className="flex items-center text-blue-600">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm">Searching...</span>
            </div>
          )}
        </div>

        <div className="grid gap-6">
          {filteredClinics.map((clinic, index) => {
            console.log('Rendering clinic:', index, clinic);
            return (
              <div key={clinic.clinicId || (clinic as any).id || index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {clinic.name || 'No Name'}
                        </h3>
                        <p className="text-gray-600 mb-2">{clinic.businessName || 'No Business Name'}</p>
                        <div className="flex items-center text-gray-500 mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="text-sm">
                            {clinic.streetAddress}, {clinic.city}, {clinic.state} {clinic.zipCode}
                          </span>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {clinic.clinicId || (clinic as any).id || 'No ID'}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Services Offered</h4>
                      {clinic.services && clinic.services.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {clinic.services.filter(service => service.isOffered).map((service, serviceIndex) => (
                            <div key={service.serviceId || serviceIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
                      ) : (
                        <p className="text-gray-500">No services configured</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredClinics.length === 0 && !isSearching && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No clinics found</h3>
            <p className="text-gray-600">
              {searchTerm || cityFilter || stateFilter ? (
                <>Try adjusting your search criteria or check a different city</>
              ) : (
                <>Start typing to search for clinics</>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};