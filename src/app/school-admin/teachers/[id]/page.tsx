'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Mail, Phone, MapPin, Calendar, GraduationCap, Briefcase, User, Clock } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { apiGet, getStoredToken } from '@/lib/api';

interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  qualification?: string;
  specialization?: string;
  experienceYears?: number;
  department?: string;
  designation?: string;
  subjects?: string[];
  joiningDate?: string;
  salary?: number;
  emergencyContact?: string;
  status: string;
  role: string;
  schoolId: number;
  createdAt: string;
  updatedAt: string;
}

export default function TeacherViewPage() {
  const params = useParams();
  const router = useRouter();
  const teacherId = params.id as string;
  
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (teacherId) {
      fetchTeacher();
    }
  }, [teacherId]);

  const fetchTeacher = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = getStoredToken();
      if (!token) {
        throw new Error('Authentication required. Please login again.');
      }

      const response = await apiGet<Teacher>(`/teachers/${teacherId}`, { token });
      setTeacher(response);
      console.log('Teacher fetched:', response);
    } catch (error: any) {
      console.error('Error fetching teacher:', error);
      setError(error?.message || 'Failed to fetch teacher details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not provided';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      active: 'badge bg-success',
      inactive: 'badge bg-secondary',
      pending: 'badge bg-warning',
      suspended: 'badge bg-danger'
    };
    return <span className={statusClasses[status as keyof typeof statusClasses]}>{status}</span>;
  };

  if (loading) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading teacher details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="alert alert-danger" role="alert">
            <h5 className="alert-heading">Error Loading Teacher</h5>
            <p>{error}</p>
            <hr />
            <div className="d-flex gap-2 justify-content-center">
              <button 
                className="btn btn-outline-danger"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
              <Link href="/school-admin/teachers" className="btn btn-secondary">
                Back to Teachers
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <h5>Teacher not found</h5>
          <p className="text-muted">The requested teacher could not be found.</p>
          <Link href="/school-admin/teachers" className="btn btn-primary">
            Back to Teachers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <div className="bg-white shadow-sm border-bottom">
        <div className="container-fluid py-3">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <Link href="/school-admin/teachers" className="btn btn-outline-secondary">
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="h3 mb-0 fw-bold text-dark">
                  <i className="fas fa-user me-2 text-primary"></i>
                  Teacher Details
                </h1>
                <p className="text-muted mb-0">View teacher information and profile</p>
              </div>
            </div>
            <div>
              <Link 
                href={`/school-admin/teachers/${teacher.id}/edit`} 
                className="btn btn-primary"
              >
                <Edit size={18} className="me-2" />
                Edit Teacher
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-fluid py-4">
        <div className="row g-4">
          {/* Teacher Profile Card */}
          <div className="col-lg-4">
            <div className="card border-0 shadow">
              <div className="card-body text-center p-4">
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '100px', height: '100px' }}>
                  <span className="text-primary fw-bold" style={{ fontSize: '2rem' }}>
                    {getInitials(teacher.firstName, teacher.lastName)}
                  </span>
                </div>
                <h4 className="mb-1">{teacher.firstName} {teacher.lastName}</h4>
                <p className="text-muted mb-3">{teacher.designation || 'Teacher'}</p>
                {getStatusBadge(teacher.status)}
                
                <div className="mt-4">
                  <div className="d-flex align-items-center justify-content-center mb-2">
                    <Mail size={16} className="text-muted me-2" />
                    <span className="small">{teacher.email}</span>
                  </div>
                  {teacher.mobile && (
                    <div className="d-flex align-items-center justify-content-center mb-2">
                      <Phone size={16} className="text-muted me-2" />
                      <span className="small">{teacher.mobile}</span>
                    </div>
                  )}
                  {teacher.department && (
                    <div className="d-flex align-items-center justify-content-center">
                      <Briefcase size={16} className="text-muted me-2" />
                      <span className="small">{teacher.department}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Teacher Details */}
          <div className="col-lg-8">
            <div className="card border-0 shadow">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="mb-0 fw-bold">Personal Information</h5>
              </div>
              <div className="card-body">
                <div className="row g-4">
                  {/* Basic Information */}
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-muted">Full Name</label>
                      <p className="mb-0">{teacher.firstName} {teacher.lastName}</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-muted">Email Address</label>
                      <p className="mb-0">{teacher.email}</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-muted">Mobile Number</label>
                      <p className="mb-0">{teacher.mobile || 'Not provided'}</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-muted">Date of Birth</label>
                      <p className="mb-0">{formatDate(teacher.dateOfBirth)}</p>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-muted">Address</label>
                      <p className="mb-0">{teacher.address || 'Not provided'}</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-muted">City</label>
                      <p className="mb-0">{teacher.city || 'Not provided'}</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-muted">State</label>
                      <p className="mb-0">{teacher.state || 'Not provided'}</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-muted">Country</label>
                      <p className="mb-0">{teacher.country || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="card border-0 shadow mt-4">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="mb-0 fw-bold">Professional Information</h5>
              </div>
              <div className="card-body">
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-muted">Employee ID</label>
                      <p className="mb-0">{teacher.id}</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-muted">Department</label>
                      <p className="mb-0">{teacher.department || 'Not assigned'}</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-muted">Designation</label>
                      <p className="mb-0">{teacher.designation || 'Teacher'}</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-muted">Qualification</label>
                      <p className="mb-0">{teacher.qualification || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-muted">Experience</label>
                      <p className="mb-0">{teacher.experienceYears ? `${teacher.experienceYears} years` : 'Not provided'}</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-muted">Specialization</label>
                      <p className="mb-0">{teacher.specialization || 'Not provided'}</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-muted">Joining Date</label>
                      <p className="mb-0">{formatDate(teacher.joiningDate)}</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-muted">Salary</label>
                      <p className="mb-0">{teacher.salary ? `₹${teacher.salary.toLocaleString()}` : 'Not disclosed'}</p>
                    </div>
                  </div>
                </div>

                {/* Subjects */}
                {teacher.subjects && teacher.subjects.length > 0 && (
                  <div className="mt-4">
                    <label className="form-label fw-semibold text-muted">Subjects</label>
                    <div className="d-flex flex-wrap gap-2">
                      {teacher.subjects.map((subject, index) => (
                        <span key={index} className="badge bg-primary">{subject}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Emergency Contact */}
                {teacher.emergencyContact && (
                  <div className="mt-4">
                    <label className="form-label fw-semibold text-muted">Emergency Contact</label>
                    <p className="mb-0">{teacher.emergencyContact}</p>
                  </div>
                )}
              </div>
            </div>

            {/* System Information */}
            <div className="card border-0 shadow mt-4">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="mb-0 fw-bold">System Information</h5>
              </div>
              <div className="card-body">
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-muted">Created At</label>
                      <p className="mb-0">{formatDate(teacher.createdAt)}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-muted">Last Updated</label>
                      <p className="mb-0">{formatDate(teacher.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
