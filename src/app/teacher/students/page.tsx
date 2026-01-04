'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, UserPlus, Search, Mail, Phone, Calendar, User, BookOpen, ChevronRight, ChevronLeft, Download, Filter, Grid, List } from 'lucide-react';
import Link from 'next/link';
import 'bootstrap/dist/css/bootstrap.min.css';
import { API_BASE_URL } from '@/lib/api';

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  studentCode: string;
  enrollNumber: string;
  rollNumber: string;
  admissionNumber: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  emergencyContact: string;
  previousSchool: string;
  enrollmentDate: string;
  status: string;
}

interface StudentsData {
  classId: number | null;
  className: string | null;
  students: Student[];
}

export default function TeacherStudentsPage() {
  const router = useRouter();
  const [studentsData, setStudentsData] = useState<StudentsData>({
    classId: null,
    className: null,
    students: []
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(20);

  useEffect(() => {
    fetchMyStudents();
  }, []);

  const fetchMyStudents = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/teachers/my/students`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }

      const data = await response.json();
      console.log('Students data:', data);
      setStudentsData(data);
    } catch (error: any) {
      console.error('Error fetching students:', error);
      setError(error.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  // Filter students
  const filteredStudents = studentsData.students.filter(student => {
    const matchesSearch = 
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.enrollNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || student.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesGender = genderFilter === 'all' || student.gender?.toLowerCase() === genderFilter.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesGender;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, genderFilter]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Enrollment No', 'Gender', 'Parent Name', 'Parent Phone', 'Emergency Contact', 'Previous School', 'Status'];
    const csvData = filteredStudents.map(student => [
      `${student.firstName} ${student.lastName}`,
      student.email,
      student.enrollNumber || '',
      student.gender || '',
      student.parentName || '',
      student.parentPhone || '',
      student.emergencyContact || '',
      student.previousSchool || '',
      student.status
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_${studentsData.className}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading students...</p>
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
              <Link href="/teacher/dashboard" className="btn btn-outline-secondary">
                <i className="bi bi-arrow-left"></i>
              </Link>
              <div>
                <h1 className="h3 mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                  <Users size={28} className="text-primary" />
                  My Students
                </h1>
                {studentsData.className && (
                  <p className="text-muted mb-0">
                    <BookOpen size={16} className="me-1" />
                    {studentsData.className}
                  </p>
                )}
              </div>
            </div>
            <Link href="/teacher/students/create" className="btn btn-primary">
              <UserPlus size={18} className="me-2" />
              Add Student
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-fluid py-4">
        {error && (
          <div className="alert alert-danger d-flex align-items-center" role="alert">
            <i className="bi bi-exclamation-circle me-2"></i>
            <div>{error}</div>
          </div>
        )}

        {!studentsData.classId ? (
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-5">
              <div className="bg-warning bg-opacity-10 rounded-circle p-4 d-inline-block mb-3">
                <Users size={48} className="text-warning" />
              </div>
              <h4 className="fw-bold mb-2">No Class Assigned</h4>
              <p className="text-muted mb-4">
                You have not been assigned to any class yet. Please contact your school administrator.
              </p>
              <Link href="/teacher/dashboard" className="btn btn-primary">
                <i className="bi bi-arrow-left me-2"></i>
                Back to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="row g-4 mb-4">
              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <div className="card-body text-white">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="card-subtitle mb-2 opacity-75">Total Students</h6>
                        <h2 className="card-title display-5 fw-bold mb-0">{studentsData.students.length}</h2>
                      </div>
                      <Users size={40} className="opacity-50" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>
                  <div className="card-body text-white">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="card-subtitle mb-2 opacity-75">Active</h6>
                        <h2 className="card-title display-5 fw-bold mb-0">
                          {studentsData.students.filter(s => s.status === 'active').length}
                        </h2>
                      </div>
                      <i className="bi bi-person-check-fill" style={{ fontSize: '2.5rem', opacity: 0.5 }}></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                  <div className="card-body text-white">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="card-subtitle mb-2 opacity-75">Boys</h6>
                        <h2 className="card-title display-5 fw-bold mb-0">
                          {studentsData.students.filter(s => s.gender?.toLowerCase() === 'male').length}
                        </h2>
                      </div>
                      <i className="bi bi-gender-male" style={{ fontSize: '2.5rem', opacity: 0.5 }}></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                  <div className="card-body text-white">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="card-subtitle mb-2 opacity-75">Girls</h6>
                        <h2 className="card-title display-5 fw-bold mb-0">
                          {studentsData.students.filter(s => s.gender?.toLowerCase() === 'female').length}
                        </h2>
                      </div>
                      <i className="bi bi-gender-female" style={{ fontSize: '2.5rem', opacity: 0.5 }}></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-5">
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <Search size={20} className="text-muted" />
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 ps-0"
                        placeholder="Search by name, email, or enrollment number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-2">
                    <select 
                      className="form-select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <select 
                      className="form-select"
                      value={genderFilter}
                      onChange={(e) => setGenderFilter(e.target.value)}
                    >
                      <option value="all">All Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="col-md-3 d-flex gap-2">
                    <button 
                      className="btn btn-outline-primary flex-fill"
                      onClick={exportToCSV}
                    >
                      <Download size={18} className="me-2" />
                      Export
                    </button>
                    <div className="btn-group">
                      <button 
                        className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setViewMode('table')}
                      >
                        <List size={18} />
                      </button>
                      <button 
                        className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setViewMode('grid')}
                      >
                        <Grid size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Students List */}
            {filteredStudents.length === 0 ? (
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center py-5">
                  <div className="bg-light rounded-circle p-4 d-inline-block mb-3">
                    <Users size={48} className="text-muted" />
                  </div>
                  <h5 className="fw-bold mb-2">No Students Found</h5>
                  <p className="text-muted mb-4">
                    {searchTerm ? 'No students match your search criteria.' : 'No students have been added to this class yet.'}
                  </p>
                  {!searchTerm && (
                    <Link href="/teacher/students/create" className="btn btn-primary">
                      <UserPlus size={18} className="me-2" />
                      Add First Student
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Results Summary */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="text-muted">
                    Showing {indexOfFirstStudent + 1} to {Math.min(indexOfLastStudent, filteredStudents.length)} of {filteredStudents.length} students
                  </div>
                  <div className="text-muted">
                    <strong>{studentsData.className}</strong>
                  </div>
                </div>

                {/* Table View */}
                {viewMode === 'table' ? (
                  <div className="card border-0 shadow-sm">
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th className="border-0">#</th>
                            <th className="border-0">Student</th>
                            <th className="border-0">Enrollment No</th>
                            <th className="border-0">Contact</th>
                            <th className="border-0">Gender</th>
                            <th className="border-0">Parent</th>
                            <th className="border-0">Status</th>
                            <th className="border-0 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentStudents.map((student, index) => (
                            <tr key={student.id}>
                              <td>{indexOfFirstStudent + index + 1}</td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2" 
                                    style={{ width: '32px', height: '32px', minWidth: '32px' }}>
                                    <User size={16} className="text-primary" />
                                  </div>
                                  <div>
                                    <div className="fw-semibold">{student.firstName} {student.lastName}</div>
                                    <small className="text-muted">{student.email}</small>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span className="badge bg-primary-subtle text-primary">
                                  {student.enrollNumber || '-'}
                                </span>
                              </td>
                              <td>
                                <div>{student.mobile || '-'}</div>
                              </td>
                              <td>
                                <span className={`badge ${
                                  student.gender?.toLowerCase() === 'male' ? 'bg-info' :
                                  student.gender?.toLowerCase() === 'female' ? 'bg-pink' : 'bg-secondary'
                                }`}>
                                  {student.gender || 'N/A'}
                                </span>
                              </td>
                              <td>
                                <div className="small">
                                  <div>{student.parentName || '-'}</div>
                                  <small className="text-muted">{student.parentPhone || '-'}</small>
                                </div>
                              </td>
                              <td>
                                <span className={`badge ${student.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                                  {student.status}
                                </span>
                              </td>
                              <td className="text-center">
                                <Link
                                  href={`/teacher/students/${student.id}`}
                                  className="btn btn-outline-primary btn-sm"
                                  title="View Details"
                                >
                                  <i className="bi bi-eye me-1"></i> View
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  /* Grid View */
                  <div className="row g-4">
                    {currentStudents.map((student) => (
                      <div key={student.id} className="col-12 col-md-6 col-lg-4 col-xl-3">
                        <div className="card border-0 shadow-sm h-100 hover-card">
                          <div className="card-body">
                            <div className="d-flex align-items-start mb-3">
                              <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                                <User size={24} className="text-primary" />
                              </div>
                              <div className="flex-grow-1">
                                <h6 className="card-title mb-1 fw-bold">
                                  {student.firstName} {student.lastName}
                                </h6>
                                <span className={`badge ${student.status === 'active' ? 'bg-success' : 'bg-secondary'} badge-sm`}>
                                  {student.status}
                                </span>
                              </div>
                            </div>

                            <div className="mb-3 small">
                              <div className="d-flex align-items-center mb-2">
                                <span className="badge bg-primary-subtle text-primary">
                                  Enroll: {student.enrollNumber || 'N/A'}
                                </span>
                              </div>
                              <div className="d-flex align-items-center text-muted mb-1">
                                <Mail size={14} className="me-2" style={{minWidth: '16px'}} />
                                <span className="text-truncate">{student.email}</span>
                              </div>
                              <div className="d-flex align-items-center text-muted mb-1">
                                <Phone size={14} className="me-2" style={{minWidth: '16px'}} />
                                <span>{student.mobile || 'N/A'}</span>
                              </div>
                              <div className="d-flex align-items-center text-muted mb-1">
                                <i className="bi bi-person me-2" style={{width: '16px'}}></i>
                                <span>{student.gender || 'N/A'}</span>
                              </div>
                              <div className="d-flex align-items-center text-muted">
                                <i className="bi bi-telephone me-2" style={{width: '16px'}}></i>
                                <span className="small">Parent: {student.parentPhone || 'N/A'}</span>
                              </div>
                            </div>

                            <div className="border-top pt-2">
                              <Link
                                href={`/teacher/students/${student.id}`}
                                className="btn btn-outline-primary btn-sm w-100"
                              >
                                <i className="bi bi-eye me-1"></i> View
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="card border-0 shadow-sm mt-4">
                    <div className="card-body">
                      <nav>
                        <ul className="pagination pagination-sm mb-0 justify-content-center">
                          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button 
                              className="page-link"
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                            >
                              <ChevronLeft size={16} /> Previous
                            </button>
                          </li>
                          
                          {[...Array(totalPages)].map((_, index) => {
                            const pageNumber = index + 1;
                            // Show first 3, last 3, and pages around current page
                            if (
                              pageNumber === 1 ||
                              pageNumber === totalPages ||
                              (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                            ) {
                              return (
                                <li key={pageNumber} className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}>
                                  <button 
                                    className="page-link"
                                    onClick={() => handlePageChange(pageNumber)}
                                  >
                                    {pageNumber}
                                  </button>
                                </li>
                              );
                            } else if (
                              pageNumber === currentPage - 2 ||
                              pageNumber === currentPage + 2
                            ) {
                              return <li key={pageNumber} className="page-item disabled"><span className="page-link">...</span></li>;
                            }
                            return null;
                          })}
                          
                          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button 
                              className="page-link"
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === totalPages}
                            >
                              Next <ChevronRight size={16} />
                            </button>
                          </li>
                        </ul>
                      </nav>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        .hover-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .hover-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.15) !important;
        }
        .table tbody tr {
          transition: background-color 0.2s ease;
        }
        .table tbody tr:hover {
          background-color: #f8f9fa;
        }
        .bg-pink {
          background-color: #e91e63 !important;
        }
        .badge-sm {
          font-size: 0.75rem;
        }
      `}</style>
    </div>
  );
}

