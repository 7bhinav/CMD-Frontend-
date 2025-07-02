import { useState, useEffect } from 'react';
import { Clinic, CreateClinicRequest } from '../types/clinic';
import { apiService } from '../services/api';
import { useLogger } from './useLogger';

export const useClinicData = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { log } = useLogger();

  // Load all clinics from API
  const loadClinics = async () => {
    setIsLoading(true);
    log('Loading all clinics from API', 'Low', 'Info', 'useClinicData', 'loadClinics');
    
    try {
      const response = await apiService.getClinics();
      console.log('Raw API response in useClinicData:', response);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      const clinicsData = response.data || [];
      console.log('Processed clinics data:', {
        count: clinicsData.length,
        sample: clinicsData[0],
        allIds: clinicsData.map(c => c.clinicId)
      });
      
      setClinics(clinicsData);
      log(`Successfully loaded ${clinicsData.length} clinics`, 'Low', 'Info', 'useClinicData', 'loadClinics');
    } catch (error) {
      log(`Error loading clinics: ${error}`, 'High', 'Error', 'useClinicData', 'loadClinics');
      console.error('Failed to load clinics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClinics();
  }, []);

  // Search clinics by city using the new API endpoint
  const searchClinicsByCity = async (city: string): Promise<Clinic[]> => {
    log(`Searching clinics in city: ${city}`, 'Low', 'Info', 'useClinicData', 'searchClinicsByCity');
    
    try {
      const response = await apiService.getClinicsByCity(city);
      console.log('Search by city response:', response);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      const searchResults = response.data || [];
      console.log('Search results processed:', {
        city,
        count: searchResults.length,
        clinics: searchResults.map(c => ({ id: c.clinicId, name: c.name }))
      });
      
      log(`Found ${searchResults.length} clinics in ${city}`, 'Low', 'Info', 'useClinicData', 'searchClinicsByCity');
      return searchResults;
    } catch (error) {
      log(`Error searching clinics by city: ${error}`, 'High', 'Error', 'useClinicData', 'searchClinicsByCity');
      console.error('Failed to search clinics by city:', error);
      return [];
    }
  };

  // Get clinic by ID using the new API endpoint
  const getClinicById = async (clinicId: string): Promise<Clinic | null> => {
    log(`Fetching clinic by ID: ${clinicId}`, 'Low', 'Info', 'useClinicData', 'getClinicById');
    
    try {
      const response = await apiService.getClinicById(clinicId);
      if (response.error) {
        throw new Error(response.error);
      }
      
      log(`Successfully fetched clinic: ${response.data?.name}`, 'Low', 'Info', 'useClinicData', 'getClinicById');
      return response.data || null;
    } catch (error) {
      log(`Error fetching clinic by ID: ${error}`, 'High', 'Error', 'useClinicData', 'getClinicById');
      console.error('Failed to fetch clinic by ID:', error);
      return null;
    }
  };

  const addClinic = async (clinicData: CreateClinicRequest): Promise<boolean> => {
    log(`Adding new clinic: ${clinicData.name}`, 'Medium', 'Info', 'useClinicData', 'addClinic');
    
    try {
      const response = await apiService.createClinic(clinicData);
  
      if (response.error) {
        throw new Error(response.error);
      }
  
      // Refresh clinics list after adding
      await loadClinics();
  
      log('Clinic added successfully', 'Low', 'Info', 'useClinicData', 'addClinic');
      return true;
    } catch (error) {
      log(`Error adding clinic: ${error}`, 'High', 'Error', 'useClinicData', 'addClinic');
      console.error('Failed to add clinic:', error);
      return false;
    }
  };

  // Debug current state
  console.log('useClinicData current state:', {
    clinicsCount: clinics.length,
    isLoading,
    clinicIds: clinics.map(c => c.clinicId || (c as any).id)
  });

  return {
    clinics,
    isLoading,
    searchClinicsByCity,
    getClinicById,
    addClinic,
    refreshClinics: loadClinics,
  };
};