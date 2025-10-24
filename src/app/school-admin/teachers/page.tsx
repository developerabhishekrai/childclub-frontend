'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Download, Eye, Edit, Trash2, Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { apiGet, apiPut, apiDelete, getStoredToken } from '@/lib/api';

interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  status: string;
  role: string;
  city?: string;
  state?: string;
  country?: string;
  createdAt?: string;
  updatedAt?: string;
  // Teacher specific fields
  teacherId?: number;
  employeeId?: string;
  schoolId?: number;
  qualification?: string;
  experienceYears?: number;
  joiningDate?: string;
  department?: string;
  designation?: string;
  classes?: ClassInfo[];
}

interface ClassInfo {
  id: number;
  name: string;
  grade: string;
  section: string;
  isPrimary?: boolean;
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch teachers from API
  useEffect(() => {
    fetchTeachers();
  }, []);

  // Refresh data when page becomes visible (useful when coming back from edit page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchTeachers();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      
      const token = getStoredToken();
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await apiGet<Teacher[]>('/teachers', { token });
      console.log('Teachers fetched:', response);
      
      // Fetch classes for each teacher
      const teachersWithClasses = await Promise.all(
        response.map(async (teacher) => {
          try {
            const classes = await apiGet<ClassInfo[]>(`/teachers/${teacher.id}/classes`, { token });
            return { ...teacher, classes };
          } catch (error) {
            console.error(`Error fetching classes for teacher ${teacher.id}:`, error);
            return { ...teacher, classes: [] };
          }
        })
      );
      
