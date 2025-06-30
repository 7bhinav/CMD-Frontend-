import React, { useState, useEffect } from 'react';
import { AlertCircle, Info, AlertTriangle, XCircle, Trash2, Filter } from 'lucide-react';
import { useLogger, LogEntry } from '../hooks/useLogger';

export const SystemLogs: React.FC = () => {
  const { logs, clearLogs } = useLogger();
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [filters, setFilters] = useState({
    type: 'all',
    priority: 'all',
    search: ''
  });

  useEffect(() => {
    let filtered = logs;

    if (filters.type !== 'all') {
      filtered = filtered.filter(log => log.type === filters.type);
    }

    if (filters.priority !== 'all') {
      filtered = filtered.filter(log => log.priority === filters.priority);
    }

    if (filters.search) {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(filters.search.toLowerCase()) ||
        log.className.toLowerCase().includes(filters.search.toLowerCase()) ||
        log.method.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  }, [logs, filters]);

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'Error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'Warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'Error':
        return 'border-l-red-500 bg-red-50';
      case 'Warning':
        return 'border-l-yellow-500 bg-yellow-50';
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  const getPriorityBadge = (priority: LogEntry['priority']) => {
    const colors = {
      Critical: 'bg-red-100 text-red-800',
      High: 'bg-orange-100 text-orange-800',
      Medium: 'bg-yellow-100 text-yellow-800',
      Low: 'bg-green-100 text-green-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[priority]}`}>
        {priority}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg mr-4">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">System Logs</h2>
              <p className="text-gray-600">Monitor system activities and errors</p>
            </div>
          </div>
          
          <button
            onClick={clearLogs}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center space-x-2"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear Logs</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="font-medium text-gray-700">Filters</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="Info">Info</option>
                <option value="Warning">Warning</option>
                <option value="Error">Error</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Search logs..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Log Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <Info className="h-6 w-6 text-blue-600 mr-2" />
              <div>
                <p className="text-2xl font-bold text-blue-900">
                  {logs.filter(l => l.type === 'Info').length}
                </p>
                <p className="text-blue-700 text-sm">Info</p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-yellow-600 mr-2" />
              <div>
                <p className="text-2xl font-bold text-yellow-900">
                  {logs.filter(l => l.type === 'Warning').length}
                </p>
                <p className="text-yellow-700 text-sm">Warnings</p>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center">
              <XCircle className="h-6 w-6 text-red-600 mr-2" />
              <div>
                <p className="text-2xl font-bold text-red-900">
                  {logs.filter(l => l.type === 'Error').length}
                </p>
                <p className="text-red-700 text-sm">Errors</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 text-gray-600 mr-2" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{logs.length}</p>
                <p className="text-gray-700 text-sm">Total Logs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Logs List */}
        <div className="space-y-3">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <div key={log.id} className={`border-l-4 rounded-lg p-4 ${getLogColor(log.type)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getLogIcon(log.type)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-medium text-gray-900">{log.message}</span>
                        {getPriorityBadge(log.priority)}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <span className="font-medium">Location:</span> {log.className}.{log.method}
                        </p>
                        <p>
                          <span className="font-medium">Time:</span> {new Date(log.timestamp).toLocaleString()}
                        </p>
                        <p>
                          <span className="font-medium">Project:</span> {log.project}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No logs found</h3>
              <p className="text-gray-600">
                {logs.length === 0 ? 'No system logs available' : 'No logs match your current filters'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};