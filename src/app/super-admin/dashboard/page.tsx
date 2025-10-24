'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getStoredUser, clearAuthData } from '@/lib/api'

interface SuperAdminData {
  firstName?: string
  lastName?: string
  email: string
  role: string
}

interface ContactSubmission {
  id: number
  name: string
  email: string
  phone: string
  subject: string
  message: string
  status: string
  createdAt: string
}

export default function SuperAdminDashboard() {
  const [userData, setUserData] = useState<SuperAdminData | null>(null)
  const [stats, setStats] = useState({
    totalSchools: 0,
    totalAdmins: 0,
    totalTeachers: 0,
    totalStudents: 0,
    activeUsers: 0,
    pendingSchools: 0,
    systemHealth: 'Excellent'
  })
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([])
  const [contactStats, setContactStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0
  })

  useEffect(() => {
    // Get user data using centralized function
    const storedUserData = getStoredUser()
    if (storedUserData) {
      setUserData(storedUserData)
    }

    // Load Bootstrap JS for dropdown functionality
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js'
    script.async = true
    document.body.appendChild(script)

    // Fetch real stats from API
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token')
        
        // Fetch super admin stats from dedicated endpoint
        const statsResponse = await fetch('http://localhost:3001/dashboard/super-admin/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          
          setStats({
            totalSchools: statsData.totalSchools || 0,
            totalAdmins: statsData.totalAdmins || 0,
            totalTeachers: statsData.totalTeachers || 0,
            totalStudents: statsData.totalStudents || 0,
            activeUsers: statsData.activeUsers || 0,
            pendingSchools: statsData.pendingSchools || 0,
            systemHealth: statsData.systemHealth || 'Excellent'
          })
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
        // Fallback to default values on error
        setStats({
          totalSchools: 0,
          totalAdmins: 0,
          totalTeachers: 0,
          totalStudents: 0,
          activeUsers: 0,
          pendingSchools: 0,
          systemHealth: 'Unknown'
        })
      }
    }

    fetchStats()

    // Fetch contact submissions
    const fetchContactSubmissions = async () => {
      try {
        const token = localStorage.getItem('token')
        
        const response = await fetch('http://localhost:3001/contact', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setContactSubmissions(data.slice(0, 5)) // Show only latest 5
        }

        // Fetch contact stats
        const statsResponse = await fetch('http://localhost:3001/contact/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setContactStats(statsData)
        }
      } catch (error) {
        console.error('Error fetching contact submissions:', error)
      }
    }

    fetchContactSubmissions()

    return () => {
      // Cleanup Bootstrap script
      const scripts = document.querySelectorAll('script[src*="bootstrap"]')
      scripts.forEach(script => {
        if (document.body.contains(script)) {
          document.body.removeChild(script)
        }
      })
    }
  }, [])

  const handleLogout = () => {
    clearAuthData() // Clears all auth data: token, user, userRole, userEmail, userData
    window.location.href = '/'
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* Navigation Header */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-danger shadow-sm">
        <div className="container-fluid">
          <div className="navbar-brand d-flex align-items-center">
            <span className="fs-2 me-2">👑</span>
            <span className="fw-bold">Super Admin Portal</span>
          </div>
          
          <div className="navbar-nav ms-auto">
            <div className="nav-item dropdown">
              <a className="nav-link dropdown-toggle text-white" href="#" role="button" data-bs-toggle="dropdown">
                <span className="me-2">👤</span>
                {userData?.firstName || userData?.email || 'Super Admin'}
              </a>
              <ul className="dropdown-menu dropdown-menu-end">
                <li><a className="dropdown-item" href="#"><span className="me-2">⚙️</span>Settings</a></li>
                <li><a className="dropdown-item" href="#"><span className="me-2">👤</span>Profile</a></li>
                <li><hr className="dropdown-divider" /></li>
                <li><button className="dropdown-item text-danger" onClick={handleLogout}><span className="me-2">🚪</span>Logout</button></li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      <div className="container-fluid py-4">
        {/* Welcome Section */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card bg-gradient-danger text-white border-0">
              <div className="card-body p-4">
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <h1 className="h2 fw-bold mb-2">Welcome back, {userData?.firstName || 'Super Administrator'}! 👋</h1>
                    <p className="mb-0 opacity-75">You have full control over the entire ChildClub Management System</p>
                  </div>
                  <div className="col-md-4 text-end">
                    <div className="bg-white bg-opacity-20 rounded-circle d-inline-flex align-items-center justify-content-center" style={{width: '80px', height: '80px'}}>
                      <span className="fs-1">👑</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Approvals Alert */}
        {stats.pendingSchools > 0 && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="alert alert-warning alert-dismissible fade show border-0 shadow-sm" role="alert">
                <div className="d-flex align-items-center">
                  <span className="fs-2 me-3">⚠️</span>
                  <div className="flex-grow-1">
                    <h5 className="alert-heading mb-1">
                      🔔 {stats.pendingSchools} School{stats.pendingSchools > 1 ? 's' : ''} Pending Approval!
                    </h5>
                    <p className="mb-0">
                      You have {stats.pendingSchools} new school registration{stats.pendingSchools > 1 ? 's' : ''} waiting for your approval. 
                      Please review and approve them to allow schools to start using the system.
                    </p>
                  </div>
                  <Link href="/super-admin/schools/list?status=pending" className="btn btn-warning btn-lg ms-3">
                    <span className="me-2">👁️</span>Review Now
                  </Link>
                </div>
                <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="row mb-4">
          <div className="col-xl-3 col-md-6 mb-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                    <span className="fs-2 text-primary">🏫</span>
                  </div>
                  <div>
                    <h6 className="card-title text-muted mb-1">Total Schools</h6>
                    <h3 className="fw-bold mb-0">{stats.totalSchools}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6 mb-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="bg-warning bg-opacity-10 rounded-circle p-3 me-3">
                    <span className="fs-2 text-warning">👨‍💼</span>
                  </div>
                  <div>
                    <h6 className="card-title text-muted mb-1">School Admins</h6>
                    <h3 className="fw-bold mb-0">{stats.totalAdmins}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6 mb-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="bg-success bg-opacity-10 rounded-circle p-3 me-3">
                    <span className="fs-2 text-success">👨‍🏫</span>
                  </div>
                  <div>
                    <h6 className="card-title text-muted mb-1">Teachers</h6>
                    <h3 className="fw-bold mb-0">{stats.totalTeachers}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6 mb-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="bg-info bg-opacity-10 rounded-circle p-3 me-3">
                    <span className="fs-2 text-info">👨‍🎓</span>
                  </div>
                  <div>
                    <h6 className="card-title text-muted mb-1">Students</h6>
                    <h3 className="fw-bold mb-0">{stats.totalStudents}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Health & Quick Actions */}
        <div className="row mb-4">
          <div className="col-lg-8 mb-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-transparent border-0">
                <h5 className="card-title mb-0">📊 System Overview</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <div className="d-flex align-items-center p-3 bg-light rounded">
                      <span className="fs-1 me-3">🟢</span>
                      <div>
                        <h6 className="mb-1">System Health</h6>
                        <span className="badge bg-success">{stats.systemHealth}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="d-flex align-items-center p-3 bg-light rounded">
                      <span className="fs-1 me-3">👥</span>
                      <div>
                        <h6 className="mb-1">Active Users</h6>
                        <span className="badge bg-primary">{stats.activeUsers}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="d-flex align-items-center p-3 bg-light rounded">
                      <span className="fs-1 me-3">📈</span>
                      <div>
                        <h6 className="mb-1">Growth Rate</h6>
                        <span className="badge bg-info">+12.5%</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="d-flex align-items-center p-3 bg-light rounded">
                      <span className="fs-1 me-3">🔒</span>
                      <div>
                        <h6 className="mb-1">Security Status</h6>
                        <span className="badge bg-success">Protected</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4 mb-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-transparent border-0">
                <h5 className="card-title mb-0">⚡ Quick Actions</h5>
              </div>
              <div className="card-body">
                <div className="d-grid gap-2">
                  <Link href="/super-admin/schools" className="btn btn-outline-primary">
                    <span className="me-2">🏫</span>Manage Schools
                  </Link>
                  <Link href="/super-admin/users" className="btn btn-outline-success">
                    <span className="me-2">👥</span>User Management
                  </Link>
                  <Link href="/super-admin/settings" className="btn btn-outline-warning">
                    <span className="me-2">⚙️</span>System Settings
                  </Link>
                  <Link href="/super-admin/reports" className="btn btn-outline-info">
                    <span className="me-2">📊</span>Generate Reports
                  </Link>
                  <Link href="/super-admin/backup" className="btn btn-outline-secondary">
                    <span className="me-2">💾</span>Backup System
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Management Sections */}
        <div className="row">
          <div className="col-lg-6 mb-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-transparent border-0">
                <h5 className="card-title mb-0">🏫 School Management</h5>
              </div>
              <div className="card-body">
                <div className="list-group list-group-flush">
                  <Link href="/super-admin/schools/add" className="list-group-item list-group-item-action d-flex align-items-center">
                    <span className="me-3">➕</span>
                    <div>
                      <h6 className="mb-1">Add New School</h6>
                      <small className="text-muted">Register a new educational institution</small>
                    </div>
                  </Link>
                  <Link href="/super-admin/schools/list" className="list-group-item list-group-item-action d-flex align-items-center">
                    <span className="me-3">📋</span>
                    <div>
                      <h6 className="mb-1">View All Schools</h6>
                      <small className="text-muted">Manage existing schools and their settings</small>
                    </div>
                  </Link>
                  <Link href="/super-admin/schools/approvals" className="list-group-item list-group-item-action d-flex align-items-center">
                    <span className="me-3">✅</span>
                    <div>
                      <h6 className="mb-1">Pending Approvals</h6>
                      <small className="text-muted">Review and approve new school registrations</small>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6 mb-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-transparent border-0">
                <h5 className="card-title mb-0">👥 User Management</h5>
              </div>
              <div className="card-body">
                <div className="list-group list-group-flush">
                  <Link href="/super-admin/users/admins" className="list-group-item list-group-item-action d-flex align-items-center">
                    <span className="me-3">👨‍💼</span>
                    <div>
                      <h6 className="mb-1">School Administrators</h6>
                      <small className="text-muted">Manage school admin accounts and permissions</small>
                    </div>
                  </Link>
                  <Link href="/super-admin/users/teachers" className="list-group-item list-group-item-action d-flex align-items-center">
                    <span className="me-3">👨‍🏫</span>
                    <div>
                      <h6 className="mb-1">Teacher Accounts</h6>
                      <small className="text-muted">Oversee teacher registrations and access</small>
                    </div>
                  </Link>
                  <Link href="/super-admin/users/students" className="list-group-item list-group-item-action d-flex align-items-center">
                    <span className="me-3">👨‍🎓</span>
                    <div>
                      <h6 className="mb-1">Student Records</h6>
                      <small className="text-muted">View and manage student information</small>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Monitoring */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent border-0">
                <h5 className="card-title mb-0">🔍 System Monitoring</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3 mb-3">
                    <div className="text-center p-3 bg-light rounded">
                      <span className="fs-1 d-block mb-2">💾</span>
                      <h6>Database Status</h6>
                      <span className="badge bg-success">Online</span>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="text-center p-3 bg-light rounded">
                      <span className="fs-1 d-block mb-2">🌐</span>
                      <h6>API Status</h6>
                      <span className="badge bg-success">Active</span>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="text-center p-3 bg-light rounded">
                      <span className="fs-1 d-block mb-2">📧</span>
                      <h6>Email Service</h6>
                      <span className="badge bg-success">Running</span>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="text-center p-3 bg-light rounded">
                      <span className="fs-1 d-block mb-2">🔐</span>
                      <h6>Security</h6>
                      <span className="badge bg-success">Protected</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Submissions Section */}
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">📧 Contact Submissions</h5>
                <div className="d-flex gap-2">
                  <span className="badge bg-warning">{contactStats.pending} Pending</span>
                  <span className="badge bg-info">{contactStats.inProgress} In Progress</span>
                  <span className="badge bg-success">{contactStats.resolved} Resolved</span>
                </div>
              </div>
              <div className="card-body">
                {contactSubmissions.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <span className="fs-1 d-block mb-3">📭</span>
                    <p className="mb-0">No contact submissions yet</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Subject</th>
                          <th>Message</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contactSubmissions.map((submission) => (
                          <tr key={submission.id}>
                            <td className="fw-semibold">{submission.name}</td>
                            <td>
                              <a href={`mailto:${submission.email}`} className="text-decoration-none">
                                {submission.email}
                              </a>
                            </td>
                            <td>{submission.subject}</td>
                            <td>
                              <span className="d-inline-block text-truncate" style={{maxWidth: '200px'}}>
                                {submission.message}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${
                                submission.status === 'pending' ? 'bg-warning' :
                                submission.status === 'in_progress' ? 'bg-info' :
                                submission.status === 'resolved' ? 'bg-success' :
                                'bg-secondary'
                              }`}>
                                {submission.status === 'pending' ? 'Pending' :
                                 submission.status === 'in_progress' ? 'In Progress' :
                                 submission.status === 'resolved' ? 'Resolved' :
                                 'Closed'}
                              </span>
                            </td>
                            <td className="text-muted">
                              {new Date(submission.createdAt).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {contactSubmissions.length > 0 && (
                  <div className="text-center mt-3">
                    <p className="text-muted mb-0">
                      Showing latest {contactSubmissions.length} submissions. 
                      Total: {contactStats.total}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