      setTeachers(teachersWithClasses);
      setFilteredTeachers(teachersWithClasses);
    } catch (error: any) {
      console.error('Error fetching teachers:', error);
      setTeachers([]);
      setFilteredTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort teachers
  useEffect(() => {
    let filtered = [...teachers];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(teacher =>
        `${teacher.firstName} ${teacher.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.mobile?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.designation?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(teacher => teacher.status === statusFilter);
    }

    // Department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(teacher => teacher.department === departmentFilter);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
          bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'department':
          aValue = a.department?.toLowerCase() || '';
          bValue = b.department?.toLowerCase() || '';
          break;
        case 'experience':
          aValue = a.experienceYears || 0;
          bValue = b.experienceYears || 0;
          break;
        case 'status':
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        default:
          aValue = a.firstName.toLowerCase();
          bValue = b.firstName.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredTeachers(filtered);
    
    // Calculate pagination
    const totalPagesCount = Math.ceil(filtered.length / itemsPerPage);
    setTotalPages(totalPagesCount);
    
    // Reset to first page if current page is beyond total pages
    if (currentPage > totalPagesCount) {
      setCurrentPage(1);
    }
  }, [teachers, searchTerm, statusFilter, departmentFilter, sortBy, sortOrder, currentPage, itemsPerPage]);

  const handleStatusChange = async (teacherId: number, newStatus: string) => {
    try {
      const token = getStoredToken();
      if (!token) {
        alert('Authentication required');
        return;
      }

      const response = await apiPut(`/teachers/${teacherId}`, { status: newStatus }, { token });

      // Update local state
      setTeachers(prev => prev.map(teacher =>
        teacher.id === teacherId ? { ...teacher, status: newStatus } : teacher
      ));
      alert(`Teacher status updated to ${newStatus}`);
    } catch (error: any) {
      console.error('Error updating teacher status:', error);
      alert(error?.message || 'Error updating teacher status');
    }
  };

  const handleDeleteTeacher = async (teacherId: number) => {
    if (confirm('⚠️ Are you sure you want to delete this teacher? This action cannot be undone.')) {
      try {
        const token = getStoredToken();
        if (!token) {
          alert('Authentication required. Please login again.');
          return;
        }

        await apiDelete(`/teachers/${teacherId}`, { token });

        // Remove from local state
        setTeachers(prev => prev.filter(teacher => teacher.id !== teacherId));
        alert('✅ Teacher deleted successfully!');
        
        // Optionally refresh the list
        fetchTeachers();
      } catch (error: any) {
        console.error('Error deleting teacher:', error);
        alert(`❌ Error deleting teacher: ${error?.message || 'Please try again.'}`);
      }
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  // Helper functions
  const getUniqueDepartments = () => {
    const departments = teachers
      .map(teacher => teacher.department)
      .filter((dept, index, self) => dept && self.indexOf(dept) === index)
      .sort();
    return departments;
  };

  const getUniqueStatuses = () => {
    const statuses = teachers
      .map(teacher => teacher.status)
      .filter((status, index, self) => status && self.indexOf(status) === index)
      .sort();
    console.log('Available teacher statuses:', statuses);
    return statuses;
  };

  const getPaginatedTeachers = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredTeachers.slice(startIndex, endIndex);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDepartmentFilter('all');
    setSortBy('name');
    setSortOrder('asc');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading teachers...</p>
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
              <Link href="/school-admin/dashboard" className="btn btn-outline-secondary">
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="h3 mb-0 fw-bold text-dark">
                  <i className="fas fa-chalkboard-teacher me-2 text-primary"></i>
                  Teachers Management
                </h1>
                <p className="text-muted mb-0">Manage all teachers in your school</p>
              </div>
            </div>
            <div>
              <button 
                className="btn btn-outline-secondary me-2" 
                onClick={fetchTeachers}
                title="Refresh teachers list"
              >
                <i className="fas fa-sync-alt me-2"></i>
                Refresh
              </button>
              <button className="btn btn-outline-primary me-2" title="Export to CSV">
                <Download size={18} className="me-2" />
                Export
              </button>
            </div>
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
                placeholder="Search teachers by name, email, department..."
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
              <option value="resigned">Resigned</option>
              <option value="retired">Retired</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div className="col-md-2">
            <select
              className="form-select"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="all">All Departments</option>
              {getUniqueDepartments().map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <select
              className="form-select"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order as 'asc' | 'desc');
              }}
            >
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="email-asc">Email A-Z</option>
              <option value="email-desc">Email Z-A</option>
              <option value="department-asc">Department A-Z</option>
              <option value="department-desc">Department Z-A</option>
              <option value="experience-desc">Experience High-Low</option>
              <option value="experience-asc">Experience Low-High</option>
            </select>
          </div>
          <div className="col-md-2">
            <div className="d-flex gap-2">
              <button 
                className="btn btn-outline-secondary flex-fill"
                onClick={clearFilters}
                title="Clear all filters"
              >
                <Filter size={16} />
              </button>
              <Link href="/school-admin/add-teacher" className="btn btn-primary flex-fill">
                <Plus size={16} className="me-1" />
                Add
              </Link>
            </div>
          </div>
        </div>

        {/* Teachers List */}
        <div className="card border-0 shadow">
          <div className="card-header bg-white border-0 py-3">
            <div className="d-flex align-items-center justify-content-between">
              <h5 className="mb-0 fw-bold text-dark">
                Teachers List
                <span className="badge bg-primary ms-2">{filteredTeachers.length} teachers</span>
                {filteredTeachers.length !== teachers.length && (
                  <span className="badge bg-secondary ms-1">
                    {teachers.length} total
                  </span>
                )}
              </h5>
              <div className="text-muted small">
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredTeachers.length)} to {Math.min(currentPage * itemsPerPage, filteredTeachers.length)} of {filteredTeachers.length} results
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-1">
                    <small>Available statuses: {getUniqueStatuses().join(', ')}</small>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="card-body p-0">
            {filteredTeachers.length === 0 ? (
              <div className="text-center py-5">
                <Users size={48} className="text-muted mb-3" />
                <h5 className="text-muted">No teachers found</h5>
                <p className="text-muted">
                  {searchTerm || statusFilter !== 'all' || departmentFilter !== 'all' 
                    ? 'Try adjusting your search or filters' 
                    : 'No teachers have been added yet'
                  }
                </p>
                <Link href="/school-admin/add-teacher" className="btn btn-primary">
                  <Plus size={18} className="me-2" />
                  Add Teacher
                </Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th 
                        className="border-0 cursor-pointer"
                        onClick={() => handleSort('name')}
                        style={{ cursor: 'pointer' }}
                      >
                        Teacher
                        {sortBy === 'name' && (
                          <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'} ms-1`}></i>
                        )}
                      </th>
                      <th 
                        className="border-0 cursor-pointer"
                        onClick={() => handleSort('email')}
                        style={{ cursor: 'pointer' }}
                      >
                        Contact
                        {sortBy === 'email' && (
                          <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'} ms-1`}></i>
                        )}
                      </th>
                      <th 
                        className="border-0 cursor-pointer"
                        onClick={() => handleSort('department')}
                        style={{ cursor: 'pointer' }}
                      >
                        Department
                        {sortBy === 'department' && (
                          <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'} ms-1`}></i>
                        )}
                      </th>
                      <th className="border-0">Assigned Classes</th>
                      <th 
                        className="border-0 cursor-pointer"
                        onClick={() => handleSort('experience')}
                        style={{ cursor: 'pointer' }}
                      >
                        Experience
                        {sortBy === 'experience' && (
                          <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'} ms-1`}></i>
                        )}
                      </th>
                      <th 
                        className="border-0 cursor-pointer"
                        onClick={() => handleSort('status')}
                        style={{ cursor: 'pointer' }}
                      >
                        Status
                        {sortBy === 'status' && (
                          <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'} ms-1`}></i>
                        )}
                      </th>
                      <th className="border-0">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getPaginatedTeachers().map((teacher) => (
                      <tr key={teacher.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                              <span className="text-success fw-bold">{getInitials(teacher.firstName, teacher.lastName)}</span>
                            </div>
                            <div>
                              <div className="fw-semibold">{teacher.firstName} {teacher.lastName}</div>
                              <small className="text-muted">{teacher.employeeId || `ID: ${teacher.id}`}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="text-muted small">{teacher.email}</div>
                          <small className="text-muted">{teacher.mobile || 'No mobile'}</small>
                        </td>
                        <td>
                          {teacher.department ? (
                            <span className="badge bg-info">{teacher.department}</span>
                          ) : (
                            <span className="text-muted small">Not assigned</span>
                          )}
                        </td>
                        <td>
                          {teacher.classes && teacher.classes.length > 0 ? (
                            <div className="d-flex flex-wrap gap-1">
                              {teacher.classes.map((classInfo, index) => (
                                <span 
                                  key={index} 
                                  className={`badge ${classInfo.isPrimary ? 'bg-primary' : 'bg-secondary'}`}
                                  title={classInfo.isPrimary ? 'Primary Class' : 'Additional Class'}
                                >
                                  {classInfo.name}
                                  {classInfo.isPrimary && ' ⭐'}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted small">No classes assigned</span>
                          )}
                        </td>
                        <td>
                          {teacher.experienceYears ? (
                            <span className="badge bg-warning text-dark">{teacher.experienceYears} years</span>
                          ) : (
                            <span className="text-muted small">N/A</span>
                          )}
                        </td>
                          <td>
                            <span className={`badge ${
                              teacher.status === 'active' ? 'bg-success' : 
                              teacher.status === 'inactive' ? 'bg-secondary' : 
                              teacher.status === 'resigned' ? 'bg-info' : 
                              teacher.status === 'retired' ? 'bg-warning' : 
                              teacher.status === 'suspended' ? 'bg-danger' : 
                              'bg-secondary'
                            }`}>
                              {teacher.status}
                            </span>
                          </td>
                        <td>
                          <div className="btn-group" role="group">
                            <Link href={`/school-admin/teachers/${teacher.id}`} className="btn btn-sm btn-outline-primary" title="View Details">
                              <Eye size={16} />
                            </Link>
                            <Link href={`/school-admin/teachers/${teacher.id}/edit`} className="btn btn-sm btn-outline-warning" title="Edit">
                              <Edit size={16} />
                            </Link>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteTeacher(teacher.id)}
                              title="Delete"
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
        {filteredTeachers.length > itemsPerPage && (
          <div className="d-flex justify-content-between align-items-center mt-4">
            <div className="text-muted">
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredTeachers.length)} to {Math.min(currentPage * itemsPerPage, filteredTeachers.length)} of {filteredTeachers.length} teachers
            </div>
            <nav aria-label="Teachers pagination">
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                </li>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </button>
                    </li>
                  );
                })}
                
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
