import React, { useState, useEffect } from 'react';
import api from '../lib/axios.js';
import { toast } from 'react-hot-toast';

const BackupManager = ({ isOpen, onClose }) => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [deleting, setDeleting] = useState(null); // Track which backup is being deleted

  // Fetch available backups
  const fetchBackups = async () => {
    try {
      setLoading(true);
      const response = await api.get('/backup/list');
      setBackups(response.data.backups || []);
    } catch (error) {
      console.error('Failed to fetch backups:', error);
      toast.error('Failed to load backups');
    } finally {
      setLoading(false);
    }
  };

  // Create new backup
  const createBackup = async () => {
    try {
      setCreating(true);
      const response = await api.post('/backup/create');
      
      if (response.data.success) {
        toast.success('Backup created successfully');
        fetchBackups(); // Refresh the list
      }
    } catch (error) {
      console.error('Backup creation failed:', error);
      toast.error('Failed to create backup');
    } finally {
      setCreating(false);
    }
  };

  // Restore from backup
  const restoreBackup = async (timestamp) => {
    const confirmRestore = window.confirm(
      `⚠️ WARNING: This will replace ALL current data with backup from ${new Date(timestamp.replace(/_/g, ' ').replace(/-/g, '/')).toLocaleString()}.\n\nThis action cannot be undone. Are you sure?`
    );
    
    if (!confirmRestore) return;

    try {
      setRestoring(true);
      const response = await api.post(`/backup/restore/${timestamp}`);
      
      if (response.data.success) {
        toast.success('Database restored successfully');
        // You might want to redirect or refresh the page after restore
        window.location.reload();
      }
    } catch (error) {
      console.error('Restore failed:', error);
      toast.error('Failed to restore backup');
    } finally {
      setRestoring(false);
    }
  };

  // Delete backup
  const deleteBackup = async (timestamp) => {
    const confirmDelete = window.confirm(
      `🗑️ Are you sure you want to delete the backup from ${new Date(timestamp.replace(/_/g, ' ').replace(/-/g, '/')).toLocaleString()}?\n\nThis action cannot be undone.`
    );
    
    if (!confirmDelete) return;

    try {
      setDeleting(timestamp);
      const response = await api.delete(`/backup/delete/${timestamp}`);
      
      if (response.data.success) {
        toast.success('Backup deleted successfully');
        fetchBackups(); // Refresh the list
      }
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete backup');
    } finally {
      setDeleting(null);
    }
  };

  // Load backups when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchBackups();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-2xl shadow-2xl w-[95vw] max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V7M4 7V4c0-1.1.9-2 2-2h12c0 1.1.9 2 2 2v3M4 7h16M8 11h8" />
            </svg>
            Database Backup Manager
          </h2>
          <button
            className="btn btn-circle btn-ghost"
            onClick={onClose}
            disabled={creating || restoring || deleting}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Create Backup Section */}
        <div className="bg-base-200 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-lg">Create New Backup</h3>
              <p className="text-sm text-gray-500">
                Backup all database collections (admins, batches, placement data, time restrictions)
              </p>
            </div>
            <button
              className={`btn btn-primary ${creating ? 'loading' : ''}`}
              onClick={createBackup}
              disabled={creating || restoring || deleting}
            >
              {creating ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Creating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Create Backup
                </>
              )}
            </button>
          </div>
        </div>

        {/* Backups List */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Available Backups</h3>
            <button
              className="btn btn-ghost btn-sm"
              onClick={fetchBackups}
              disabled={loading || creating || restoring || deleting}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : backups.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p>No backups available</p>
              <p className="text-sm">Create your first backup to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {backups.map((backup, index) => (
                <div key={backup.timestamp} className="bg-base-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-lg">
                          Backup #{backups.length - index}
                        </h4>
                        <div className="badge badge-primary badge-outline">
                          {backup.totalDocuments} documents
                        </div>
                        <div className="badge badge-secondary badge-outline">
                          {backup.sizeKB} KB
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <strong>Created:</strong> {backup.createdAt}
                        </div>
                        <div>
                          <strong>Timestamp:</strong> {backup.timestamp}
                        </div>
                      </div>
                      
                      {/* Collection Details */}
                      <div className="mt-3">
                        <details className="collapse collapse-arrow bg-base-100">
                          <summary className="collapse-title text-sm font-medium">
                            View Details ({Object.keys(backup.collections || {}).length} collections)
                          </summary>
                          <div className="collapse-content">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2">
                              {Object.entries(backup.collections || {}).map(([name, info]) => (
                                <div key={name} className="text-xs">
                                  <div className="font-medium capitalize">{name}</div>
                                  <div className="text-gray-500">
                                    {info.documentCount || 0} docs
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </details>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2 ml-4">
                      <button
                        className={`btn btn-warning btn-sm ${restoring ? 'loading' : ''}`}
                        onClick={() => restoreBackup(backup.timestamp)}
                        disabled={creating || restoring || deleting}
                        title="Restore this backup (WARNING: This will replace all current data)"
                      >
                        {restoring ? (
                          <>
                            <span className="loading loading-spinner loading-xs"></span>
                            Restoring...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Restore
                          </>
                        )}
                      </button>
                      
                      <button
                        className={`btn btn-error btn-sm ${deleting === backup.timestamp ? 'loading' : ''}`}
                        onClick={() => deleteBackup(backup.timestamp)}
                        disabled={creating || restoring || deleting}
                        title="Delete this backup permanently"
                      >
                        {deleting === backup.timestamp ? (
                          <>
                            <span className="loading loading-spinner loading-xs"></span>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Warning Notice */}
        <div className="mt-6 p-4 bg-warning/10 border border-warning/20 rounded-lg">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div className="text-sm">
              <div className="font-semibold text-warning">Important Notes:</div>
              <ul className="mt-1 text-gray-600 list-disc list-inside space-y-1">
                <li>Backups include all sensitive data - handle securely</li>
                <li>Restoring a backup will replace ALL current database data</li>
                <li>Deleting a backup permanently removes it from the server</li>
                <li>Always create a backup before major changes or updates</li>
                <li>Test restore procedures in development environment first</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupManager;