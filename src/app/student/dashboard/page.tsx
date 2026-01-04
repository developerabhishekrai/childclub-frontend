'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import 'bootstrap/dist/css/bootstrap.min.css';
import { API_BASE_URL } from '@/lib/api';

interface DashboardStats {
  totalSubjects: number;
  pendingAssignments: number;
  completedAssignments: number;
  averageScore: number;
  attendanceRate: number;
  upcomingTests: number;
}

interface Assignment {
  id: number;
  subject: string;
  title: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
}

interface RecentActivity {
  id: number;
  type: 'submission' | 'attendance' | 'grade' | 'announcement';
  title: string;
  description: string;
  time: string;
  score?: number;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [studentName, setStudentName] = useState('Student');
  const [schoolName, setSchoolName] = useState('');
  const [className, setClassName] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [stats, setStats] = useState<DashboardStats>({
    totalSubjects: 0,
    pendingAssignments: 0,
    completedAssignments: 0,
    averageScore: 0,
    attendanceRate: 0,
    upcomingTests: 0,
  });

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);

  useEffect(() => {
    fetchStudentInfo();
    fetchDashboardData();

    // Update time every minute
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchStudentInfo = async () => {
    try {
      // First try localStorage
      const storedName = localStorage.getItem('userName');
      const storedSchool = localStorage.getItem('schoolName');
      const storedClass = localStorage.getItem('className');
      
      if (storedName && storedSchool) {
        setStudentName(storedName);
        setSchoolName(storedSchool);
        setClassName(storedClass || '');
        return;
      }

      // If not in localStorage, fetch from API
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      
      if (userId && token) {
        const response = await fetch(`${API_BASE_URL}/students/by-user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const fullName = `${data.firstName} ${data.lastName}`;
          setStudentName(fullName);
          setSchoolName(data.schoolName || '');
          setClassName(data.className || '');
          localStorage.setItem('userName', fullName);
          localStorage.setItem('schoolName', data.schoolName || '');
          localStorage.setItem('className', data.className || '');
          // Store student ID separately for API calls
          localStorage.setItem('studentId', data.studentId);
        }
      }
    } catch (error) {
      console.error('Error fetching student info:', error);
      setStudentName('Student');
      setSchoolName('');
      setClassName('');
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get user info from localStorage
      let userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      // If userId not in localStorage, try to get from user object
      if (!userId && userStr) {
        try {
          const user = JSON.parse(userStr);
          userId = user.id?.toString();
          if (userId) {
            localStorage.setItem('userId', userId);
          }
        } catch (e) {
          console.error('Error parsing user:', e);
        }
      }
      
      if (!userId || !token) {
        console.error('No user ID or token found', { userId, token: !!token });
        setLoading(false);
        return;
      }

      console.log('Fetching data for userId:', userId);

      // Fetch student data using user ID
      const studentResponse = await fetch(`${API_BASE_URL}/students/by-user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!studentResponse.ok) {
        console.error('Failed to fetch student data:', studentResponse.status);
        throw new Error('Failed to fetch student data');
      }

      const studentData = await studentResponse.json();
      console.log('Student Data:', studentData);
      
      // Store actual student ID for further API calls
      const actualStudentId = studentData.studentId || studentData.id;

      // Fetch assignments for the student (from assignments table)
      console.log('Fetching assignments for userId:', userId);
      const assignmentsResponse = await fetch(`${API_BASE_URL}/assignments/by-student/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      let assignmentsData = [];
      let pendingCount = 0;
      let completedCount = 0;
      let upcomingTestsCount = 0;

      if (assignmentsResponse.ok) {
        assignmentsData = await assignmentsResponse.json();
        console.log('Assignments Data:', assignmentsData);

        // Fetch submissions to determine status
        const submissionsRes = await fetch(`${API_BASE_URL}/submissions/student/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        let submissions = [];
        if (submissionsRes.ok) {
          submissions = await submissionsRes.json();
        }

        // Merge assignments with submission status
        const assignmentsWithStatus = assignmentsData.map((assignment: any) => {
          const submission = submissions.find((s: any) => s.taskId === assignment.id);
          return {
            ...assignment,
            submissionStatus: submission?.status || 'not_started'
          };
        });

        // Filter pending and completed
        const pendingTasks = assignmentsWithStatus.filter((a: any) => 
          a.submissionStatus === 'not_started' || a.submissionStatus === 'draft'
        );
        const completedTasks = assignmentsWithStatus.filter((a: any) => 
          a.submissionStatus === 'approved'
        );
        
        pendingCount = pendingTasks.length;
        completedCount = completedTasks.length;
        
        // Count upcoming tests (assignments with type 'exam' or 'quiz')
        upcomingTestsCount = pendingTasks.filter((a: any) => 
          a.type === 'exam' || a.type === 'quiz'
        ).length;

        // Set assignments for display (only pending ones, max 5)
        const formattedAssignments = pendingTasks.slice(0, 5).map((assignment: any) => {
          const daysLeft = getDaysUntil(assignment.dueDate);
          let priority: 'high' | 'medium' | 'low' = 'medium';
          
          if (daysLeft <= 1) {
            priority = 'high';
          } else if (daysLeft <= 3) {
            priority = 'medium';
          } else {
            priority = 'low';
          }

          return {
            id: assignment.id,
            subject: assignment.tags && assignment.tags[0] || 'General',
            title: assignment.title,
            dueDate: assignment.dueDate,
            priority,
          };
        });

        setAssignments(formattedAssignments);
      }

      // Fetch submissions for the student (using actual student ID)
      const submissionsResponse = await fetch(`${API_BASE_URL}/submissions/student/${actualStudentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      let recentSubmissions: any[] = [];
      let totalScore = 0;
      let gradedCount = 0;

      if (submissionsResponse.ok) {
        const submissionsData = await submissionsResponse.json();
        console.log('Submissions Data:', submissionsData);

        // Calculate average score from graded submissions
        submissionsData.forEach((submission: any) => {
          if (submission.score !== null && submission.score !== undefined) {
            totalScore += submission.score;
            gradedCount++;
          }
        });

        // Get recent submissions for activities
        recentSubmissions = submissionsData.slice(0, 5);
      }

      const averageScore = gradedCount > 0 ? (totalScore / gradedCount).toFixed(1) : 0;

      // Fetch attendance stats (using actual student ID)
      const attendanceResponse = await fetch(`${API_BASE_URL}/attendance/stats/student/${actualStudentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      let attendanceRate = 0;

      if (attendanceResponse.ok) {
        const attendanceData = await attendanceResponse.json();
        console.log('Attendance Data:', attendanceData);
        attendanceRate = attendanceData.attendanceRate || attendanceData.percentage || 0;
      }

      // Count total subjects from class
      const totalSubjects = studentData.subjects?.length || 6;

      // Fetch calendar events
      const eventsResponse = await fetch(`${API_BASE_URL}/calendar/upcoming?limit=5`, {
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

      // Update stats
      setStats({
        totalSubjects,
        pendingAssignments: pendingCount,
        completedAssignments: completedCount,
        averageScore: parseFloat(averageScore as string),
        attendanceRate: parseFloat(attendanceRate.toFixed(1)),
        upcomingTests: upcomingTestsCount,
      });

      // Format recent activities
      const activities: RecentActivity[] = [];

      // Add recent submissions
      recentSubmissions.forEach((submission: any, index: number) => {
        if (submission.score !== null && submission.score !== undefined) {
          activities.push({
            id: submission.id,
          type: 'grade',
          title: 'Grade Received',
            description: `${submission.task?.title || 'Assignment'} - ${submission.task?.subject?.name || 'Subject'}`,
            time: getTimeAgo(submission.reviewedAt || submission.updatedAt),
            score: submission.score,
          });
        } else if (submission.submittedAt) {
          activities.push({
            id: submission.id,
          type: 'submission',
          title: 'Assignment Submitted',
            description: submission.task?.title || 'Assignment submitted',
            time: getTimeAgo(submission.submittedAt),
          });
        }
      });

      // Sort by time and limit to 5
      setRecentActivities(activities.slice(0, 5));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default values on error
      setStats({
        totalSubjects: 0,
        pendingAssignments: 0,
        completedAssignments: 0,
        averageScore: 0,
        attendanceRate: 0,
        upcomingTests: 0,
      });
      setAssignments([]);
      setRecentActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return `${diffDays} days ago`;
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

  const getDaysUntil = (dateString: string) => {
    const dueDate = new Date(dateString);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="container-fluid vh-100 d-flex justify-content-center align-items-center" style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>
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
            <div className="card shadow-lg border-0" style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>
              <div className="card-body text-white p-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h1 className="display-5 fw-bold mb-2">Welcome back, {studentName}! 👋</h1>
                    {schoolName && (
                      <p className="fs-5 mb-2">
                        <i className="bi bi-building me-2"></i>
                        {schoolName}
                      </p>
                    )}
                    {className && (
                      <p className="fs-6 mb-2">
                        <i className="bi bi-mortarboard-fill me-2"></i>
                        {className}
                      </p>
                    )}
                    <p className="fs-6 mb-1">{formatDate(currentTime)}</p>
                    <p className="mb-0">{formatTime(currentTime)}</p>
                  </div>
                  <div>
                    <button className="btn btn-light btn-lg rounded-circle position-relative">
                      <i className="bi bi-bell-fill"></i>
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        2
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
          {/* My Subjects */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card border-0 shadow h-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <div className="card-body text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-subtitle mb-2">My Subjects</h6>
                    <h2 className="card-title display-4 fw-bold">{stats.totalSubjects}</h2>
                    <p className="card-text small">Enrolled subjects</p>
                  </div>
                  <div>
                    <i className="bi bi-book-fill" style={{ fontSize: '3rem', opacity: 0.7 }}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Assignments */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card border-0 shadow h-100" style={{ background: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)' }}>
              <div className="card-body text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-subtitle mb-2">Pending Tasks</h6>
                    <h2 className="card-title display-4 fw-bold">{stats.pendingAssignments}</h2>
                    <p className="card-text small">To be completed</p>
                  </div>
                  <div>
                    <i className="bi bi-clipboard-check-fill" style={{ fontSize: '3rem', opacity: 0.7 }}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Average Score */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card border-0 shadow h-100" style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>
              <div className="card-body text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-subtitle mb-2">Average Score</h6>
                    <h2 className="card-title display-4 fw-bold">{stats.averageScore}%</h2>
                    <p className="card-text small">Overall performance</p>
                  </div>
                  <div>
                    <i className="bi bi-graph-up-arrow" style={{ fontSize: '3rem', opacity: 0.7 }}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Completed Assignments */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card border-0 shadow h-100" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
              <div className="card-body text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-subtitle mb-2">Completed Work</h6>
                    <h2 className="card-title display-4 fw-bold">{stats.completedAssignments}</h2>
                    <p className="card-text small">This semester</p>
                  </div>
                  <div>
                    <i className="bi bi-check-circle-fill" style={{ fontSize: '3rem', opacity: 0.7 }}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Attendance Rate */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card border-0 shadow h-100" style={{ background: 'linear-gradient(135deg, #7F7FD5 0%, #91EAE4 100%)' }}>
              <div className="card-body text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-subtitle mb-2">Attendance</h6>
                    <h2 className="card-title display-4 fw-bold">{stats.attendanceRate}%</h2>
                    <p className="card-text small">This month</p>
                  </div>
                  <div>
                    <i className="bi bi-calendar-check-fill" style={{ fontSize: '3rem', opacity: 0.7 }}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Tests */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card border-0 shadow h-100" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <div className="card-body text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-subtitle mb-2">Upcoming Tests</h6>
                    <h2 className="card-title display-4 fw-bold">{stats.upcomingTests}</h2>
                    <p className="card-text small">This week</p>
                  </div>
                  <div>
                    <i className="bi bi-file-earmark-text-fill" style={{ fontSize: '3rem', opacity: 0.7 }}></i>
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
            <div className="card border-0 shadow-sm h-100 text-center" style={{ cursor: 'pointer' }} onClick={() => router.push('/student/tasks')}>
              <div className="card-body">
                <div className="bg-primary bg-opacity-10 rounded-circle p-3 d-inline-block mb-3">
                  <i className="bi bi-clipboard-check-fill text-primary" style={{ fontSize: '2rem' }}></i>
                </div>
                <h6 className="card-title">My Tasks</h6>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-4 col-lg-2 mb-3">
            <div className="card border-0 shadow-sm h-100 text-center" style={{ cursor: 'pointer' }} onClick={() => router.push('/student/submissions')}>
              <div className="card-body">
                <div className="bg-success bg-opacity-10 rounded-circle p-3 d-inline-block mb-3">
                  <i className="bi bi-upload text-success" style={{ fontSize: '2rem' }}></i>
                </div>
                <h6 className="card-title">Submit Work</h6>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-4 col-lg-2 mb-3">
            <div className="card border-0 shadow-sm h-100 text-center" style={{ cursor: 'pointer' }} onClick={() => router.push('/student/grades')}>
              <div className="card-body">
                <div className="bg-warning bg-opacity-10 rounded-circle p-3 d-inline-block mb-3">
                  <i className="bi bi-bar-chart-fill text-warning" style={{ fontSize: '2rem' }}></i>
                </div>
                <h6 className="card-title">My Grades</h6>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-4 col-lg-2 mb-3">
            <div className="card border-0 shadow-sm h-100 text-center" style={{ cursor: 'pointer' }} onClick={() => router.push('/student/attendance')}>
              <div className="card-body">
                <div className="bg-info bg-opacity-10 rounded-circle p-3 d-inline-block mb-3">
                  <i className="bi bi-calendar-check text-info" style={{ fontSize: '2rem' }}></i>
                </div>
                <h6 className="card-title">Attendance</h6>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-4 col-lg-2 mb-3">
            <div className="card border-0 shadow-sm h-100 text-center" style={{ cursor: 'pointer' }}>
              <div className="card-body">
                <div className="bg-danger bg-opacity-10 rounded-circle p-3 d-inline-block mb-3">
                  <i className="bi bi-book-half text-danger" style={{ fontSize: '2rem' }}></i>
                </div>
                <h6 className="card-title">Study Materials</h6>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-4 col-lg-2 mb-3">
            <div className="card border-0 shadow-sm h-100 text-center" style={{ cursor: 'pointer' }}>
              <div className="card-body">
                <div className="bg-secondary bg-opacity-10 rounded-circle p-3 d-inline-block mb-3">
                  <i className="bi bi-calendar3 text-secondary" style={{ fontSize: '2rem' }}></i>
                </div>
                <h6 className="card-title">Schedule</h6>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="row g-4">
          {/* Pending Assignments */}
          <div className="col-12 col-lg-8">
            <div className="card border-0 shadow">
              <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center py-3">
                <h5 className="mb-0 fw-bold">📝 Pending Assignments</h5>
                <button className="btn btn-sm btn-primary" onClick={() => router.push('/student/tasks')}>View All</button>
              </div>
              <div className="card-body">
                {assignments.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <i className="bi bi-check-circle" style={{ fontSize: '3rem' }}></i>
                    <p className="mt-3">No pending assignments! Great job! 🎉</p>
                  </div>
                ) : (
                  assignments.map((assignment) => {
                    const daysLeft = getDaysUntil(assignment.dueDate);
                    return (
                      <div key={assignment.id} className={`border-start border-${getPriorityColor(assignment.priority)} border-4 bg-light rounded p-3 mb-3`}>
                        <div className="row align-items-center">
                          <div className="col-md-8">
                            <div className="d-flex align-items-center mb-2">
                              <span className={`badge bg-${getPriorityColor(assignment.priority)} me-2`}>
                                {assignment.priority.toUpperCase()}
                              </span>
                              <span className="badge bg-secondary">{assignment.subject}</span>
                            </div>
                            <h6 className="fw-bold mb-1">{assignment.title}</h6>
                            <div className="d-flex gap-3 small text-muted">
                              <span>
                                <i className="bi bi-calendar-event"></i> Due: {new Date(assignment.dueDate).toLocaleDateString('en-IN')}
                              </span>
                              <span className={daysLeft <= 2 ? 'text-danger fw-bold' : ''}>
                                <i className="bi bi-clock"></i> {daysLeft === 0 ? 'Due Today!' : daysLeft === 1 ? 'Due Tomorrow' : `${daysLeft} days left`}
                              </span>
                            </div>
                          </div>
                          <div className="col-md-4 text-md-end mt-2 mt-md-0">
                            <button className="btn btn-primary" onClick={() => router.push('/student/submissions')}>
                              Submit Work
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
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
                      activity.type === 'grade' ? 'bg-success bg-opacity-10' :
                      activity.type === 'submission' ? 'bg-primary bg-opacity-10' :
                      activity.type === 'attendance' ? 'bg-info bg-opacity-10' : 'bg-warning bg-opacity-10'
                    }`}>
                      <i className={`bi ${
                        activity.type === 'grade' ? 'bi-trophy-fill text-success' :
                        activity.type === 'submission' ? 'bi-file-earmark-check-fill text-primary' :
                        activity.type === 'attendance' ? 'bi-check-circle-fill text-info' : 'bi-megaphone-fill text-warning'
                      }`} style={{ fontSize: '1.5rem' }}></i>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-1 small fw-bold">{activity.title}</h6>
                      <p className="mb-1 small text-muted">{activity.description}</p>
                      {activity.score && (
                        <p className="mb-1 small">
                          <span className="badge bg-success">Score: {activity.score}/20</span>
                        </p>
                      )}
                      <p className="mb-0" style={{ fontSize: '0.75rem', color: '#999' }}>{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
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

