'use client';

import React, { useState, useEffect } from 'react';
import { Download, FileText, Users, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/api';

export default function ExportStudentsPage() {
  const [loading, setLoading] = useState(false);
  const [studentCount, setStudentCount] = useState(0);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchStudentCount();
  }, []);

  const fetchStudentCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/students`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStudentCount(data.length);
      }
    } catch (error) {
      console.error('Error fetching student count:', error);
    }
  };

  const handleExportCSV = async () => {
    try {
      setLoading(true);
      setExportStatus('idle');
      setErrorMessage('');

      const token = localStorage.getItem('token');
      if (!token) {
        setErrorMessage('Authentication required. Please login again.');
        setExportStatus('error');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/students/export/csv`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export students');
      }

      // Get the CSV content
      const csvContent = await response.text();

      // Create a blob from the CSV content
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // Create a temporary link element
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `students-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportStatus('success');
    } catch (error) {
      console.error('Error exporting students:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to export students');
      setExportStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <div className="bg-white shadow-sm border-bottom">
        <div className="container-fluid py-3">
          <div className="d-flex align-items-center gap-3">
            <Link href="/school-admin/students" className="btn btn-outline-secondary">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="h3 mb-0 fw-bold text-dark">
                <i className="fas fa-download me-2 text-primary"></i>
                Export Students Data
              </h1>
              <p className="text-muted mb-0">Download all student information in CSV format</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-fluid py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            {/* Export Card */}
            <div className="card border-0 shadow-sm">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                       style={{ width: '80px', height: '80px' }}>
                    <FileText size={40} className="text-primary" />
                  </div>
                  <h2 className="h4 fw-bold mb-2">Export Student Data</h2>
                  <p className="text-muted">
                    Download a comprehensive CSV file containing all student information
                  </p>
                </div>

                {/* Student Count */}
                <div className="bg-light rounded p-3 mb-4">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <Users size={20} className="text-primary" />
                      <span className="fw-semibold">Total Students</span>
                    </div>
                    <span className="badge bg-primary fs-6">{studentCount}</span>
                  </div>
                </div>

                {/* Export Information */}
                <div className="mb-4">
                  <h5 className="fw-semibold mb-3">Export includes:</h5>
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <i className="fas fa-check-circle text-success me-2"></i>
                      Student personal information (Name, Email, Mobile)
                    </li>
                    <li className="mb-2">
                      <i className="fas fa-check-circle text-success me-2"></i>
                      Student IDs (Roll Number, Admission Number)
                    </li>
                    <li className="mb-2">
                      <i className="fas fa-check-circle text-success me-2"></i>
                      Parent/Guardian contact details
                    </li>
                    <li className="mb-2">
                      <i className="fas fa-check-circle text-success me-2"></i>
                      Class and enrollment information
                    </li>
                    <li className="mb-2">
                      <i className="fas fa-check-circle text-success me-2"></i>
                      Academic status and dates
                    </li>
                  </ul>
                </div>

                {/* Status Messages */}
                {exportStatus === 'success' && (
                  <div className="alert alert-success d-flex align-items-center" role="alert">
                    <CheckCircle size={20} className="me-2" />
                    <div>
                      <strong>Success!</strong> Student data has been exported successfully.
                    </div>
                  </div>
                )}

                {exportStatus === 'error' && (
                  <div className="alert alert-danger d-flex align-items-center" role="alert">
                    <AlertCircle size={20} className="me-2" />
                    <div>
                      <strong>Error!</strong> {errorMessage || 'Failed to export student data.'}
                    </div>
                  </div>
                )}

                {/* Export Button */}
                <div className="d-grid gap-2">
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={handleExportCSV}
                    disabled={loading || studentCount === 0}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download size={20} className="me-2" />
                        Export to CSV
                      </>
                    )}
                  </button>
                  <Link href="/school-admin/students" className="btn btn-outline-secondary">
                    Cancel
                  </Link>
                </div>

                {studentCount === 0 && (
                  <div className="alert alert-warning mt-3 mb-0" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    No students found to export. Please add students first.
                  </div>
                )}
              </div>
            </div>

            {/* Help Text */}
            <div className="text-center mt-4">
              <small className="text-muted">
                <i className="fas fa-info-circle me-1"></i>
                The exported CSV file can be opened in Microsoft Excel, Google Sheets, or any spreadsheet application.
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

