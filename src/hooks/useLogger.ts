import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

export interface LogEntry {
  id: string;
  message: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  type: 'Info' | 'Warning' | 'Error';
  timestamp: string;
  project: string;
  className: string;
  method: string;
}

export const useLogger = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load logs from API
  const loadLogs = async (filters?: { type?: string; priority?: string; limit?: number }) => {
    setIsLoading(true);
    try {
      const response = await apiService.getLogs(filters);
      if (response.error) {
        throw new Error(response.error);
      }
      setLogs(response.data || []);
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load logs on component mount
  useEffect(() => {
    loadLogs();
  }, []);

  const log = (
    message: string,
    priority: LogEntry['priority'] = 'Low',
    type: LogEntry['type'] = 'Info',
    className: string = 'Unknown',
    method: string = 'Unknown'
  ) => {
    // Create local log entry for immediate UI update
    const entry: LogEntry = {
      id: Date.now().toString(),
      message,
      priority,
      type,
      timestamp: new Date().toISOString(),
      project: 'CMD-Telehealth',
      className,
      method
    };

    // Add to local state immediately
    setLogs(prev => [entry, ...prev.slice(0, 99)]);
    
    // Log to console with appropriate level
    const consoleMessage = `[${entry.type}] ${entry.className}.${entry.method}: ${message}`;
    switch (type) {
      case 'Error':
        console.error(consoleMessage);
        break;
      case 'Warning':
        console.warn(consoleMessage);
        break;
      default:
        console.log(consoleMessage);
    }

    // Note: In a real application, you might want to send logs to the server
    // For this demo, logs are generated server-side through API calls
  };

  const clearLogs = async () => {
    try {
      const response = await apiService.clearLogs();
      if (response.error) {
        throw new Error(response.error);
      }
      setLogs([]);
      console.log('Logs cleared successfully');
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  };

  return { 
    logs, 
    log, 
    clearLogs, 
    loadLogs, 
    isLoading 
  };
};