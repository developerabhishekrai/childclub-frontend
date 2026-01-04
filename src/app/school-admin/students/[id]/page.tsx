'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, User, Mail, Phone, Calendar, MapPin, Heart, 
  School, BookOpen, Users, AlertCircle, Edit, Download,
  Clock, CheckCircle, XCircle, FileText, Award, Activity,
  Trash2, RefreshCw
} from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { API_BASE_URL } from '@/lib/api';

interface StudentDetail {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  status: string;
  role: string;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  studentId: string;
  enrollNumber: string;
  rollNumber: string;
  admissionNumber: string;
  gender: string;
  bloodGroup: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  emergencyContact: string;
  previousSchool: string;
  currentClassId: number;
  className: string;
  schoolId: number;
  schoolName: string;
  enrollmentDate: string;
  academicYear: string;
  createdAt: string;
  updatedAt: string;
}

export default function SchoolAdminStudentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;

  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (studentId) {
      fetchStudentDetails();
    }
  }, [studentId]);

  const fetchStudentDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch student details');
      }

      const data = await response.json();
      console.log('Student details:', data);
      setStudent(data);
    } catch (error: any) {
      console.error('Error fetching student details:', error);
      setError(error.message || 'Failed to load student details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!student) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication required');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/students/${studentId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        alert(`Student status updated to ${newStatus}`);
        fetchStudentDetails(); // Refresh data
      } else {
        alert('Failed to update student status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating student status');
    }
  };

  const handleDeleteStudent = async () => {
    if (!window.confirm('⚠️ Are you sure you want to delete this student? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication required');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert('✅ Student deleted successfully!');
        router.push('/school-admin/students');
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`❌ Failed to delete student: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('❌ Error deleting student. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age} years`;
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-success';
      case 'inactive':
        return 'bg-secondary';
      case 'suspended':
        return 'bg-danger';
      case 'graduated':
        return 'bg-info';
      case 'transferred':
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  };

  const downloadStudentInfo = () => {
    if (!student) return;
    
    const content = `
STUDENT INFORMATION
==================

Personal Information
-------------------
Name: ${student.firstName} ${student.lastName}
Student ID: ${student.studentId}
Enrollment Number: ${student.enrollNumber}
Roll Number: ${student.rollNumber}
Admission Number: ${student.admissionNumber}
Date of Birth: ${formatDate(student.dateOfBirth)}
Age: ${calculateAge(student.dateOfBirth)}
Gender: ${student.gender}
Blood Group: ${student.bloodGroup}

Contact Information
------------------
Email: ${student.email}
Mobile: ${student.mobile || 'N/A'}
Address: ${student.address || 'N/A'}
City: ${student.city || 'N/A'}
State: ${student.state || 'N/A'}
Country: ${student.country || 'N/A'}
Postal Code: ${student.postalCode || 'N/A'}

Parent/Guardian Information
--------------------------
Parent Name: ${student.parentName}
Parent Phone: ${student.parentPhone}
Parent Email: ${student.parentEmail}
Emergency Contact: ${student.emergencyContact}

Academic Information
-------------------
School: ${student.schoolName}
Class: ${student.className}
Academic Year: ${student.academicYear}
Enrollment Date: ${formatDate(student.enrollmentDate)}
Previous School: ${student.previousSchool || 'N/A'}
Status: ${student.status}

System Information
-----------------
Created At: ${formatDate(student.createdAt)}
Last Updated: ${formatDate(student.updatedAt)}
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student_${student.firstName}_${student.lastName}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading student details...</p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="bg-danger bg-opacity-10 rounded-circle p-4 d-inline-block mb-3">
            <AlertCircle size={48} className="text-danger" />
          </div>
          <h4 className="fw-bold mb-2">Error Loading Student</h4>
          <p className="text-muted mb-4">{error || 'Student not found'}</p>
          <Link href="/school-admin/students" className="btn btn-primary">
            <ArrowLeft size={18} className="me-2" />
            Back to Students
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
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div className="d-flex align-items-center gap-3">
              <Link href="/school-admin/students" className="btn btn-outline-secondary">
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="h3 mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                  <User size={28} className="text-primary" />
                  Student Details
                </h1>
                <p className="text-muted mb-0">Complete information and management</p>
              </div>
            </div>
            <div className="d-flex gap-2">
              <button onClick={fetchStudentDetails} className="btn btn-outline-secondary">
                <RefreshCw size={18} className="me-2" />
                Refresh
              </button>
              <Link href={`/school-admin/students/${student.id}/edit`} className="btn btn-warning">
                <Edit size={18} className="me-2" />
                Edit
              </Link>
              <button onClick={downloadStudentInfo} className="btn btn-outline-primary">
                <Download size={18} className="me-2" />
                Download
              </button>
              <button onClick={handleDeleteStudent} className="btn btn-danger">
                <Trash2 size={18} className="me-2" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-fluid py-4">
        {/* Student Profile Header */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <div className="row align-items-center">
              <div className="col-auto">
                <div 
                  className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: '100px', height: '100px' }}
                >
                  <User size={48} className="text-primary" />
                </div>
              </div>
              <div className="col">
                <div className="d-flex align-items-center gap-3 flex-wrap">
                  <h2 className="h3 fw-bold mb-0">{student.firstName} {student.lastName}</h2>
                  <div className="dropdown">
                    <button 
                      className={`btn ${getStatusBadgeClass(student.status)} dropdown-toggle px-3 py-2 text-white`}
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      {student.status.toUpperCase()}
                    </button>
                    <ul className="dropdown-menu">
                      <li><button className="dropdown-item" onClick={() => handleStatusChange('active')}>Active</button></li>
                      <li><button className="dropdown-item" onClick={() => handleStatusChange('inactive')}>Inactive</button></li>
                      <li><button className="dropdown-item" onClick={() => handleStatusChange('suspended')}>Suspended</button></li>
                      <li><button className="dropdown-item" onClick={() => handleStatusChange('graduated')}>Graduated</button></li>
                      <li><button className="dropdown-item" onClick={() => handleStatusChange('transferred')}>Transferred</button></li>
                    </ul>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-4 mt-2 text-muted flex-wrap">
                  <div className="d-flex align-items-center gap-2">
                    <FileText size={16} />
                    <span>Enroll: <strong>{student.enrollNumber}</strong></span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <Award size={16} />
                    <span>Roll: <strong>{student.rollNumber}</strong></span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <BookOpen size={16} />
                    <span><strong>{student.className}</strong></span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <Calendar size={16} />
                    <span>Joined: <strong>{formatDate(student.enrollmentDate)}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Left Column */}
          <div className="col-lg-6">
            {/* Personal Information */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white border-bottom">
                <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                  <User size={20} className="text-primary" />
                  Personal Information
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label text-muted small mb-1">First Name</label>
                    <div className="fw-semibold">{student.firstName}</div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small mb-1">Last Name</label>
                    <div className="fw-semibold">{student.lastName}</div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small mb-1">Date of Birth</label>
                    <div className="fw-semibold d-flex align-items-center gap-2">
                      <Calendar size={16} className="text-primary" />
                      {formatDate(student.dateOfBirth)}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small mb-1">Age</label>
                    <div className="fw-semibold">{calculateAge(student.dateOfBirth)}</div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small mb-1">Gender</label>
                    <div className="fw-semibold">
                      <span className={`badge ${
                        student.gender?.toLowerCase() === 'male' ? 'bg-info' :
                        student.gender?.toLowerCase() === 'female' ? 'bg-pink' : 'bg-secondary'
                      }`}>
                        {student.gender}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small mb-1">Blood Group</label>
                    <div className="fw-semibold d-flex align-items-center gap-2">
                      <Heart size={16} className="text-danger" />
                      {student.bloodGroup || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white border-bottom">
                <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                  <Phone size={20} className="text-primary" />
                  Contact Information
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label text-muted small mb-1">Email Address</label>
                    <div className="fw-semibold d-flex align-items-center gap-2">
                      <Mail size={16} className="text-primary" />
                      <a href={`mailto:${student.email}`} className="text-decoration-none">
                        {student.email}
                      </a>
                    </div>
                  </div>
                  <div className="col-12">
                    <label className="form-label text-muted small mb-1">Mobile Number</label>
                    <div className="fw-semibold d-flex align-items-center gap-2">
                      <Phone size={16} className="text-primary" />
                      {student.mobile || 'N/A'}
                    </div>
                  </div>
                  <div className="col-12">
                    <label className="form-label text-muted small mb-1">Address</label>
                    <div className="fw-semibold d-flex align-items-start gap-2">
                      <MapPin size={16} className="text-primary mt-1" />
                      <div>
                        {student.address || 'N/A'}<br />
                        {student.city && `${student.city}, `}
                        {student.state && `${student.state} `}
                        {student.postalCode && `- ${student.postalCode}`}<br />
                        {student.country || ''}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Parent/Guardian Information */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white border-bottom">
                <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                  <Users size={20} className="text-primary" />
                  Parent/Guardian Information
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label text-muted small mb-1">Parent Name</label>
                    <div className="fw-semibold">{student.parentName || 'N/A'}</div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small mb-1">Parent Phone</label>
                    <div className="fw-semibold d-flex align-items-center gap-2">
                      <Phone size={16} className="text-primary" />
                      {student.parentPhone || 'N/A'}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small mb-1">Parent Email</label>
                    <div className="fw-semibold d-flex align-items-center gap-2">
                      <Mail size={16} className="text-primary" />
                      {student.parentEmail ? (
                        <a href={`mailto:${student.parentEmail}`} className="text-decoration-none text-truncate">
                          {student.parentEmail}
                        </a>
                      ) : 'N/A'}
                    </div>
                  </div>
                  <div className="col-12">
                    <label className="form-label text-muted small mb-1">Emergency Contact</label>
                    <div className="fw-semibold d-flex align-items-center gap-2">
                      <AlertCircle size={16} className="text-danger" />
                      {student.emergencyContact || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-lg-6">
            {/* Academic Information */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white border-bottom">
                <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                  <BookOpen size={20} className="text-primary" />
                  Academic Information
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label text-muted small mb-1">Student ID</label>
                    <div className="fw-semibold">
                      <span className="badge bg-primary-subtle text-primary px-3 py-2">
                        {student.studentId}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small mb-1">Enrollment Number</label>
                    <div className="fw-semibold">
                      <span className="badge bg-primary-subtle text-primary px-3 py-2">
                        {student.enrollNumber}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small mb-1">Roll Number</label>
                    <div className="fw-semibold">
                      <span className="badge bg-success-subtle text-success px-3 py-2">
                        {student.rollNumber}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small mb-1">Admission Number</label>
                    <div className="fw-semibold">
                      <span className="badge bg-info-subtle text-info px-3 py-2">
                        {student.admissionNumber}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small mb-1">Current Class</label>
                    <div className="fw-semibold d-flex align-items-center gap-2">
                      <BookOpen size={16} className="text-primary" />
                      {student.className}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small mb-1">Academic Year</label>
                    <div className="fw-semibold">{student.academicYear}</div>
                  </div>
                  <div className="col-12">
                    <label className="form-label text-muted small mb-1">School</label>
                    <div className="fw-semibold d-flex align-items-center gap-2">
                      <School size={16} className="text-primary" />
                      {student.schoolName}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small mb-1">Enrollment Date</label>
                    <div className="fw-semibold d-flex align-items-center gap-2">
                      <Calendar size={16} className="text-primary" />
                      {formatDate(student.enrollmentDate)}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small mb-1">Status</label>
                    <div>
                      <span className={`badge ${getStatusBadgeClass(student.status)} px-3 py-2`}>
                        {student.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="col-12">
                    <label className="form-label text-muted small mb-1">Previous School</label>
                    <div className="fw-semibold">{student.previousSchool || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* System Information */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white border-bottom">
                <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                  <Clock size={20} className="text-primary" />
                  System Information
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label text-muted small mb-1">Record Created</label>
                    <div className="fw-semibold small">{formatDate(student.createdAt)}</div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small mb-1">Last Updated</label>
                    <div className="fw-semibold small">{formatDate(student.updatedAt)}</div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small mb-1">User Role</label>
                    <div className="fw-semibold">
                      <span className="badge bg-secondary">{student.role}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Actions */}
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom">
                <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                  <Activity size={20} className="text-primary" />
                  Management Actions
                </h5>
              </div>
              <div className="card-body">
                <div className="d-grid gap-2">
                  <Link href={`/school-admin/students/${student.id}/edit`} className="btn btn-warning">
                    <Edit size={18} className="me-2" />
                    Edit Student Information
                  </Link>
                  <Link href={`/school-admin/students/${student.id}/attendance`} className="btn btn-outline-primary">
                    <CheckCircle size={18} className="me-2" />
                    Manage Attendance
                  </Link>
                  <Link href={`/school-admin/students/${student.id}/performance`} className="btn btn-outline-success">
                    <Award size={18} className="me-2" />
                    View Performance
                  </Link>
                  <Link href={`/school-admin/students/${student.id}/reports`} className="btn btn-outline-info">
                    <FileText size={18} className="me-2" />
                    Generate Reports
                  </Link>
                  <button 
                    onClick={downloadStudentInfo}
                    className="btn btn-outline-secondary"
                  >
                    <Download size={18} className="me-2" />
                    Download Complete Info
                  </button>
                  <hr />
                  <button 
                    onClick={handleDeleteStudent}
                    className="btn btn-danger"
                  >
                    <Trash2 size={18} className="me-2" />
                    Delete Student
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-4">
          <Link href="/school-admin/students" className="btn btn-outline-primary btn-lg">
            <ArrowLeft size={18} className="me-2" />
            Back to Students List
          </Link>
        </div>
      </div>

      <style jsx>{`
        .bg-pink {
          background-color: #e91e63 !important;
        }
        .card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>
    </div>
  );
}

