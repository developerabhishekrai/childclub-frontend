'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  BookOpen,
  Calendar,
  TrendingUp,
  Settings,
  Plus,
  MapPin,
  Bell,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  GraduationCap,
  MapPin as MapPinIcon,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX
} from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Link from 'next/link';
import { getStoredUser, getStoredToken } from '@/lib/api';

// Custom CSS for enhanced styling
const customStyles = `
  .stat-card {
    transition: all 0.3s ease;
    border: none;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    border-radius: 1rem;
    overflow: hidden;
  }
  
  .stat-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.15);
  }
  
  .quick-action-btn {
    transition: all 0.3s ease;
    border: 2px solid transparent;
    border-radius: 1rem;
    min-height: 140px;
  }
  
  .quick-action-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.15);
  }
  
  .activity-item {
    transition: all 0.3s ease;
    border-radius: 0.75rem;
    padding: 1rem;
    margin: 0.5rem 0;
  }
  
  .activity-item:hover {
    background-color: #f8f9fa;
    transform: translateX(5px);
  }
  
  .school-info-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 1.5rem;
    overflow: hidden;
  }
  
  .school-info-card .text-muted {
    color: rgba(255, 255, 255, 0.8) !important;
  }
  
  .search-box {
    transition: all 0.3s ease;
    border-radius: 2rem;
  }
  
  .search-box:focus-within {
    transform: scale(1.02);
    box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
  }
  
  .dashboard-card {
    border: none;
    border-radius: 1rem;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    transition: all 0.3s ease;
  }
  
  .dashboard-card:hover {
    box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1);
  }
  
  .stat-icon {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
  }
  
  .quick-overview-item {
    background: #f8f9fa;
    border-radius: 0.75rem;
    padding: 1rem;
    margin-bottom: 0.75rem;
    transition: all 0.3s ease;
  }
  
  .quick-overview-item:hover {
    background: #e9ecef;
    transform: translateX(3px);
  }
  
  .event-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
    margin-right: 0.5rem;
  }

  .status-badge {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
  }

  .action-btn {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
  }
`;

// Types for our data
interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  currentClass?: string;
  className?: string;
  currentClassId?: number;
  enrollmentDate: string;
  user?: User;
}

interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  status: string;
  role: string;
  // Teacher specific fields
  teacherId?: number;
  employeeId?: string;
  department?: string;
  designation?: string;
  experienceYears?: number;
  subjects?: string[];
}

interface Class {
  id: string;
  name: string;
  grade: string;
  section: string;
  studentCount: number;
  teacherName: string;
  status: string;
}

interface Task {
  id: string;
  title: string;
  type: string;
  dueDate: string;
  status: string;
  assignedTo: string;
  priority: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  eventType: string;
  startDate: string;
  endDate: string;
  location: string;
  priority: string;
}

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  activeClasses: number;
  pendingTasks: number;
  upcomingEvents: number;
  attendanceRate: number;
  averageScore: number;
}

