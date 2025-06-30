import { useState, useEffect } from 'react';
import { Service } from '../types/clinic';
import { apiService } from '../services/api';
import { useLogger } from './useLogger';

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { log } = useLogger();

  const loadServices = async () => {
    setIsLoading(true);
    log('Loading services from API', 'Low', 'Info', 'useServices', 'loadServices');
    
    try {
      const response = await apiService.getServices();
      if (response.error) {
        throw new Error(response.error);
      }
      
      setServices(response.data || []);
      log(`Successfully loaded ${response.data?.length || 0} services`, 'Low', 'Info', 'useServices', 'loadServices');
    } catch (error) {
      log(`Error loading services: ${error}`, 'High', 'Error', 'useServices', 'loadServices');
      console.error('Failed to load services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  return {
    services,
    isLoading,
    refreshServices: loadServices
  };
};