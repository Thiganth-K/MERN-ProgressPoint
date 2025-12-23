import React, { useState, useEffect } from 'react';
import api from '../lib/axios';
import { 
  FiLogIn, 
  FiLogOut, 
  FiCheck, 
  FiEye, 
  FiEdit, 
  FiBarChart2, 
  FiAward, 
  FiSearch, 
  FiDownload, 
  FiUsers, 
  FiBook, 
  FiActivity,
  FiX,
  FiFilter,
  FiClock
} from 'react-icons/fi';

const AdminLogsModal = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterAdmin, setFilterAdmin] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/superadmin/logs');
      setLogs(res.data.logs || []);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAllLogs = async () => {
    if (!window.confirm('Are you sure you want to clear all admin logs?')) return;
    try {
      await api.delete('/superadmin/logs');
      setLogs([]);
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  };

  // Flatten and process logs
  const processedLogs = logs
    .flatMap((adminLog) =>
      (adminLog.logs || []).map((log) => ({
        adminName: adminLog.adminName,
        ...log,
      }))
    )
    .filter((log) => {
      if (filterAdmin && !log.adminName.toLowerCase().includes(filterAdmin.toLowerCase())) {
        return false;
      }
      if (filterAction && !log.type.toLowerCase().includes(filterAction.toLowerCase())) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.timestamp) - new Date(a.timestamp);
      } else {
        return new Date(a.timestamp) - new Date(b.timestamp);
      }
    });

  // Get unique admin names and action types for filters
  const adminNames = [...new Set(logs.map(l => l.adminName))];
  const actionTypes = [...new Set(logs.flatMap(l => l.logs.map(log => log.type)))];

  const formatActionType = (type) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getActionIcon = (type) => {
    const iconProps = { className: "w-5 h-5" };
    
    const icons = {
      login: <FiLogIn {...iconProps} />,
      logout: <FiLogOut {...iconProps} />,
      mark_attendance: <FiCheck {...iconProps} />,
      view_attendance: <FiEye {...iconProps} />,
      update_marks: <FiEdit {...iconProps} />,
      view_marks: <FiBarChart2 {...iconProps} />,
      view_leaderboard: <FiAward {...iconProps} />,
      search_student: <FiSearch {...iconProps} />,
      export_data: <FiDownload {...iconProps} />,
      view_batch_students: <FiUsers {...iconProps} />,
      batch_selection: <FiBook {...iconProps} />
    };
    return icons[type] || <FiActivity {...iconProps} />;
  };

  const getActionColor = (type) => {
    const colors = {
      login: 'text-green-600',
      logout: 'text-red-600',
      mark_attendance: 'text-blue-600',
      view_attendance: 'text-indigo-600',
      update_marks: 'text-purple-600',
      view_marks: 'text-pink-600',
      view_leaderboard: 'text-yellow-600',
      search_student: 'text-cyan-600',
      export_data: 'text-orange-600',
      view_batch_students: 'text-teal-600',
      batch_selection: 'text-gray-600'
    };
    return colors[type] || 'text-gray-600';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-base-300">
          <h2 className="text-2xl font-bold text-primary">Admin Activity Logs</h2>
          <div className="flex gap-2">
            <button
              onClick={handleClearAllLogs}
              className="btn btn-error btn-sm"
            >
              <FiX className="w-4 h-4 mr-2" />
              Clear All
            </button>
            <button
              onClick={onClose}
              className="btn btn-sm btn-circle btn-ghost"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 bg-base-200 border-b border-base-300">
          <div className="flex items-center gap-2 mb-3">
            <FiFilter className="w-5 h-5 text-primary" />
            <span className="font-medium text-primary">Filters</span>
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-1 block">Filter by Admin</label>
              <select
                value={filterAdmin}
                onChange={(e) => setFilterAdmin(e.target.value)}
                className="select select-sm select-bordered w-full"
              >
                <option value="">All Admins</option>
                {adminNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-1 block">Filter by Action</label>
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="select select-sm select-bordered w-full"
              >
                <option value="">All Actions</option>
                {actionTypes.map(type => (
                  <option key={type} value={type}>{formatActionType(type)}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="text-sm font-medium mb-1 block">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="select select-sm select-bordered w-full"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="p-4 bg-base-100 border-b border-base-300">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="stat">
              <div className="stat-title text-xs">Total Logs</div>
              <div className="stat-value text-lg">{processedLogs.length}</div>
            </div>
            <div className="stat">
              <div className="stat-title text-xs">Active Admins</div>
              <div className="stat-value text-lg">{adminNames.length}</div>
            </div>
            <div className="stat">
              <div className="stat-title text-xs">Action Types</div>
              <div className="stat-value text-lg">{actionTypes.length}</div>
            </div>
            <div className="stat">
              <div className="stat-title text-xs">Today's Actions</div>
              <div className="stat-value text-lg">
                {processedLogs.filter(log => 
                  new Date(log.timestamp).toDateString() === new Date().toDateString()
                ).length}
              </div>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : processedLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FiActivity className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No logs found</p>
              <p className="text-sm">Admin actions will appear here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {processedLogs.map((log, index) => (
                <div
                  key={index}
                  className="bg-base-200 rounded-lg p-4 hover:bg-base-300 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-base-300">
                      {getActionIcon(log.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-primary">{log.adminName}</span>
                        <span className={`font-medium ${getActionColor(log.type)}`}>
                          {formatActionType(log.type)}
                        </span>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <FiClock className="w-3 h-3" />
                          <span>{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                      
                      {log.details && (
                        <div className="text-sm text-gray-600 space-y-1">
                          {log.details.batchName && (
                            <div>
                              <span className="font-medium">Batch:</span> {log.details.batchName}
                            </div>
                          )}
                          {log.details.studentRegNo && (
                            <div>
                              <span className="font-medium">Student:</span> {log.details.studentRegNo}
                            </div>
                          )}
                          {log.details.action && (
                            <div>
                              <span className="font-medium">Action:</span> {log.details.action}
                            </div>
                          )}
                          {log.details.metadata && (
                            <div className="mt-2">
                              <details className="collapse collapse-arrow bg-base-300 rounded">
                                <summary className="collapse-title text-xs font-medium">
                                  View Details
                                </summary>
                                <div className="collapse-content">
                                  <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                                    {JSON.stringify(log.details.metadata, null, 2)}
                                  </pre>
                                </div>
                              </details>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogsModal;