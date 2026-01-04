'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Download, Eye, Edit, Trash2, Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/api';

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  status: string;
  currentClassId: number;
  enrollmentDate: string;
  parentName?: string;
  parentEmail?: string;
  className?: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');

  // Fetch students from API
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      // Get authentication token
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch students from backend with authentication
      const response = await fetch(`${API_BASE_URL}/students`, { headers });
      if (response.ok) {
        const data = await response.json();
        console.log('Students fetched:', data);
        setStudents(data);
        setFilteredStudents(data);
      } else {
        console.error('Failed to fetch students:', response.status, response.statusText);
        setStudents([]);
        setFilteredStudents([]);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
      setFilteredStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter students based on search and filters
  useEffect(() => {
    let filtered = students;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(student =>
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.mobile?.includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(student => student.status === statusFilter);
    }

    // Class filter
    if (classFilter !== 'all') {
      filtered = filtered.filter(student => student.currentClassId === parseInt(classFilter));
    }

    setFilteredStudents(filtered);
  }, [students, searchTerm, statusFilter, classFilter]);

  const handleStatusChange = async (studentId: number, newStatus: string) => {
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
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Update local state
        setStudents(prev => prev.map(student =>
          student.id === studentId ? { ...student, status: newStatus } : student
        ));
        alert(`Student status updated to ${newStatus}`);
      } else {
        alert('Failed to update student status');
      }
    } catch (error) {
      console.error('Error updating student status:', error);
      alert('Error updating student status');
    }
  };

  const handleDeleteStudent = async (studentId: number) => {
    if (confirm('⚠️ Are you sure you want to delete this student? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Authentication required. Please login again.');
          return;
        }

        const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          // Remove from local state
          setStudents(prev => prev.filter(student => student.id !== studentId));
          alert('✅ Student deleted successfully!');
          
          // Optionally refresh the list
          fetchStudents();
        } else {
          const errorData = await response.json().catch(() => ({}));
          alert(`❌ Failed to delete student: ${errorData.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error deleting student:', error);
        alert('❌ Error deleting student. Please try again.');
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getYearsSinceEnrollment = (dateString: string) => {
    const enrollmentDate = new Date(dateString);
    const currentDate = new Date();
    const years = currentDate.getFullYear() - enrollmentDate.getFullYear();
    return years === 1 ? '1 year' : `${years} years`;
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-success';
      case 'inactive':
        return 'bg-secondary';
      case 'graduated':
        return 'bg-primary';
      case 'transferred':
        return 'bg-info';
      case 'suspended':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  const formatStatus = (status: string) => {
    return status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : 'Unknown';
  };

  if (loading) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
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
          <div className="d-flex align-items-center gap-3">
            <Link href="/school-admin/dashboard" className="btn btn-outline-secondary">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="h3 mb-0 fw-bold text-dark">
                <i className="fas fa-users me-2 text-primary"></i>
                Students Management
              </h1>
              <p className="text-muted mb-0">Manage all students in your school</p>
            </div>
          </div>
          <div className="ms-auto">
            <Link href="/school-admin/students/export" className="btn btn-outline-primary me-2">
              <Download size={18} className="me-2" />
              Export
            </Link>
            <Link href="/school-admin/add-student" className="btn btn-primary">
              <Plus size={18} className="me-2" />
              + Add New Student
            </Link>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="container-fluid py-4">
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <Search size={18} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search students..."
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
              <option value="graduated">Graduated</option>
              <option value="transferred">Transferred</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div className="col-md-2">
            <select
              className="form-select"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
            >
              <option value="all">All Classes</option>
              <option value="1">Class 1A</option>
              <option value="2">Class 2A</option>
              <option value="3">Class 3A</option>
              <option value="4">Class 4A</option>
              <option value="5">Class 5A</option>
            </select>
          </div>
          <div className="col-md-2">
            <button className="btn btn-outline-secondary w-100">
              <Filter size={18} className="me-2" />
              Filters
            </button>
          </div>
        </div>

        {/* Students List */}
        <div className="card border-0 shadow">
          <div className="card-header bg-white border-0 py-3">
            <div className="d-flex align-items-center justify-content-between">
              <h5 className="mb-0 fw-bold text-dark">
                Students List
                <span className="badge bg-primary ms-2">{filteredStudents.length} students</span>
              </h5>
            </div>
          </div>
          <div className="card-body p-0">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-5">
                <Users size={48} className="text-muted mb-3" />
                <h5 className="text-muted">No students found</h5>
                <p className="text-muted">Try adjusting your search or filters</p>
                <Link href="/school-admin/add-student" className="btn btn-primary">
                  <Plus size={18} className="me-2" />
                  Add First Student
                </Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="border-0">Student</th>
                      <th className="border-0">Contact</th>
                      <th className="border-0">Class</th>
                      <th className="border-0">Status</th>
                      <th className="border-0">Enrollment Date</th>
                      <th className="border-0">Guardian</th>
                      <th className="border-0">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                              <span className="text-primary fw-bold">{getInitials(student.firstName, student.lastName)}</span>
                            </div>
                            <div>
                              <div className="fw-semibold">{student.firstName} {student.lastName}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="text-muted">{student.email}</div>
                          <small className="text-muted">{student.mobile || 'No mobile'}</small>
                        </td>
                        <td>
                          {student.className ? (
                            <span className="badge bg-primary">{student.className}</span>
                          ) : (
                            <span className="badge bg-secondary">No Class</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(student.status)}`}>
                            {formatStatus(student.status)}
                          </span>
                        </td>
                        <td>
                          <div>{formatDate(student.enrollmentDate)}</div>
                          <small className="text-muted">{getYearsSinceEnrollment(student.enrollmentDate)}</small>
                        </td>
                        <td>
                          <div className="text-muted">{student.parentName || 'Not specified'}</div>
                          <small className="text-muted">{student.parentEmail || 'No email'}</small>
                        </td>
                        <td>
                          <div className="btn-group" role="group">
                            <Link href={`/school-admin/students/${student.id}`} className="btn btn-sm btn-outline-primary">
                              <Eye size={16} />
                            </Link>
                            <Link href={`/school-admin/students/${student.id}/edit`} className="btn btn-sm btn-outline-warning">
                              <Edit size={16} />
                            </Link>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteStudent(student.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {filteredStudents.length > 0 && (
          <div className="d-flex justify-content-between align-items-center mt-4">
            <div className="text-muted">
              Showing {filteredStudents.length} of {students.length} students
            </div>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className="page-item disabled">
                  <a className="page-link" href="#" tabIndex={-1}>Previous</a>
                </li>
                <li className="page-item active">
                  <a className="page-link" href="#">1</a>
                </li>
                <li className="page-item">
                  <a className="page-link" href="#">2</a>
                </li>
                <li className="page-item">
                  <a className="page-link" href="#">3</a>
                </li>
                <li className="page-item">
                  <a className="page-link" href="#">Next</a>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
