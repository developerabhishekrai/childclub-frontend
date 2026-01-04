'use client';

import React, { useState, useEffect } from 'react';
import { getStoredUser, clearAuthData, API_BASE_URL } from '@/lib/api';
import { 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Phone,
  Globe,
  Mail
} from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';

// Custom CSS for hover effects
const customStyles = `
  .hover-shadow:hover {
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
    transform: translateY(-2px);
    transition: all 0.3s ease;
  }
  
  .card {
    transition: all 0.3s ease;
  }
`;

interface School {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  city: string;
  state: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  createdAt: string;
}

interface SuperAdminData {
  firstName?: string
  lastName?: string
  email: string
  role: string
}

export default function SuperAdminSchoolsList() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [userData, setUserData] = useState<SuperAdminData | null>(null);

  // Check URL parameters on mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const status = params.get('status');
      if (status) {
        setStatusFilter(status);
      }
    }
  }, []);

  // Get user data using centralized function
  React.useEffect(() => {
    const storedUserData = getStoredUser();
    if (storedUserData) {
      setUserData(storedUserData);
    }
  }, []);

  // Load Bootstrap JS for dropdown functionality
  React.useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleLogout = () => {
    clearAuthData(); // Clears all auth data: token, user, userRole, userEmail, userData
    window.location.href = '/';
  };
  const [stats, setStats] = useState({
    totalSchools: 0,
    pendingSchools: 0,
    approvedSchools: 0,
    rejectedSchools: 0,
    suspendedSchools: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0
  });

  // Fetch real data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch schools data
        const schoolsResponse = await fetch(`${API_BASE_URL}/schools`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (schoolsResponse.ok) {
          const schoolsData = await schoolsResponse.json();
          const schoolsList = schoolsData.data || schoolsData || [];
          setSchools(schoolsList);
          
          // Calculate totals from schools data (only schools with actual students)
          const schoolsWithStudents = schoolsList.filter((school: School) => school.totalStudents > 0);
          
          const totalStudents = schoolsWithStudents.reduce((sum: number, school: School) => sum + (school.totalStudents || 0), 0);
          const totalTeachers = schoolsWithStudents.reduce((sum: number, school: School) => sum + (school.totalTeachers || 0), 0);
          const totalClasses = schoolsWithStudents.reduce((sum: number, school: School) => sum + (school.totalClasses || 0), 0);
          
          // Count schools by status (all schools, not just with students)
          const pendingSchools = schoolsList.filter((school: School) => school.status === 'pending').length;
          const approvedSchools = schoolsList.filter((school: School) => school.status === 'approved').length;
          const rejectedSchools = schoolsList.filter((school: School) => school.status === 'rejected').length;
          const suspendedSchools = schoolsList.filter((school: School) => school.status === 'suspended').length;
          
          setStats({
            totalSchools: schoolsWithStudents.length, // Only schools with students
            pendingSchools,
            approvedSchools,
            rejectedSchools,
            suspendedSchools,
            totalStudents,
            totalTeachers,
            totalClasses
          });
        } else {
          console.error('Failed to fetch schools data');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getBootstrapStatusClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-success';
      case 'pending':
        return 'bg-warning';
      case 'rejected':
        return 'bg-danger';
      case 'suspended':
        return 'bg-secondary';
      default:
        return 'bg-secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={16} />;
      case 'pending':
        return <Clock size={16} />;
      case 'rejected':
        return <XCircle size={16} />;
      case 'suspended':
        return <XCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'primary':
        return 'Primary';
      case 'secondary':
        return 'Secondary';
      case 'high_school':
        return 'High School';
      case 'higher_secondary':
        return 'Higher Secondary';
      case 'international':
        return 'International';
      case 'special_needs':
        return 'Special Needs';
      default:
        return type;
    }
  };

  const filteredSchools = schools.filter(school => {
    const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         school.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         school.state.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || school.status === statusFilter;
    const matchesType = typeFilter === 'all' || school.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const refreshData = async () => {
    try {
      const schoolsResponse = await fetch(`${API_BASE_URL}/schools`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (schoolsResponse.ok) {
        const schoolsData = await schoolsResponse.json();
        const schoolsList = schoolsData.data || schoolsData || [];
        setSchools(schoolsList);
        
        // Recalculate stats (only schools with actual students)
        const schoolsWithStudents = schoolsList.filter((school: School) => school.totalStudents > 0);
        
        const totalStudents = schoolsWithStudents.reduce((sum: number, school: School) => sum + (school.totalStudents || 0), 0);
        const totalTeachers = schoolsWithStudents.reduce((sum: number, school: School) => sum + (school.totalTeachers || 0), 0);
        const totalClasses = schoolsWithStudents.reduce((sum: number, school: School) => sum + (school.totalClasses || 0), 0);
        
        const pendingSchools = schoolsList.filter((school: School) => school.status === 'pending').length;
        const approvedSchools = schoolsList.filter((school: School) => school.status === 'approved').length;
        const rejectedSchools = schoolsList.filter((school: School) => school.status === 'rejected').length;
        const suspendedSchools = schoolsList.filter((school: School) => school.status === 'suspended').length;
        
        setStats({
          totalSchools: schoolsWithStudents.length, // Only schools with students
          pendingSchools,
          approvedSchools,
          rejectedSchools,
          suspendedSchools,
          totalStudents,
          totalTeachers,
          totalClasses
        });
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  const handleApproveSchool = async (schoolId: string) => {
    setActionLoading(schoolId);
    try {
      const response = await fetch(`${API_BASE_URL}/schools/${schoolId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ comments: 'School approved by Super Admin' }),
      });

      if (response.ok) {
        alert('School approved successfully!');
        // Refresh data to get updated stats
        await refreshData();
      } else {
        alert('Failed to approve school');
      }
    } catch (error) {
      console.error('Error approving school:', error);
      alert('Error approving school');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectSchool = async (schoolId: string) => {
    const reason = prompt('Please enter rejection reason:');
    if (!reason) return;

    setActionLoading(schoolId);
    try {
      const response = await fetch(`${API_BASE_URL}/schools/${schoolId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        alert('School rejected successfully!');
        // Refresh data to get updated stats
        await refreshData();
      } else {
        alert('Failed to reject school');
      }
    } catch (error) {
      console.error('Error rejecting school:', error);
      alert('Error rejecting school');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspendSchool = async (schoolId: string) => {
    const reason = prompt('Please enter suspension reason:');
    if (!reason) return;

    setActionLoading(schoolId);
    try {
      const response = await fetch(`${API_BASE_URL}/schools/${schoolId}/suspend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        alert('School suspended successfully!');
        // Refresh data to get updated stats
        await refreshData();
      } else {
        alert('Failed to suspend school');
      }
    } catch (error) {
      console.error('Error suspending school:', error);
      alert('Error suspending school');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteSchool = async (schoolId: string, schoolName: string) => {
    // First confirmation
    const confirmDelete = confirm(
      `⚠️ DELETE SCHOOL?\n\nSchool: ${schoolName}\n\nWARNING: This will permanently delete:\n• All teachers\n• All students\n• All classes\n• All assignments\n• All school data\n\nThis action CANNOT be undone!\n\nClick OK to continue or Cancel to abort.`
    );
    
    if (!confirmDelete) return;

    // Second confirmation for extra safety
    const finalConfirm = confirm(
      `🚨 FINAL WARNING!\n\nYou are about to PERMANENTLY DELETE "${schoolName}"\n\nAre you absolutely sure?\n\nClick OK to DELETE or Cancel to abort.`
    );
    
    if (!finalConfirm) return;

    setActionLoading(schoolId);
    try {
      const response = await fetch(`${API_BASE_URL}/schools/${schoolId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        alert(`✅ School "${schoolName}" has been deleted successfully!`);
        // Refresh data to get updated stats
        await refreshData();
      } else {
        const errorData = await response.json();
        alert(`❌ Failed to delete school:\n${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting school:', error);
      alert('❌ Network error while deleting school.\nPlease check your connection and try again.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{customStyles}</style>
      <div className="min-vh-100 bg-light">
        {/* Navigation Header */}
        <nav className="navbar navbar-expand-lg navbar-dark bg-danger shadow-sm">
          <div className="container-fluid">
            <div className="navbar-brand d-flex align-items-center">
              <a href="/super-admin/dashboard" className="text-white text-decoration-none">
                <span className="fs-2 me-2">👑</span>
                <span className="fw-bold">Super Admin Portal</span>
              </a>
            </div>
            
            <div className="navbar-nav ms-auto">
              <div className="nav-item dropdown">
                <a className="nav-link dropdown-toggle text-white" href="#" role="button" data-bs-toggle="dropdown">
                  <span className="me-2">👤</span>
                  {userData?.firstName || userData?.email || 'Super Admin'}
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li><a className="dropdown-item" href="/super-admin/dashboard"><span className="me-2">🏠</span>Dashboard</a></li>
                  <li><a className="dropdown-item" href="#"><span className="me-2">⚙️</span>Settings</a></li>
                  <li><a className="dropdown-item" href="#"><span className="me-2">👤</span>Profile</a></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><button className="dropdown-item text-danger" onClick={handleLogout}><span className="me-2">🚪</span>Logout</button></li>
                </ul>
              </div>
            </div>
          </div>
        </nav>

        {/* Page Header */}
        <div className="bg-white shadow-sm border-bottom">
          <div className="container py-4">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h1 className="display-4 fw-bold text-dark mb-2">Schools Management</h1>
                <p className="lead text-muted">Manage all registered schools in the system</p>
              </div>
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-outline-secondary btn-lg d-flex align-items-center gap-2"
                  onClick={refreshData}
                  disabled={loading}
                >
                  <div className={`spinner-border spinner-border-sm ${loading ? '' : 'd-none'}`} role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <span className={loading ? 'd-none' : ''}>Refresh</span>
                </button>
                <a href="/super-admin/schools/add" className="btn btn-primary btn-lg d-flex align-items-center gap-2">
                  <Plus size={20} />
                  Add New School
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="container py-4">
          <div className="row g-4 mb-4">
            <div className="col-md-3">
              <div className="card bg-primary text-white h-100">
                <div className="card-body text-center">
                  {loading ? (
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  ) : (
                    <>
                      <h3 className="card-title mb-0">{stats.totalSchools}</h3>
                      <p className="card-text">Total Schools</p>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-warning text-white h-100">
                <div className="card-body text-center">
                  {loading ? (
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  ) : (
                    <>
                      <h3 className="card-title mb-0">{stats.pendingSchools}</h3>
                      <p className="card-text">Pending Approval</p>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-success text-white h-100">
                <div className="card-body text-center">
                  {loading ? (
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  ) : (
                    <>
                      <h3 className="card-title mb-0">{stats.totalStudents}</h3>
                      <p className="card-text">Total Students</p>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-info text-white h-100">
                <div className="card-body text-center">
                  {loading ? (
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  ) : (
                    <>
                      <h3 className="card-title mb-0">{stats.totalTeachers}</h3>
                      <p className="card-text">Total Teachers</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Status Breakdown */}
          <div className="row g-4 mb-4">
            <div className="col-md-2">
              <div className="card bg-success text-white h-100">
                <div className="card-body text-center">
                  {loading ? (
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  ) : (
                    <>
                      <h5 className="card-title mb-0">{stats.approvedSchools}</h5>
                      <p className="card-text small">Approved</p>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-2">
              <div className="card bg-danger text-white h-100">
                <div className="card-body text-center">
                  {loading ? (
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  ) : (
                    <>
                      <h5 className="card-title mb-0">{stats.rejectedSchools}</h5>
                      <p className="card-text small">Rejected</p>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-2">
              <div className="card bg-secondary text-white h-100">
                <div className="card-body text-center">
                  {loading ? (
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  ) : (
                    <>
                      <h5 className="card-title mb-0">{stats.suspendedSchools}</h5>
                      <p className="card-text small">Suspended</p>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card bg-light h-100">
                <div className="card-body text-center">
                  <h6 className="card-title text-muted">System Overview</h6>
                  {loading ? (
                    <div className="spinner-border spinner-border-sm text-muted" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  ) : (
                    <p className="card-text small text-muted mb-0">
                      {stats.totalSchools} Schools • {stats.totalStudents} Students • {stats.totalTeachers} Teachers
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="row g-3">
                {/* Search */}
                <div className="col-md-6 col-lg-3">
                  <div className="position-relative">
                    <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={20} />
                    <input
                      type="text"
                      className="form-control ps-5"
                      placeholder="Search schools..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="col-md-6 col-lg-2">
                  <select
                    className="form-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                {/* Type Filter */}
                <div className="col-md-6 col-lg-2">
                  <select
                    className="form-select"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="primary">Primary</option>
                    <option value="secondary">Secondary</option>
                    <option value="high_school">High School</option>
                    <option value="higher_secondary">Higher Secondary</option>
                    <option value="international">International</option>
                    <option value="special_needs">Special Needs</option>
                  </select>
                </div>

                {/* Results Count */}
                <div className="col-md-6 col-lg-5 d-flex align-items-center justify-content-center">
                  <span className="text-muted">
                    {filteredSchools.length} of {schools.length} schools
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Schools Grid */}
          <div className="row g-4">
            {filteredSchools.map((school) => (
              <div key={school.id} className="col-lg-6 col-xl-4">
                <div className="card h-100 shadow-sm border-0 hover-shadow">
                  {/* School Header */}
                  <div className="card-header bg-transparent border-bottom">
                    <div className="d-flex align-items-start justify-content-between">
                      <div className="flex-grow-1">
                        <h5 className="card-title mb-2">{school.name}</h5>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <span className={`badge ${getBootstrapStatusClass(school.status)} d-flex align-items-center gap-1`}>
                            {getStatusIcon(school.status)}
                            {school.status.charAt(0).toUpperCase() + school.status.slice(1)}
                          </span>
                          <span className="badge bg-primary">
                            {getTypeLabel(school.type)}
                          </span>
                        </div>
                      </div>
                      <button className="btn btn-link text-muted p-0">
                        <MoreVertical size={20} />
                      </button>
                    </div>
                  </div>

                  {/* School Details */}
                  <div className="card-body">
                    <div className="mb-4">
                      <div className="d-flex align-items-center gap-2 mb-2 text-muted small">
                        <MapPin size={16} />
                        <span>{school.city}, {school.state}, {school.country}</span>
                      </div>
                      <div className="d-flex align-items-center gap-2 mb-2 text-muted small">
                        <Phone size={16} />
                        <span>{school.phone}</span>
                      </div>
                      <div className="d-flex align-items-center gap-2 mb-2 text-muted small">
                        <Mail size={16} />
                        <span>{school.email}</span>
                      </div>
                      {school.website && (
                        <div className="d-flex align-items-center gap-2 mb-2 text-muted small">
                          <Globe size={16} />
                          <a href={school.website} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                            {school.website}
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Statistics */}
                    <div className="row text-center py-3 border-top">
                      <div className="col-6">
                        <div className="h5 mb-1 text-dark">{school.totalStudents}</div>
                        <div className="small text-muted">Students</div>
                      </div>
                      <div className="col-6">
                        <div className="h5 mb-1 text-dark">{school.totalTeachers}</div>
                        <div className="small text-muted">Teachers</div>
                      </div>
                    </div>

                                         {/* Actions */}
                     <div className="card-footer bg-transparent border-top pt-3">
                       {school.status === 'pending' ? (
                         <div className="row g-2">
                           <div className="col-6">
                             <button 
                               className="btn btn-success btn-sm w-100 d-flex align-items-center justify-content-center gap-1"
                               onClick={() => handleApproveSchool(school.id)}
                               disabled={actionLoading === school.id}
                             >
                               {actionLoading === school.id ? (
                                 <div className="spinner-border spinner-border-sm" role="status">
                                   <span className="visually-hidden">Loading...</span>
                                 </div>
                               ) : (
                                 <CheckCircle size={16} />
                               )}
                               Approve
                             </button>
                           </div>
                           <div className="col-6">
                             <button 
                               className="btn btn-danger btn-sm w-100 d-flex align-items-center justify-content-center gap-1"
                               onClick={() => handleRejectSchool(school.id)}
                               disabled={actionLoading === school.id}
                             >
                               {actionLoading === school.id ? (
                                 <div className="spinner-border spinner-border-sm" role="status">
                                   <span className="visually-hidden">Loading...</span>
                                 </div>
                               ) : (
                                 <XCircle size={16} />
                               )}
                               Reject
                             </button>
                           </div>
                         </div>
                       ) : (
                         <div className="row g-2">
                           <div className="col-4">
                             <button className="btn btn-outline-primary btn-sm w-100 d-flex align-items-center justify-content-center gap-1">
                               <Eye size={16} />
                               View
                             </button>
                           </div>
                           <div className="col-4">
                             <button className="btn btn-outline-warning btn-sm w-100 d-flex align-items-center justify-content-center gap-1">
                               <Edit size={16} />
                               Edit
                             </button>
                           </div>
                           {school.status === 'approved' ? (
                             <div className="col-4">
                               <button 
                                 className="btn btn-outline-secondary btn-sm w-100 d-flex align-items-center justify-content-center gap-1"
                                 onClick={() => handleSuspendSchool(school.id)}
                                 disabled={actionLoading === school.id}
                               >
                                 {actionLoading === school.id ? (
                                   <div className="spinner-border spinner-border-sm" role="status">
                                     <span className="visually-hidden">Loading...</span>
                                   </div>
                                 ) : (
                                   <XCircle size={16} />
                                 )}
                                 Suspend
                               </button>
                             </div>
                           ) : (
                            <div className="col-4">
                              <button 
                                className="btn btn-outline-danger btn-sm w-100 d-flex align-items-center justify-content-center gap-1"
                                onClick={() => handleDeleteSchool(school.id, school.name)}
                                disabled={actionLoading === school.id}
                              >
                                {actionLoading === school.id ? (
                                  <div className="spinner-border spinner-border-sm" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                  </div>
                                ) : (
                                  <Trash2 size={16} />
                                )}
                                Delete
                              </button>
                            </div>
                           )}
                         </div>
                       )}
                     </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredSchools.length === 0 && (
            <div className="text-center py-5">
              <div className="text-muted mb-3">
                <Search size={64} className="mx-auto" />
              </div>
              <h4 className="text-dark mb-2">No schools found</h4>
              <p className="text-muted">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