export default function SchoolAdminDashboard() {
  // State for dynamic data
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    activeClasses: 0,
    pendingTasks: 0,
    upcomingEvents: 0,
    attendanceRate: 0,
    averageScore: 0
  });

  const [schoolInfo, setSchoolInfo] = useState({
    name: '',
    city: '',
    state: '',
    status: '',
    establishedYear: 0,
    type: '',
    rating: ''
  });

  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check if we're on client side
      if (typeof window === 'undefined') {
        console.log('Server side rendering, skipping data fetch');
        return;
      }
      
      const token = getStoredToken();
      const userData = getStoredUser() || {};
      const schoolId = userData.schoolId || 1; // Temporary fallback for schoolId

      console.log('Frontend Dashboard - Data Check:', {
        token: token ? 'Present' : 'Missing',
        tokenLength: token ? token.length : 0,
        userData: userData,
        schoolId: schoolId,
        schoolIdType: typeof schoolId,
        localStorageKeys: Object.keys(localStorage)
      });

      if (!token || !schoolId) {
        console.error('No token or schoolId found:', { token: !!token, schoolId: schoolId });
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch dashboard stats (no schoolId needed in URL, it comes from JWT)
      const statsResponse = await fetch(`http://localhost:3001/dashboard/stats`, { headers });
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log('Dashboard Stats Response:', statsData);
        setStats({
          totalStudents: statsData.totalStudents || 0,
          totalTeachers: statsData.totalTeachers || 0,
          totalClasses: statsData.totalClasses || 0,
          activeClasses: statsData.activeClasses || 0,
          pendingTasks: statsData.pendingTasks || 0,
          upcomingEvents: statsData.upcomingEvents || 0,
          attendanceRate: statsData.attendanceRate || 0,
          averageScore: statsData.averageScore || 0
        });
      } else {
        console.error('Stats API Error:', statsResponse.status, statsResponse.statusText);
        // Fallback to hardcoded data for testing
        console.log('Using fallback data');
        setStats({
          totalStudents: 3,
          totalTeachers: 2,
          totalClasses: 1,
          activeClasses: 1,
          pendingTasks: 0,
          upcomingEvents: 0,
          attendanceRate: 94.5,
          averageScore: 87.2
        });
      }

      // Fetch school info (using JWT token's schoolId)
      const schoolResponse = await fetch(`http://localhost:3001/schools/me`, { headers });
      if (schoolResponse.ok) {
        const schoolData = await schoolResponse.json();
        console.log('School Info Response:', schoolData);
        setSchoolInfo({
          name: schoolData.name || '',
          city: schoolData.city || '',
          state: schoolData.state || '',
          status: schoolData.status || '',
          establishedYear: schoolData.establishedYear || 0,
          type: schoolData.type || '',
          rating: '4.8/5' // Default rating
        });
      } else {
        console.error('School API Error:', schoolResponse.status, schoolResponse.statusText);
      }

      // Fetch students for this school
      const studentsResponse = await fetch(`http://localhost:3001/students`, { headers });
      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json();
        console.log('Students Response:', studentsData);
        setStudents(studentsData.data || studentsData || []);
      } else {
        console.error('Students API Error:', studentsResponse.status, studentsResponse.statusText);
      }

      // Fetch teachers for this school
      const teachersResponse = await fetch(`http://localhost:3001/teachers`, { headers });
      if (teachersResponse.ok) {
        const teachersData = await teachersResponse.json();
        console.log('Teachers Response:', teachersData);
        setTeachers(teachersData.data || teachersData || []);
      } else {
        console.error('Teachers API Error:', teachersResponse.status, teachersResponse.statusText);
      }

      // Fetch classes for this school
      const classesResponse = await fetch(`http://localhost:3001/classes`, { headers });
      if (classesResponse.ok) {
        const classesData = await classesResponse.json();
        console.log('Classes Response:', classesData);
        setClasses(classesData.data || classesData || []);
      } else {
        console.error('Classes API Error:', classesResponse.status, classesResponse.statusText);
      }

      // Fetch calendar events for this school
      const eventsResponse = await fetch(`http://localhost:3001/calendar/upcoming?limit=5`, { headers });
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        console.log('Calendar Events Response:', eventsData);
        setUpcomingEvents(eventsData || []);
      } else {
        console.error('Calendar Events API Error:', eventsResponse.status, eventsResponse.statusText);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch dashboard data on component mount
  useEffect(() => {
    console.log('Dashboard useEffect triggered');
    fetchDashboardData();
  }, []);

  // Handle student status change
  const handleStudentStatusChange = async (studentId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication required');
        return;
      }

      const response = await fetch(`http://localhost:3001/students/${studentId}/status`, {
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
          student.id === studentId 
            ? { ...student, status: newStatus }
            : student
        ));
        
        // Update stats
        setStats(prev => ({
          ...prev,
          totalStudents: newStatus === 'active' 
            ? prev.totalStudents + 1 
            : prev.totalStudents - 1
        }));

        alert(`Student status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error('Error updating student status:', error);
      alert('Failed to update student status');
    }
  };

  // Handle delete student
  const handleDeleteStudent = async (studentId: string) => {
    if (confirm('⚠️ Are you sure you want to delete this student?')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Authentication required');
          return;
        }

        const response = await fetch(`http://localhost:3001/students/${studentId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          setStudents(prev => prev.filter(student => student.id !== studentId));
          setStats(prev => ({ ...prev, totalStudents: prev.totalStudents - 1 }));
          alert('✅ Student deleted successfully!');
          fetchDashboardData();
        } else {
          alert('❌ Failed to delete student');
        }
      } catch (error) {
        console.error('Error deleting student:', error);
        alert('❌ Error deleting student');
      }
    }
  };

  // Handle delete teacher
  const handleDeleteTeacher = async (teacherId: number) => {
    if (confirm('⚠️ Are you sure you want to delete this teacher?')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Authentication required');
          return;
        }

        const response = await fetch(`http://localhost:3001/teachers/${teacherId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          setTeachers(prev => prev.filter(teacher => teacher.id !== teacherId));
          setStats(prev => ({ ...prev, totalTeachers: prev.totalTeachers - 1 }));
          alert('✅ Teacher deleted successfully!');
          fetchDashboardData();
        } else {
          alert('❌ Failed to delete teacher');
        }
      } catch (error) {
        console.error('Error deleting teacher:', error);
        alert('❌ Error deleting teacher');
      }
    }
  };

  // Handle teacher status change
  const handleTeacherStatusChange = async (teacherId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication required');
        return;
      }

      const response = await fetch(`http://localhost:3001/teachers/${teacherId}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Update local state
        setTeachers(prev => prev.map(teacher => 
          teacher.id === teacherId 
            ? { ...teacher, status: newStatus }
            : teacher
        ));
        
        // Update stats
        setStats(prev => ({
          ...prev,
          totalTeachers: newStatus === 'active' 
            ? prev.totalTeachers + 1 
            : prev.totalTeachers - 1
        }));

        alert(`Teacher status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error('Error updating teacher status:', error);
      alert('Failed to update teacher status');
    }
  };

  // Filter data based on search and filter
  const filteredStudents = students.filter(student => {
    const firstName = student.firstName || student.user?.firstName || '';
    const lastName = student.lastName || student.user?.lastName || '';
    const email = student.email || student.user?.email || '';
    
    const matchesSearch = firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || student.status === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  const filteredTeachers = teachers.filter(teacher => {
    const firstName = teacher.firstName || '';
    const lastName = teacher.lastName || '';
    const email = teacher.email || '';
    
    const matchesSearch = firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || teacher.status === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  // Function to get upcoming events (next 30 days)
  const getUpcomingEvents = () => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    return upcomingEvents
      .filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate >= today && eventDate <= thirtyDaysFromNow;
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 5); // Show only next 5 events
  };

  // Function to format event date and get time until event
  const formatEventTime = (dateString: string) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `In ${diffDays} days`;
    if (diffDays <= 14) return 'Next week';
    if (diffDays <= 21) return 'In 2 weeks';
    return 'In 3 weeks';
  };

  // Function to get event type color
  const getEventTypeColor = (type: string) => {
    const colors = {
      meeting: 'bg-primary',
      event: 'bg-success',
      exam: 'bg-warning',
      curriculum: 'bg-info',
      activity: 'bg-warning',
      academic: 'bg-info',
      holiday: 'bg-secondary'
    };
    return colors[type as keyof typeof colors] || 'bg-secondary';
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{customStyles}</style>

      <div className="min-vh-100 bg-light">
        {/* Top Header Bar */}
        <div className="bg-white shadow-sm border-bottom">
          <div className="container-fluid py-4">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-4">
                <h3 className="fw-bold text-dark mb-0">
                  <i className="fas fa-tachometer-alt me-2 text-primary"></i>
                  School Admin Dashboard
                </h3>
                <span className={`badge fs-6 px-3 py-2 ${schoolInfo.status === 'approved' ? 'bg-success' : 'bg-warning'}`}>
                  <i className={`fas fa-${schoolInfo.status === 'approved' ? 'check-circle' : 'clock'} me-2`}></i>
                  {schoolInfo.status === 'approved' ? 'Active School' : 'Pending Approval'}
                </span>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="position-relative search-box">
                  <input
                    type="text"
                    className="form-control form-control-lg border-0 shadow-sm"
                    placeholder="Search students, teachers, classes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{width: '300px', paddingLeft: '1rem', paddingRight: '3rem'}}
                  />
                  <Search size={20} className="position-absolute top-50 end-0 translate-middle-y text-muted me-3" />
                </div>
                <select 
                  className="form-select form-select-lg border-0 shadow-sm"
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  style={{width: '150px'}}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
                <button className="btn btn-outline-primary btn-lg position-relative">
                  <Bell size={20} className="me-2" />
                  Notifications
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger fs-6">
                    3
                  </span>
                </button>
                <button className="btn btn-primary btn-lg d-flex align-items-center gap-2">
                  <Plus size={20} />
                  Quick Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="container-fluid py-5">
          {/* School Info Card */}
          <div className="row mb-5">
            <div className="col-12">
              <div className="card school-info-card border-0 shadow">
                <div className="card-body p-5">
                  <div className="row align-items-center">
                    <div className="col-md-8">
                      <h2 className="fw-bold text-white mb-3">
                        <i className="fas fa-school me-3"></i>
                        {schoolInfo.name}
                      </h2>
                      <p className="text-muted mb-3 fs-5">
                        <MapPin size={20} className="me-2" />
                        {schoolInfo.city}, {schoolInfo.state}
                      </p>
                      <div className="d-flex gap-4">
                        <span className="text-muted fs-6">
                          <i className="fas fa-calendar-alt me-2"></i>
                          <strong>Established:</strong> {schoolInfo.establishedYear}
                        </span>
                        <span className="text-muted fs-6">
                          <i className="fas fa-graduation-cap me-2"></i>
                          <strong>Type:</strong> {schoolInfo.type}
                        </span>
                        <span className="text-muted fs-6">
                          <i className="fas fa-star me-2"></i>
                          <strong>Rating:</strong> {schoolInfo.rating}
                        </span>
                      </div>
                    </div>
                    <div className="col-md-4 text-end">
                      <Link href="/school-admin/profile/edit" className="btn btn-light btn-lg">
                        <Edit size={20} className="me-2" />
                        Edit Profile
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="row mb-5">
            <div className="col-xl-3 col-md-6 mb-4">
              <div className="card stat-card border-0 shadow h-100">
                <div className="card-body text-center p-4">
                  <div className="stat-icon bg-primary bg-opacity-10 text-primary mx-auto mb-3">
                    <Users size={35} />
                  </div>
                  <h3 className="fw-bold text-dark mb-2">{stats.totalStudents}</h3>
                  <p className="text-muted mb-0">Total Students</p>
                  <div className="mt-3">
                    <span className="badge bg-success-subtle text-success me-2">
                      <TrendingUp size={14} className="me-1" />
                      +12% this month
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-md-6 mb-4">
              <div className="card stat-card border-0 shadow h-100">
                <div className="card-body text-center p-4">
                  <div className="stat-icon bg-success bg-opacity-10 text-success mx-auto mb-3">
                    <GraduationCap size={35} />
                  </div>
                  <h3 className="fw-bold text-dark mb-2">{stats.totalTeachers}</h3>
                  <p className="text-muted mb-0">Total Teachers</p>
                  <div className="mt-3">
                    <span className="badge bg-success-subtle text-success me-2">
                      <TrendingUp size={14} className="me-1" />
                      +5% this month
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-md-6 mb-4">
              <div className="card stat-card border-0 shadow h-100">
                <div className="card-body text-center p-4">
                  <div className="stat-icon bg-warning bg-opacity-10 text-warning mx-auto mb-3">
                    <BookOpen size={35} />
                  </div>
                  <h3 className="fw-bold text-dark mb-2">{stats.totalClasses}</h3>
                  <p className="text-muted mb-0">Total Classes</p>
                  <div className="mt-3">
                    <span className="badge bg-warning-subtle text-warning me-2">
                      <CheckCircle size={14} className="me-1" />
                      {stats.activeClasses} Active
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-md-6 mb-4">
              <div className="card stat-card border-0 shadow h-100">
                <div className="card-body text-center p-4">
                  <div className="stat-icon bg-info bg-opacity-10 text-info mx-auto mb-3">
                    <Calendar size={35} />
                  </div>
                  <h3 className="fw-bold text-dark mb-2">{stats.upcomingEvents}</h3>
                  <p className="text-muted mb-0">Upcoming Events</p>
                  <div className="mt-3">
                    <span className="badge bg-info-subtle text-info me-2">
                      <Clock size={14} className="me-1" />
                      {stats.pendingTasks} Pending
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="row mb-5">
            <div className="col-12">
              <h4 className="fw-bold text-dark mb-4">
                <i className="fas fa-bolt me-2 text-warning"></i>
                Quick Actions
              </h4>
              <div className="row g-4">
                <div className="col-xl-3 col-md-6">
                  <Link href="/school-admin/add-student" className="text-decoration-none">
                    <div className="card quick-action-btn border-0 shadow h-100 text-center p-4 bg-primary bg-opacity-10 border-primary">
                      <div className="card-body">
                        <div className="bg-primary text-white rounded-circle mx-auto mb-3" style={{width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                          <Users size={30} />
                        </div>
                        <h5 className="fw-bold text-primary mb-2">Add Student</h5>
                        <p className="text-muted mb-0">Register new student</p>
                      </div>
                    </div>
                  </Link>
                </div>

                <div className="col-xl-3 col-md-6">
                  <Link href="/school-admin/add-teacher" className="text-decoration-none">
                    <div className="card quick-action-btn border-0 shadow h-100 text-center p-4 bg-success bg-opacity-10 border-success">
                      <div className="card-body">
                        <div className="bg-success text-white rounded-circle mx-auto mb-3" style={{width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                          <GraduationCap size={30} />
                        </div>
                        <h5 className="fw-bold text-success mb-2">Add Teacher</h5>
                        <p className="text-muted mb-0">Hire new teacher</p>
                      </div>
                    </div>
                  </Link>
                </div>

                <div className="col-xl-3 col-md-6">
                  <Link href="/school-admin/submissions" className="text-decoration-none">
                    <div className="card quick-action-btn border-0 shadow h-100 text-center p-4 bg-danger bg-opacity-10 border-danger">
                      <div className="card-body">
                        <div className="bg-danger text-white rounded-circle mx-auto mb-3" style={{width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                          <CheckCircle size={30} />
                        </div>
                        <h5 className="fw-bold text-danger mb-2">View Submissions</h5>
                        <p className="text-muted mb-0">Review student work</p>
                      </div>
                    </div>
                  </Link>
                </div>

                <div className="col-xl-3 col-md-6">
                  <Link href="/school-admin/create-assignment" className="text-decoration-none">
                    <div className="card quick-action-btn border-0 shadow h-100 text-center p-4 bg-info bg-opacity-10 border-info">
                      <div className="card-body">
                        <div className="bg-info text-white rounded-circle mx-auto mb-3" style={{width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                          <Calendar size={30} />
                        </div>
                        <h5 className="fw-bold text-info mb-2">Create Assignment</h5>
                        <p className="text-muted mb-0">Assign new task</p>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Row */}
          <div className="row">
            {/* Left Column - Students and Teachers */}
            <div className="col-xl-8">
              {/* Students Section */}
              <div className="card dashboard-card border-0 shadow mb-4">
                <div className="card-header bg-white border-0 py-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <h5 className="fw-bold text-dark mb-0">
                      <i className="fas fa-users me-2 text-primary"></i>
                      Recent Students ({filteredStudents.length})
                    </h5>
                    <Link href="/school-admin/students" className="btn btn-outline-primary btn-sm">
                      View All
                    </Link>
                  </div>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Class</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.slice(0, 5).map((student) => (
                          <tr key={student.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="bg-primary bg-opacity-10 text-primary rounded-circle me-3" style={{width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                  <Users size={20} />
                                </div>
                                <div>
                                  <div className="fw-semibold">{student.firstName || student.user?.firstName || 'N/A'} {student.lastName || student.user?.lastName || ''}</div>
                                  <small className="text-muted">Enrolled: {student.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString() : 'N/A'}</small>
                                </div>
                              </div>
                            </td>
                            <td>{student.email || student.user?.email || 'N/A'}</td>
                            <td>
                              {student.className ? (
                                <span className="badge bg-primary">{student.className}</span>
                              ) : (
                                <span className="badge bg-secondary">No Class</span>
                              )}
                            </td>
                            <td>
                              <span className={`badge status-badge ${student.status === 'active' ? 'bg-success' : student.status === 'inactive' ? 'bg-danger' : 'bg-warning'}`}>
                                {student.status}
                              </span>
                            </td>
                            <td>
                              <div className="btn-group" role="group">
                                <button 
                                  className="btn btn-sm btn-outline-primary action-btn"
                                  onClick={() => handleStudentStatusChange(student.id, student.status === 'active' ? 'inactive' : 'active')}
                                  title={student.status === 'active' ? 'Deactivate' : 'Activate'}
                                >
                                  {student.status === 'active' ? <UserX size={14} /> : <UserCheck size={14} />}
                                </button>
                                <Link href={`/school-admin/students/${student.id}/edit`} className="btn btn-sm btn-outline-warning action-btn">
                                  <Edit size={14} />
                                </Link>
                                <button 
                                  className="btn btn-sm btn-outline-danger action-btn"
                                  onClick={() => handleDeleteStudent(student.id)}
                                  title="Delete Student"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Teachers Section */}
              <div className="card dashboard-card border-0 shadow mb-4">
                <div className="card-header bg-white border-0 py-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <h5 className="fw-bold text-dark mb-0">
                      <i className="fas fa-chalkboard-teacher me-2 text-success"></i>
                      Recent Teachers ({filteredTeachers.length})
                    </h5>
                    <Link href="/school-admin/teachers" className="btn btn-outline-success btn-sm">
                      View All
                    </Link>
                  </div>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Name</th>
                          <th>Department</th>
                          <th>Subjects</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTeachers.slice(0, 5).map((teacher) => (
                          <tr key={teacher.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="bg-success bg-opacity-10 text-success rounded-circle me-3" style={{width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                  <GraduationCap size={20} />
                                </div>
                                <div>
                                  <div className="fw-semibold">{teacher.firstName || 'N/A'} {teacher.lastName || ''}</div>
                                  <small className="text-muted">{teacher.email || 'N/A'}</small>
                                </div>
                              </div>
                            </td>
                            <td>{teacher.department || 'N/A'}</td>
                            <td>
                              {(teacher.subjects || []).slice(0, 2).map((subject, index) => (
                                <span key={index} className="badge bg-light text-dark me-1">{subject}</span>
                              ))}
                              {(teacher.subjects || []).length > 2 && (
                                <span className="badge bg-secondary">+{(teacher.subjects || []).length - 2}</span>
                              )}
                            </td>
                            <td>
                              <span className={`badge status-badge ${teacher.status === 'active' ? 'bg-success' : teacher.status === 'inactive' ? 'bg-danger' : 'bg-warning'}`}>
                                {teacher.status}
                              </span>
                            </td>
                            <td>
                              <div className="btn-group" role="group">
                                <button 
                                  className="btn btn-sm btn-outline-success action-btn"
                                  onClick={() => handleTeacherStatusChange(teacher.id, teacher.status === 'active' ? 'inactive' : 'active')}
                                  title={teacher.status === 'active' ? 'Deactivate' : 'Activate'}
                                >
                                  {teacher.status === 'active' ? <UserX size={14} /> : <UserCheck size={14} />}
                                </button>
                                <Link href={`/school-admin/teachers/${teacher.id}/edit`} className="btn btn-sm btn-outline-warning action-btn">
                                  <Edit size={14} />
                                </Link>
                                <button 
                                  className="btn btn-sm btn-outline-danger action-btn"
                                  onClick={() => handleDeleteTeacher(teacher.id)}
                                  title="Delete Teacher"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="col-xl-4">
              {/* Upcoming Events */}
              <div className="card dashboard-card border-0 shadow mb-4">
                <div className="card-header bg-white border-0 py-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <h5 className="fw-bold text-dark mb-0">
                      <i className="fas fa-calendar-alt me-2 text-info"></i>
                      Upcoming Events
                    </h5>
                    <Link href="/school-admin/calendar" className="btn btn-outline-info btn-sm">
                      View All
                    </Link>
                  </div>
                </div>
                <div className="card-body p-0">
                  <div className="list-group list-group-flush">
                    {getUpcomingEvents().map((event) => (
                      <div key={event.id} className="list-group-item border-0 py-3">
                        <div className="d-flex align-items-start">
                          <div className={`event-dot ${getEventTypeColor(event.eventType)}`}></div>
                          <div className="flex-grow-1">
                            <h6 className="fw-semibold mb-1">{event.title}</h6>
                            <p className="text-muted small mb-1">{event.description}</p>
                            <div className="d-flex align-items-center gap-3">
                              <small className="text-muted">
                                <Clock size={14} className="me-1" />
                                {formatEventTime(event.startDate)}
                              </small>
                              <small className="text-muted">
                                <MapPin size={14} className="me-1" />
                                {event.location}
                              </small>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Overview */}
              <div className="card dashboard-card border-0 shadow mb-4">
                <div className="card-header bg-white border-0 py-3">
                  <h5 className="fw-bold text-dark mb-0">
                    <i className="fas fa-chart-pie me-2 text-warning"></i>
                    Quick Overview
                  </h5>
                </div>
                <div className="card-body">
                  <div className="quick-overview-item">
                    <div className="d-flex align-items-center justify-content-between">
                      <span className="text-muted">Attendance Rate</span>
                      <span className="fw-bold text-success">{stats.attendanceRate}%</span>
                    </div>
                    <div className="progress mt-2" style={{height: '6px'}}>
                      <div className="progress-bar bg-success" style={{width: `${stats.attendanceRate}%`}}></div>
                    </div>
                  </div>

                  <div className="quick-overview-item">
                    <div className="d-flex align-items-center justify-content-between">
                      <span className="text-muted">Average Score</span>
                      <span className="fw-bold text-primary">{stats.averageScore}%</span>
                    </div>
                    <div className="progress mt-2" style={{height: '6px'}}>
                      <div className="progress-bar bg-primary" style={{width: `${stats.averageScore}%`}}></div>
                    </div>
                  </div>

                  <div className="quick-overview-item">
                    <div className="d-flex align-items-center justify-content-between">
                      <span className="text-muted">Active Classes</span>
                      <span className="fw-bold text-warning">{stats.activeClasses}/{stats.totalClasses}</span>
                    </div>
                    <div className="progress mt-2" style={{height: '6px'}}>
                      <div className="progress-bar bg-warning" style={{width: `${(stats.activeClasses/stats.totalClasses)*100}%`}}></div>
                    </div>
                  </div>

                  <div className="quick-overview-item">
                    <div className="d-flex align-items-center justify-content-between">
                      <span className="text-muted">Pending Tasks</span>
                      <span className="fw-bold text-danger">{stats.pendingTasks}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activities */}
              <div className="card dashboard-card border-0 shadow">
                <div className="card-header bg-white border-0 py-3">
                  <h5 className="fw-bold text-dark mb-0">
                    <i className="fas fa-history me-2 text-secondary"></i>
                    Recent Activities
                  </h5>
                </div>
                <div className="card-body p-0">
                  <div className="list-group list-group-flush">
                    {recentActivities.slice(0, 5).map((activity, index) => (
                      <div key={index} className="list-group-item border-0 py-3">
                        <div className="d-flex align-items-start">
                          <div className="bg-primary bg-opacity-10 text-primary rounded-circle me-3" style={{width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <i className={`fas fa-${activity.icon} fa-sm`}></i>
                          </div>
                          <div className="flex-grow-1">
                            <p className="mb-1 small">{activity.description}</p>
                            <small className="text-muted">{activity.time}</small>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
