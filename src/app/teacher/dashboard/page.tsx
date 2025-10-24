'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import 'bootstrap/dist/css/bootstrap.min.css';

interface DashboardStats {
  totalClasses: number;
  totalStudents: number;
  pendingSubmissions: number;
  todayAttendance: number;
  activeAssignments: number;
  averageScore: number;
}

interface UpcomingClass {
  id: number;
  subject: string;
  className: string;
  time: string;
  room: string;
  studentsCount: number;
}

interface RecentActivity {
  id: number;
  type: 'submission' | 'attendance' | 'grade' | 'announcement';
  title: string;
  description: string;
  time: string;
}

export default function TeacherDashboard() {
  const router = useRouter();
  const [teacherName, setTeacherName] = useState('Teacher');
  const [schoolName, setSchoolName] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [stats, setStats] = useState<DashboardStats>({
    totalClasses: 0,
    totalStudents: 0,
    pendingSubmissions: 0,
    todayAttendance: 0,
    activeAssignments: 0,
    averageScore: 0,
  });

  const [upcomingClasses, setUpcomingClasses] = useState<UpcomingClass[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [teacherClasses, setTeacherClasses] = useState<any[]>([]);
  const [studentsData, setStudentsData] = useState<any>(null);

  useEffect(() => {
    fetchTeacherInfo();
    fetchDashboardData();

    // Update time every minute
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchTeacherInfo = async () => {
    try {
      // First try localStorage
      const storedName = localStorage.getItem('userName');
      const storedSchool = localStorage.getItem('schoolName');
      if (storedName && storedSchool) {
        setTeacherName(storedName);
        setSchoolName(storedSchool);
        return;
      }

      // If not in localStorage, fetch from API
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      
      if (userId && token) {
        const response = await fetch(`http://localhost:3001/teachers/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const fullName = `${data.firstName} ${data.lastName}`;
          setTeacherName(fullName);
          setSchoolName(data.schoolName || '');
          localStorage.setItem('userName', fullName);
          localStorage.setItem('schoolName', data.schoolName || '');
        }
      }
    } catch (error) {
      console.error('Error fetching teacher info:', error);
      setTeacherName('Teacher');
      setSchoolName('');
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        setLoading(false);
        return;
      }

      // Fetch teacher's classes
      const classesResponse = await fetch('http://localhost:3001/teachers/my-classes', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      let teacherClasses: any[] = [];
      if (classesResponse.ok) {
        teacherClasses = await classesResponse.json();
        console.log('Teacher classes:', teacherClasses);
        setTeacherClasses(teacherClasses);
      }

      // Fetch teacher's students from assigned classes
      const studentsResponse = await fetch('http://localhost:3001/teachers/my/students', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      let studentCount = 0;
      let todayAttendanceCount = 0;
      let uniqueClassesCount = 0;
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json();
        studentCount = studentsData.students?.length || 0;
        console.log('My students count:', studentCount);
        setStudentsData(studentsData);

        // Count unique classes from students data
        if (studentsData.students && studentsData.students.length > 0) {
          const uniqueClasses = new Set();
          studentsData.students.forEach((student: any) => {
            if (student.currentClassId) {
              uniqueClasses.add(student.currentClassId);
            }
          });
          uniqueClassesCount = uniqueClasses.size;
          console.log('Unique classes from students:', uniqueClassesCount);
        }

        // Fetch today's attendance for teacher's classes
        if (teacherClasses.length > 0) {
          const attendancePromises = teacherClasses.map(async (classItem) => {
            try {
              const attendanceResponse = await fetch(
                `http://localhost:3001/attendance/class/${classItem.classId}?date=${today}`,
                {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                  },
                }
              );

              if (attendanceResponse.ok) {
                const attendanceData = await attendanceResponse.json();
                console.log(`Attendance for class ${classItem.classId}:`, attendanceData);
                
                // Count present students (present + late = attended)
                const presentCount = attendanceData.filter((record: any) => 
                  record.status === 'present' || record.status === 'late'
                ).length;
                
                return presentCount;
              }
              return 0;
            } catch (error) {
              console.error(`Error fetching attendance for class ${classItem.classId}:`, error);
              return 0;
            }
          });

          const attendanceCounts = await Promise.all(attendancePromises);
          todayAttendanceCount = attendanceCounts.reduce((sum, count) => sum + count, 0);
          console.log('Today\'s attendance count:', todayAttendanceCount);
        }
      }

      // Fetch real dashboard stats from API
      const statsResponse = await fetch('http://localhost:3001/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (statsResponse.ok) {
        const dashboardStats = await statsResponse.json();
        console.log('Dashboard stats:', dashboardStats);
        
        setStats({
          totalClasses: Math.max(teacherClasses.length, uniqueClassesCount), // Use higher count
          totalStudents: studentCount, // Use actual student count from assigned classes
          pendingSubmissions: dashboardStats.pendingTasks || 0,
          todayAttendance: todayAttendanceCount, // Use real attendance count
          activeAssignments: dashboardStats.pendingTasks || 0,
          averageScore: dashboardStats.averageScore || 0,
        });
      } else {
        console.error('Failed to fetch dashboard stats');
        // Set basic stats even if API fails
        setStats({
          totalClasses: Math.max(teacherClasses.length, uniqueClassesCount), // Use higher count
          totalStudents: studentCount,
          pendingSubmissions: 0,
          todayAttendance: todayAttendanceCount,
          activeAssignments: 0,
          averageScore: 0,
        });
      }

      // Fetch calendar events
      const eventsResponse = await fetch('http://localhost:3001/calendar/upcoming?limit=5', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        console.log('Calendar events:', eventsData);
        setCalendarEvents(eventsData || []);
      } else {
        console.error('Failed to fetch calendar events');
      }

      // Fetch recent activities
      const activitiesResponse = await fetch('http://localhost:3001/dashboard/activities', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (activitiesResponse.ok) {
        const activities = await activitiesResponse.json();
        setRecentActivities(activities.slice(0, 3).map((activity: any) => ({
          id: activity.id,
          type: activity.type as 'submission' | 'attendance' | 'grade' | 'announcement',
          title: activity.message,
          description: activity.details,
          time: new Date(activity.timestamp).toLocaleString('en-IN', { 
            hour: '2-digit', 
            minute: '2-digit',
            day: 'numeric',
            month: 'short'
          }),
        })));
      }

      // For now, keep mock upcoming classes until we have calendar API
      setUpcomingClasses([
        {
          id: 1,
          subject: 'Mathematics',
          className: 'Class 10-A',
          time: '09:00 AM',
          room: 'Room 101',
          studentsCount: 35,
        },
        {
          id: 2,
          subject: 'Physics',
          className: 'Class 9-B',
          time: '11:00 AM',
          room: 'Lab 201',
          studentsCount: 32,
        },
        {
          id: 3,
          subject: 'Mathematics',
          className: 'Class 10-C',
          time: '02:00 PM',
          room: 'Room 103',
          studentsCount: 30,
        },
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="container-fluid vh-100 d-flex justify-content-center align-items-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="text-center">
          <div className="spinner-border text-light" role="status" style={{ width: '4rem', height: '4rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4 className="text-white mt-3">Loading Dashboard...</h4>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh' }}>
      <div className="container-fluid p-4">
        {/* Header Section */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow-lg border-0" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <div className="card-body text-white p-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h1 className="display-5 fw-bold mb-2">Welcome back, {teacherName}! 👋</h1>
                    {schoolName && (
                      <p className="fs-5 mb-2">
                        <i className="bi bi-building me-2"></i>
                        {schoolName}
                      </p>
                    )}
                    <p className="fs-6 mb-1">{formatDate(currentTime)}</p>
                    <p className="mb-0">{formatTime(currentTime)}</p>
                  </div>
                  <div>
                    <button className="btn btn-light btn-lg rounded-circle position-relative">
                      <i className="bi bi-bell-fill"></i>
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        3
                        <span className="visually-hidden">unread notifications</span>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="row g-4 mb-4">
          {/* My Classes */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card border-0 shadow h-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <div className="card-body text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-subtitle mb-2">My Classes</h6>
                    <h2 className="card-title display-4 fw-bold">{stats.totalClasses}</h2>
                    <p className="card-text small">Active Classes</p>
                  </div>
                  <div>
                    <i className="bi bi-book-fill" style={{ fontSize: '3rem', opacity: 0.7 }}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Total Students */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card border-0 shadow h-100" style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>
              <div className="card-body text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-subtitle mb-2">Total Students</h6>
                    <h2 className="card-title display-4 fw-bold">{stats.totalStudents}</h2>
                    <p className="card-text small">Across all classes</p>
                  </div>
                  <div>
                    <i className="bi bi-people-fill" style={{ fontSize: '3rem', opacity: 0.7 }}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Reviews */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card border-0 shadow h-100" style={{ background: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)' }}>
              <div className="card-body text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-subtitle mb-2">Pending Reviews</h6>
                    <h2 className="card-title display-4 fw-bold">{stats.pendingSubmissions}</h2>
                    <p className="card-text small">Need grading</p>
                  </div>
                  <div>
                    <i className="bi bi-clipboard-check-fill" style={{ fontSize: '3rem', opacity: 0.7 }}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Attendance */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card border-0 shadow h-100" style={{ background: 'linear-gradient(135deg, #7F7FD5 0%, #91EAE4 100%)' }}>
              <div className="card-body text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-subtitle mb-2">Today's Attendance</h6>
                    <h2 className="card-title display-4 fw-bold">{stats.todayAttendance}</h2>
                    <p className="card-text small">Students present</p>
                  </div>
                  <div>
                    <i className="bi bi-person-check-fill" style={{ fontSize: '3rem', opacity: 0.7 }}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Assignments */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card border-0 shadow h-100" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <div className="card-body text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-subtitle mb-2">Active Assignments</h6>
                    <h2 className="card-title display-4 fw-bold">{stats.activeAssignments}</h2>
                    <p className="card-text small">Currently active</p>
                  </div>
                  <div>
                    <i className="bi bi-file-text-fill" style={{ fontSize: '3rem', opacity: 0.7 }}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Average Score */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card border-0 shadow h-100" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
              <div className="card-body text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-subtitle mb-2">Average Score</h6>
                    <h2 className="card-title display-4 fw-bold">{stats.averageScore}%</h2>
                    <p className="card-text small">Class performance</p>
                  </div>
                  <div>
                    <i className="bi bi-graph-up-arrow" style={{ fontSize: '3rem', opacity: 0.7 }}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="row mb-4">
          <div className="col-12">
            <h3 className="mb-3 fw-bold">⚡ Quick Actions</h3>
          </div>
          <div className="col-6 col-md-4 col-lg-2 mb-3">
            <div className="card border-0 shadow-sm h-100 text-center" style={{ cursor: 'pointer' }} onClick={() => router.push('/teacher/attendance')}>
              <div className="card-body">
                <div className="bg-primary bg-opacity-10 rounded-circle p-3 d-inline-block mb-3">
                  <i className="bi bi-person-check-fill text-primary" style={{ fontSize: '2rem' }}></i>
                </div>
                <h6 className="card-title">Mark Attendance</h6>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-4 col-lg-2 mb-3">
            <div className="card border-0 shadow-sm h-100 text-center" style={{ cursor: 'pointer' }} onClick={() => router.push('/teacher/tasks')}>
              <div className="card-body">
                <div className="bg-success bg-opacity-10 rounded-circle p-3 d-inline-block mb-3">
                  <i className="bi bi-plus-circle-fill text-success" style={{ fontSize: '2rem' }}></i>
                </div>
                <h6 className="card-title">New Assignment</h6>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-4 col-lg-2 mb-3">
            <div className="card border-0 shadow-sm h-100 text-center" style={{ cursor: 'pointer' }} onClick={() => router.push('/teacher/submissions')}>
              <div className="card-body">
                <div className="bg-warning bg-opacity-10 rounded-circle p-3 d-inline-block mb-3">
                  <i className="bi bi-clipboard-check text-warning" style={{ fontSize: '2rem' }}></i>
                </div>
                <h6 className="card-title">Review Work</h6>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-4 col-lg-2 mb-3">
            <div className="card border-0 shadow-sm h-100 text-center" style={{ cursor: 'pointer' }} onClick={() => router.push('/teacher/students')}>
              <div className="card-body">
                <div className="bg-info bg-opacity-10 rounded-circle p-3 d-inline-block mb-3">
                  <i className="bi bi-people-fill text-info" style={{ fontSize: '2rem' }}></i>
                </div>
                <h6 className="card-title">My Students</h6>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-4 col-lg-2 mb-3">
            <div className="card border-0 shadow-sm h-100 text-center" style={{ cursor: 'pointer' }} onClick={() => router.push('/teacher/reports')}>
              <div className="card-body">
                <div className="bg-secondary bg-opacity-10 rounded-circle p-3 d-inline-block mb-3">
                  <i className="bi bi-bar-chart-fill text-secondary" style={{ fontSize: '2rem' }}></i>
                </div>
                <h6 className="card-title">Reports</h6>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="row g-4">
          {/* Upcoming Classes */}
          <div className="col-12 col-lg-8">
            <div className="card border-0 shadow">
              <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center py-3">
                <h5 className="mb-0 fw-bold">📅 Today's Schedule</h5>
                <button className="btn btn-sm btn-primary">View All</button>
              </div>
              <div className="card-body">
                {upcomingClasses.map((classItem) => (
                  <div key={classItem.id} className="border-start border-primary border-4 bg-light rounded p-3 mb-3">
                    <div className="row align-items-center">
                      <div className="col-md-8">
                        <h6 className="fw-bold mb-1">{classItem.subject}</h6>
                        <p className="text-muted mb-2">{classItem.className}</p>
                        <div className="d-flex gap-3 small text-muted">
                          <span><i className="bi bi-clock"></i> {classItem.time}</span>
                          <span><i className="bi bi-geo-alt"></i> {classItem.room}</span>
                          <span><i className="bi bi-people"></i> {classItem.studentsCount} students</span>
                        </div>
                      </div>
                      <div className="col-md-4 text-md-end mt-2 mt-md-0">
                        <button className="btn btn-primary">Start Class</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* School Calendar Events */}
          <div className="col-12 col-lg-4">
            <div className="card border-0 shadow mb-4">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="mb-0 fw-bold">📅 Upcoming Events</h5>
              </div>
              <div className="card-body">
                {calendarEvents.length === 0 ? (
                  <p className="text-muted text-center small">No upcoming events</p>
                ) : (
                  calendarEvents.map((event) => (
                    <div key={event.id} className="d-flex align-items-start mb-3 p-2 rounded hover-bg-light">
                      <div className="rounded-circle p-2 me-3 bg-info bg-opacity-10">
                        <i className="bi bi-calendar-event-fill text-info" style={{ fontSize: '1.5rem' }}></i>
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="mb-1 small fw-bold">{event.title}</h6>
                        <p className="mb-1 small text-muted">{event.description || 'School Event'}</p>
                        <div style={{ fontSize: '0.75rem', color: '#999' }}>
                          <div>
                            <strong>Start:</strong> {new Date(event.startDate).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          {event.endDate && (
                            <div>
                              <strong>End:</strong> {new Date(event.endDate).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="col-12 col-lg-4">
            <div className="card border-0 shadow">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="mb-0 fw-bold">📊 Recent Activities</h5>
              </div>
              <div className="card-body">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="d-flex align-items-start mb-3 p-2 rounded hover-bg-light">
                    <div className={`rounded-circle p-2 me-3 ${
                      activity.type === 'submission' ? 'bg-primary bg-opacity-10' :
                      activity.type === 'attendance' ? 'bg-success bg-opacity-10' :
                      activity.type === 'grade' ? 'bg-warning bg-opacity-10' : 'bg-info bg-opacity-10'
                    }`}>
                      <i className={`bi ${
                        activity.type === 'submission' ? 'bi-file-earmark-text-fill text-primary' :
                        activity.type === 'attendance' ? 'bi-check-circle-fill text-success' :
                        activity.type === 'grade' ? 'bi-award-fill text-warning' : 'bi-bell-fill text-info'
                      }`} style={{ fontSize: '1.5rem' }}></i>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-1 small fw-bold">{activity.title}</h6>
                      <p className="mb-1 small text-muted">{activity.description}</p>
                      <p className="mb-0" style={{ fontSize: '0.75rem', color: '#999' }}>{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Classes Overview Section */}
        {teacherClasses.length > 0 && (
          <div className="row g-4 mb-4">
            <div className="col-12">
              <div className="card border-0 shadow">
                <div className="card-header bg-white border-0 py-3">
                  <h5 className="mb-0 fw-bold">📚 My Classes Overview</h5>
                  <p className="text-muted mb-0 small">Classes assigned to you with student counts</p>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    {teacherClasses.map((classItem, index) => {
                      // Count students in this class
                      const studentsInClass = studentsData?.students?.filter((student: any) => 
                        student.currentClassId === classItem.id
                      ) || [];
                      
                      return (
                        <div key={classItem.id || index} className="col-12 col-md-6 col-lg-4">
                          <div className="card border-0 shadow-sm h-100">
                            <div className="card-body">
                              <div className="d-flex align-items-start justify-content-between mb-3">
                                <div className="d-flex align-items-center">
                                  <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                                    <i className="bi bi-book-fill text-primary fs-4"></i>
                                  </div>
                                  <div>
                                    <h6 className="card-title mb-1 fw-bold">
                                      {classItem.name || `Class ${classItem.grade}-${classItem.section}`}
                                    </h6>
                                    <span className="badge bg-secondary-subtle text-secondary">
                                      {classItem.grade} - {classItem.section}
                                    </span>
                                  </div>
                                </div>
                                {classItem.isPrimary && (
                                  <span className="badge bg-warning text-dark">
                                    <i className="bi bi-star-fill me-1"></i>
                                    Primary
                                  </span>
                                )}
                              </div>
                              
                              <div className="row g-2 mb-3">
                                <div className="col-6">
                                  <div className="bg-light rounded p-2 text-center">
                                    <i className="bi bi-people-fill text-info mb-1"></i>
                                    <div className="fw-bold">{studentsInClass.length}</div>
                                    <small className="text-muted">Students</small>
                                  </div>
                                </div>
                                <div className="col-6">
                                  <div className="bg-light rounded p-2 text-center">
                                    <i className="bi bi-calendar-check text-success mb-1"></i>
                                    <div className="fw-bold">Active</div>
                                    <small className="text-muted">Status</small>
                                  </div>
                                </div>
                              </div>

                              <div className="d-grid gap-2">
                                <button 
                                  className="btn btn-outline-primary btn-sm"
                                  onClick={() => router.push(`/teacher/students?classId=${classItem.id}`)}
                                >
                                  <i className="bi bi-people me-1"></i>
                                  View Students
                                </button>
                                <button 
                                  className="btn btn-outline-success btn-sm"
                                  onClick={() => router.push(`/teacher/attendance?classId=${classItem.id}`)}
                                >
                                  <i className="bi bi-calendar-check me-1"></i>
                                  Mark Attendance
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {teacherClasses.length === 0 && (
                    <div className="text-center py-4">
                      <i className="bi bi-book text-muted" style={{ fontSize: '3rem' }}></i>
                      <h6 className="text-muted mt-3">No Classes Assigned</h6>
                      <p className="text-muted small">Contact your school administrator to get classes assigned.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .hover-bg-light:hover {
          background-color: #f8f9fa;
          transition: background-color 0.2s ease;
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
