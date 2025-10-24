'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Plus, Edit, Trash2, Eye, Filter, Download, BookOpen, Users, Calendar, MapPin, Clock } from 'lucide-react';
import { apiGet, apiDelete, getStoredToken, getStoredUser } from '@/lib/api';
import { showSuccess, showError, showConfirm, showLoading, closeLoading } from '@/lib/sweetalert';

interface Class {
  id: number;
  name: string;
  grade: string;
  section: string;
  academicYear: string;
  maxStudents: number;
  currentStudents: number;
  description?: string;
  subjects?: string[];
  syllabus?: string;
  rules?: string;
  classTeacherId?: number;
  classTeacher?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  startDate?: string;
  endDate?: string;
  schedule?: string;
  roomNumber?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED';
  schoolId: number;
  createdAt: string;
  updatedAt: string;
}

export default function ClassesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Fetch classes from API
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        setError('');
        
        const token = getStoredToken();
        if (!token) {
          throw new Error('Authentication required. Please login again.');
        }

        const response = await apiGet<Class[]>('/classes', { token });
        setClasses(response);
        console.log('Classes fetched:', response);
      } catch (error: any) {
        console.error('Error fetching classes:', error);
        setError(error?.message || 'Failed to fetch classes');
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const [grades] = useState([
    { id: '6', name: 'Grade 6' },
    { id: '7', name: 'Grade 7' },
    { id: '8', name: 'Grade 8' },
    { id: '9', name: 'Grade 9' },
    { id: '10', name: 'Grade 10' },
    { id: '11', name: 'Grade 11' },
    { id: '12', name: 'Grade 12' }
  ]);

  const filteredClasses = classes.filter(cls => {
    const matchesSearch = 
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cls.description && cls.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (cls.subjects && cls.subjects.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesStatus = statusFilter === 'all' || cls.status.toLowerCase() === statusFilter;
    const matchesGrade = gradeFilter === 'all' || cls.grade === gradeFilter;
    
    return matchesSearch && matchesStatus && matchesGrade;
  });

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      ACTIVE: 'badge bg-success',
      INACTIVE: 'badge bg-secondary',
      COMPLETED: 'badge bg-info'
    };
    return <span className={statusClasses[status as keyof typeof statusClasses]}>{status.toLowerCase()}</span>;
  };

  const getCapacityBadge = (capacity: number) => {
    if (capacity >= 90) return <span className="badge bg-success">Excellent</span>;
    if (capacity >= 80) return <span className="badge bg-warning">Good</span>;
    if (capacity >= 70) return <span className="badge bg-info">Fair</span>;
    return <span className="badge bg-danger">Poor</span>;
  };

  const getGradeBadge = (grade: string) => {
    const gradeColors = {
      '6': 'bg-primary',
      '7': 'bg-info',
      '8': 'bg-success',
      '9': 'bg-warning',
      '10': 'bg-danger',
      '11': 'bg-secondary',
      '12': 'bg-dark'
    };
    return <span className={`badge ${gradeColors[grade as keyof typeof gradeColors] || 'bg-secondary'}`}>Grade {grade}</span>;
  };

  const handleDeleteClass = async (classId: number) => {
    const classToDelete = classes.find(cls => cls.id === classId);
    const className = classToDelete ? `${classToDelete.grade}-${classToDelete.section}` : 'this class';
    
    const result = await showConfirm(
      'Delete Class',
      `Are you sure you want to delete ${className}? This action cannot be undone and will remove all associated data.`,
      'Yes, Delete It!',
      'Cancel'
    );
    
    if (!result.isConfirmed) return;
    
    try {
      setDeletingId(classId);
      showLoading('Deleting Class', 'Please wait while we delete the class...');
      
      const token = getStoredToken();
      
      if (!token) {
        closeLoading();
        await showError('Authentication Error', 'Please login again to continue.');
        return;
      }

      await apiDelete(`/classes/${classId}`, { token });
      
      // Remove from local state
      setClasses(prev => prev.filter(cls => cls.id !== classId));
      
      closeLoading();
      await showSuccess(
        'Class Deleted Successfully! 🗑️',
        `${className} has been permanently deleted from the system.`
      );
      
    } catch (error: any) {
      console.error('Error deleting class:', error);
      closeLoading();
      await showError(
        'Failed to Delete Class',
        error?.message || 'Failed to delete class. Please try again.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportClasses = async () => {
    try {
      showLoading('Exporting Classes', 'Preparing your data for download...');
      
      // Create CSV content
      const headers = ['Class Name', 'Grade', 'Section', 'Academic Year', 'Current Students', 'Max Students', 'Status', 'Class Teacher'];
      const csvData = filteredClasses.map(cls => [
        cls.name,
        cls.grade,
        cls.section,
        cls.academicYear || 'N/A',
        cls.currentStudents,
        cls.maxStudents,
        cls.status,
        cls.classTeacher ? `${cls.classTeacher.firstName} ${cls.classTeacher.lastName}` : 'No teacher'
      ]);

      // Create CSV string
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.join(','))
      ].join('\n');

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `classes_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      closeLoading();
      await showSuccess(
        'Export Successful! 📊',
        `Classes data has been exported successfully. The file contains ${filteredClasses.length} classes.`
      );
    } catch (error) {
      console.error('Error exporting classes:', error);
      closeLoading();
      await showError(
        'Export Failed',
        'Failed to export classes. Please try again.'
      );
    }
  };

  const handleViewClass = (classId: number) => {
    // Navigate to class details page or show modal
    window.location.href = `/school-admin/classes/${classId}`;
  };

  const handleEditClass = (classId: number) => {
    // Navigate to edit page
    window.location.href = `/school-admin/classes/${classId}/edit`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <Link href="/school-admin/dashboard" className="btn btn-outline-secondary me-3">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="h3 mb-0">Classes Management</h1>
            <p className="text-muted mb-0">Manage all classes and academic sections in your school</p>
          </div>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary" onClick={handleExportClasses}>
            <Download size={16} className="me-2" />
            Export
          </button>
          <Link href="/school-admin/create-class" className="btn btn-primary">
            <Plus size={16} className="me-2" />
            Create New Class
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search classes, subjects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
              >
                <option value="all">All Grades</option>
                {grades.map(grade => (
                  <option key={grade.id} value={grade.id}>{grade.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <button className="btn btn-outline-secondary w-100">
                <Filter size={16} className="me-2" />
                Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Classes Table */}
      <div className="card">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Classes List</h5>
            <span className="badge bg-primary">{filteredClasses.length} classes</span>
          </div>
        </div>
        <div className="card-body p-0">
          {/* Loading State */}
          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Loading classes...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="alert alert-danger m-4" role="alert">
              <h5 className="alert-heading">Error Loading Classes</h5>
              <p>{error}</p>
              <hr />
              <button 
                className="btn btn-outline-danger"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          )}

          {/* Classes Table */}
          {!loading && !error && (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Class Details</th>
                    <th>Academic Info</th>
                    <th>Students & Capacity</th>
                    <th>Schedule & Location</th>
                    <th>Performance</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClasses.map(cls => (
                  <tr key={cls.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="avatar-sm bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3">
                          <BookOpen size={20} className="text-info" />
                        </div>
                        <div>
                          <div className="fw-bold">{cls.name}</div>
                          <div className="mt-1">
                            {getGradeBadge(cls.grade)}
                          </div>
                          <small className="text-muted">Section {cls.section}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="mb-2">
                        <strong>Subjects:</strong>
                      </div>
                      <div className="mb-2">
                        {cls.subjects && cls.subjects.length > 0 ? (
                          <span className="text-dark">
                            {Array.isArray(cls.subjects) 
                              ? cls.subjects.join(', ')
                              : typeof cls.subjects === 'object'
                              ? Object.values(cls.subjects).join(', ')
                              : cls.subjects}
                          </span>
                        ) : (
                          <span className="text-muted">No subjects assigned</span>
                        )}
                      </div>
                      <div className="mt-2">
                        <small className="text-muted">
                          <BookOpen size={12} className="me-1" />
                          {cls.syllabus || 'No syllabus'}
                        </small>
                      </div>
                    </td>
                    <td>
                      <div className="mb-2">
                        <strong>{cls.currentStudents}/{cls.maxStudents}</strong> students
                      </div>
                      <div className="progress mb-2" style={{height: '8px'}}>
                        <div 
                          className="progress-bar" 
                          style={{width: `${(cls.currentStudents / cls.maxStudents) * 100}%`}}
                        ></div>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">Capacity</small>
                        {getCapacityBadge((cls.currentStudents / cls.maxStudents) * 100)}
                      </div>
                    </td>
                    <td>
                      <div className="mb-2">
                        <small className="text-muted">
                          <Clock size={12} className="me-1" />
                          {cls.schedule || 'No schedule'}
                        </small>
                      </div>
                      <div className="mb-2">
                        <small className="text-muted">
                          <MapPin size={12} className="me-1" />
                          {cls.roomNumber || 'No room assigned'}
                        </small>
                      </div>
                      <div>
                        <small className="text-muted">
                          <Calendar size={12} className="me-1" />
                          {cls.startDate && cls.endDate ? 
                            `${formatDate(cls.startDate)} - ${formatDate(cls.endDate)}` : 
                            'No dates set'
                          }
                        </small>
                      </div>
                    </td>
                    <td>
                      <div className="mb-2">
                        <div className="d-flex align-items-center">
                          <strong className="me-2">Score:</strong>
                          <span className="badge bg-primary">N/A</span>
                        </div>
                      </div>
                      <div>
                        <div className="d-flex align-items-center">
                          <strong className="me-2">Attendance:</strong>
                          <span className="badge bg-success">N/A</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      {getStatusBadge(cls.status)}
                      <div className="mt-2">
                        <div className="d-flex align-items-center">
                          <Users size={14} className="me-1 text-primary" />
                          <span className="fw-semibold text-dark">
                            {cls.classTeacher ? 
                              `${cls.classTeacher.firstName} ${cls.classTeacher.lastName}` : 
                              <span className="text-muted fst-italic">No teacher assigned</span>
                            }
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="btn-group" role="group">
                        <button 
                          className="btn btn-sm btn-outline-primary" 
                          title="View Details"
                          onClick={() => handleViewClass(cls.id)}
                        >
                          <Eye size={14} />
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-warning" 
                          title="Edit Class"
                          onClick={() => handleEditClass(cls.id)}
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger" 
                          title="Delete Class"
                          onClick={() => handleDeleteClass(cls.id)}
                          disabled={deletingId === cls.id}
                        >
                          {deletingId === cls.id ? (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Empty State */}
          {!loading && !error && filteredClasses.length === 0 && (
            <div className="text-center py-5">
              <div className="text-muted mb-3">
                <Search size={48} />
              </div>
              <h5>No classes found</h5>
              <p className="text-muted">Try adjusting your search criteria or create a new class.</p>
              <Link href="/school-admin/create-class" className="btn btn-primary">
                <Plus size={16} className="me-2" />
                Create New Class
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {!loading && !error && (
        <div className="row g-4 mt-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <div className="bg-success bg-opacity-10 rounded-circle p-3 mx-auto mb-3" style={{width: '60px', height: '60px'}}>
                  <BookOpen size={24} className="text-success" />
                </div>
                <h4 className="mb-1">{classes.filter(c => c.status === 'ACTIVE').length}</h4>
                <p className="text-muted mb-0">Active Classes</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <div className="bg-info bg-opacity-10 rounded-circle p-3 mx-auto mb-3" style={{width: '60px', height: '60px'}}>
                  <Users size={24} className="text-info" />
                </div>
                <h4 className="mb-1">{classes.reduce((sum, c) => sum + c.currentStudents, 0)}</h4>
                <p className="text-muted mb-0">Total Students</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <div className="bg-warning bg-opacity-10 rounded-circle p-3 mx-auto mb-3" style={{width: '60px', height: '60px'}}>
                  <Calendar size={24} className="text-warning" />
                </div>
                <h4 className="mb-1">{new Set(classes.map(c => c.grade)).size}</h4>
                <p className="text-muted mb-0">Grade Levels</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <div className="bg-primary bg-opacity-10 rounded-circle p-3 mx-auto mb-3" style={{width: '60px', height: '60px'}}>
                  <Search size={24} className="text-primary" />
                </div>
                <h4 className="mb-1">{classes.length}</h4>
                <p className="text-muted mb-0">Total Classes</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && filteredClasses.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <div className="text-muted">
            Showing {filteredClasses.length} of {classes.length} classes
          </div>
          <nav aria-label="Classes pagination">
            <ul className="pagination pagination-sm mb-0">
              <li className="page-item disabled">
                <span className="page-link">Previous</span>
              </li>
              <li className="page-item active">
                <span className="page-link">1</span>
              </li>
              <li className="page-item">
                <span className="page-link">2</span>
              </li>
              <li className="page-item">
                <span className="page-link">3</span>
              </li>
              <li className="page-item">
                <span className="page-link">Next</span>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}

