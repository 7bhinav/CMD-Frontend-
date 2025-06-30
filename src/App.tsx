import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { AddClinicForm } from './components/AddClinicForm';
import { ServicesManager } from './components/ServicesManager';
import { SystemLogs } from './components/SystemLogs';
import { useLogger } from './hooks/useLogger';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { log } = useLogger();

  useEffect(() => {
    // Log application startup
    log('CMD Telehealth Platform initialized successfully', 'Low', 'Info', 'App', 'useEffect');
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    log(`Navigation: Switched to ${tab} tab`, 'Low', 'Info', 'App', 'handleTabChange');
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'add-clinic':
        return <AddClinicForm />;
      case 'services':
        return <ServicesManager />;
      case 'logs':
        return <SystemLogs />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} onTabChange={handleTabChange} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderActiveTab()}
      </main>
    </div>
  );
}

export default App;