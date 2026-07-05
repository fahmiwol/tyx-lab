import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export default function UploadMonitor() {
  const [uploads, setUploads] = useState([]);
  const [socket, setSocket] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:9797';
    const newSocket = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    newSocket.on('upload:start', (data) => {
      setUploads(prev => [...prev, { 
        ...data, 
        status: 'uploading',
        progress: 0,
        startTime: Date.now()
      }]);
    });

    newSocket.on('upload:progress', (data) => {
      setUploads(prev => prev.map(u => 
        u.id === data.id ? { ...u, progress: data.progress } : u
      ));
    });

    newSocket.on('upload:complete', (data) => {
      setUploads(prev => prev.map(u => 
        u.id === data.id ? { ...u, status: 'complete', progress: 100 } : u
      ));
    });

    newSocket.on('upload:error', (data) => {
      setUploads(prev => prev.map(u => 
        u.id === data.id ? { ...u, status: 'error', error: data.error } : u
      ));
    });

    newSocket.on('queue:updated', (data) => {
      setUploads(data.uploads || []);
    });

    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'uploading': return 'bg-blue-50 border-blue-200';
      case 'complete': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const filteredUploads = uploads.filter(u => {
    if (filter === 'all') return true;
    return u.status === filter;
  });

  const stats = {
    total: uploads.length,
    uploading: uploads.filter(u => u.status === 'uploading').length,
    complete: uploads.filter(u => u.status === 'complete').length,
    failed: uploads.filter(u => u.status === 'error').length
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Upload Monitor</h1>
          <p className="text-gray-600">Real-time file upload tracking and queue management</p>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-gray-600 text-sm">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 shadow border border-blue-200">
            <p className="text-blue-600 text-sm">Uploading</p>
            <p className="text-2xl font-bold text-blue-700">{stats.uploading}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 shadow border border-green-200">
            <p className="text-green-600 text-sm">Complete</p>
            <p className="text-2xl font-bold text-green-700">{stats.complete}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 shadow border border-red-200">
            <p className="text-red-600 text-sm">Failed</p>
            <p className="text-2xl font-bold text-red-700">{stats.failed}</p>
          </div>
        </div>

        <div className="mb-6 flex gap-2">
          {['all', 'uploading', 'complete', 'error'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filteredUploads.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center text-gray-500">
              No uploads in this category
            </div>
          ) : (
            filteredUploads.map(upload => (
              <div
                key={upload.id}
                className={`rounded-lg border p-4 ${getStatusColor(upload.status)} shadow-sm`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold truncate">{upload.filename}</h3>
                    <div className="flex gap-4 text-sm text-gray-600 mt-1">
                      <span>{formatSize(upload.filesize)}</span>
                      <span>{upload.status}</span>
                    </div>
                  </div>
                </div>

                {(upload.status === 'uploading' || upload.status === 'complete') && (
                  <div className="mb-3">
                    <div className="w-full bg-gray-300 rounded-full h-2">
                      <div
                        className={`h-full transition-all ${
                          upload.status === 'complete' ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${upload.progress || 0}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{upload.progress || 0}%</p>
                  </div>
                )}

                {upload.status === 'error' && upload.error && (
                  <div className="mt-2 p-2 bg-red-100 rounded text-sm text-red-700">
                    {upload.error}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
