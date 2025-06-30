import { useState, useEffect } from 'react';
import { Clinic, SearchFilters } from '../types/clinic';
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
      // Placeholder for future API integration
      const results: Clinic[] = []; // Empty results for now

      // Cache the result
      setCache(prev => new Map(prev).set(cacheKey, results));
      log(`Cached search result with ${results.length} clinics`, 'Low', 'Info', 'useClinicCache', 'searchClinics');

      return results;
    } catch (error) {
      log(`Error searching clinics: ${error}`, 'High', 'Error', 'useClinicCache', 'searchClinics');
      console.error('Failed to search clinics:', error);
      return [];
    }
  };

  const getLogs = async (): Promise<any[]> => {
    log('Fetching logs from API', 'Low', 'Info', 'useClinicCache', 'getLogs');
  
    try {
      const response = await apiService.request('/logs', {
        method: 'GET',
      });
  
      if (response.error) {
        throw new Error(response.error);
      }
  
      log(`Successfully fetched ${response.data?.length || 0} logs`, 'Low', 'Info', 'useClinicCache', 'getLogs');
      return response.data || [];
    } catch (error) {
      log(`Error fetching logs: ${error}`, 'High', 'Error', 'useClinicCache', 'getLogs');
      console.error('Failed to fetch logs:', error);
      return [];
    }
  };

  const addClinic = async (clinicData: any): Promise<boolean> => {
    log(`Adding new clinic: ${clinicData.name}`, 'Medium', 'Info', 'useClinicCache', 'addClinic');
    
    try {
      const response = await apiService.request('/clinic-create', {
        method: 'POST',
        body: JSON.stringify(clinicData),
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
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
    getLogs, // Added method to fetch logs
  };
};