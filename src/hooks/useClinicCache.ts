import { useState, useEffect } from 'react';
import { Clinic, SearchFilters, CreateClinicRequest } from '../types/clinic';
import { apiService } from '../services/api';
import { useLogger } from './useLogger';

export const useClinicCache = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cache, setCache] = useState<Map<string, Clinic[]>>(new Map());
  const { log } = useLogger();

  // Load clinics from API
  const loadClinics = async () => {
    setIsLoading(true);
    log('Loading clinics from API', 'Low', 'Info', 'useClinicCache', 'loadClinics');
    
    try {
      const response = await apiService.getClinics();
      if (response.error) {
        throw new Error(response.error);
      }
      
      setClinics(response.data || []);
      log(`Successfully loaded ${response.data?.length || 0} clinics`, 'Low', 'Info', 'useClinicCache', 'loadClinics');
    } catch (error) {
      log(`Error loading clinics: ${error}`, 'High', 'Error', 'useClinicCache', 'loadClinics');
      console.error('Failed to load clinics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClinics();
  }, []);

  const searchClinics = async (filters: SearchFilters): Promise<Clinic[]> => {
    const cacheKey = JSON.stringify(filters);

    // Check cache first
    if (cache.has(cacheKey)) {
      log('Cache hit for search filters', 'Low', 'Info', 'useClinicCache', 'searchClinics');
      return cache.get(cacheKey) || [];
    }

    log('Cache miss - searching via API', 'Low', 'Info', 'useClinicCache', 'searchClinics');

    try {
      // For now, return filtered clinics from current data
      // In future, this could be a dedicated search API endpoint
      const filtered = clinics.filter(clinic => {
        if (filters.city && !clinic.city.toLowerCase().includes(filters.city.toLowerCase())) {
          return false;
        }
        if (filters.state && !clinic.state.toLowerCase().includes(filters.state.toLowerCase())) {
          return false;
        }
        if (filters.searchTerm) {
          const searchLower = filters.searchTerm.toLowerCase();
          if (!clinic.name.toLowerCase().includes(searchLower) && 
              !clinic.businessName.toLowerCase().includes(searchLower)) {
            return false;
          }
        }
        return true;
      });

      // Cache the result
      setCache(prev => new Map(prev).set(cacheKey, filtered));
      log(`Cached search result with ${filtered.length} clinics`, 'Low', 'Info', 'useClinicCache', 'searchClinics');

      return filtered;
    } catch (error) {
      log(`Error searching clinics: ${error}`, 'High', 'Error', 'useClinicCache', 'searchClinics');
      console.error('Failed to search clinics:', error);
      return [];
    }
  };

  const addClinic = async (clinicData: CreateClinicRequest): Promise<boolean> => {
    log(`Adding new clinic: ${clinicData.name}`, 'Medium', 'Info', 'useClinicCache', 'addClinic');
    
    try {
      const response = await apiService.createClinic(clinicData);
  
      if (response.error) {
        throw new Error(response.error);
      }
  
      // Refresh clinics list and clear cache
      await loadClinics();
      setCache(new Map());
  
      log('Clinic added successfully and cache cleared', 'Low', 'Info', 'useClinicCache', 'addClinic');
      return true;
    } catch (error) {
      log(`Error adding clinic: ${error}`, 'High', 'Error', 'useClinicCache', 'addClinic');
      console.error('Failed to add clinic:', error);
      return false;
    }
  };

  const getCacheStats = () => ({
    size: cache.size,
    keys: Array.from(cache.keys())
  });

  return {
    clinics,
    isLoading,
    searchClinics,
    addClinic,
    getCacheStats,
    refreshClinics: loadClinics,
  };
};