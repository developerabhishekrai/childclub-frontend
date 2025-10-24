'use client';

import React, { useState, useEffect } from 'react';
import { getStoredToken } from '@/lib/api';

interface Class {
  id: number;
  name: string;
  grade: string;
  section: string;
  academicYear: string;
  maxStudents: number;
  currentStudents?: number;
  status: string;
}

export default function TestClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    testClassesAPI();
  }, []);

  const testClassesAPI = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getStoredToken();
      console.log('Token available:', !!token);
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Test direct fetch
      console.log('Testing classes API...');
      const response = await fetch('http://localhost:3001/classes', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      setDebugInfo({
        status: response.status,
        ok: response.ok,
        dataType: typeof data,
        isArray: Array.isArray(data),
        dataLength: Array.isArray(data) ? data.length : 'N/A',
        data: data
      });

      if (Array.isArray(data)) {
        setClasses(data);
      } else {
        throw new Error('Response is not an array');
      }

    } catch (err: any) {
      console.error('Error testing classes API:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="card">
            <div className="card-header">
              <h3 className="mb-0">Classes API Test Page</h3>
            </div>
            <div className="card-body">
              {loading && (
                <div className="text-center py-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Testing Classes API...</p>
                </div>
              )}

              {error && (
                <div className="alert alert-danger">
                  <h5>Error:</h5>
                  <p>{error}</p>
                  <button className="btn btn-primary" onClick={testClassesAPI}>
                    Retry
                  </button>
                </div>
              )}

              {debugInfo && (
                <div className="alert alert-info">
                  <h5>Debug Information:</h5>
                  <ul>
                    <li><strong>Status:</strong> {debugInfo.status}</li>
                    <li><strong>OK:</strong> {debugInfo.ok ? 'Yes' : 'No'}</li>
                    <li><strong>Data Type:</strong> {debugInfo.dataType}</li>
                    <li><strong>Is Array:</strong> {debugInfo.isArray ? 'Yes' : 'No'}</li>
                    <li><strong>Data Length:</strong> {debugInfo.dataLength}</li>
                  </ul>
                </div>
              )}

              {classes.length > 0 && (
                <div className="alert alert-success">
                  <h5>Success! Found {classes.length} classes:</h5>
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Grade</th>
                          <th>Section</th>
                          <th>Academic Year</th>
                          <th>Max Students</th>
                          <th>Current Students</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classes.map((cls) => (
                          <tr key={cls.id}>
                            <td>{cls.id}</td>
                            <td>{cls.name}</td>
                            <td>{cls.grade}</td>
                            <td>{cls.section}</td>
                            <td>{cls.academicYear}</td>
                            <td>{cls.maxStudents}</td>
                            <td>{cls.currentStudents || 0}</td>
                            <td>
                              <span className={`badge ${cls.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'}`}>
                                {cls.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {!loading && !error && classes.length === 0 && (
                <div className="alert alert-warning">
                  <h5>No Classes Found</h5>
                  <p>No classes were returned from the API. This could mean:</p>
                  <ul>
                    <li>No classes have been created yet</li>
                    <li>All classes are inactive</li>
                    <li>There's a filtering issue</li>
                  </ul>
                </div>
              )}

              <div className="mt-4">
                <button className="btn btn-primary" onClick={testClassesAPI}>
                  Test Again
                </button>
                <a href="/school-admin/add-teacher" className="btn btn-secondary ms-2">
                  Back to Add Teacher
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
