'use client'

import { useState } from 'react'
import Link from 'next/link'

const roles = [
  {
    id: 'student',
    name: 'Student',
    description: 'Access your tasks, assignments, and curriculum',
    color: 'primary',
    href: '/student/login',
  },
  {
    id: 'teacher',
    name: 'Teacher',
    description: 'Manage students, classes, and academic activities',
    color: 'success',
    href: '/teacher/login',
  },
  {
    id: 'school-admin',
    name: 'School Admin',
    description: 'Oversee entire school system and generate reports',
    color: 'warning',
    href: '/admin/login',
  },
]

export default function HomePage() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null)

  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <header className="bg-white shadow-sm border-bottom sticky-top">
        <nav className="navbar navbar-expand-lg navbar-light">
          <div className="container">
            <div className="navbar-brand">
              <h1 className="h3 fw-bold text-dark mb-0">
                🎓 ChildClub
              </h1>
            </div>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <div className="navbar-nav ms-auto">
                <Link href="/" className="nav-link">Home</Link>
                <Link href="/features" className="nav-link">Features</Link>
                <Link href="/about" className="nav-link">About</Link>
                <Link href="/contact" className="nav-link">Contact</Link>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="hero-section">
        <div className="container text-center py-5">
          <div className="mb-4">
            <span className="badge bg-white text-primary px-4 py-2 rounded-pill shadow-sm mb-3">
              🚀 Modern School Management Solution
            </span>
          </div>
          <h1 className="display-3 fw-bold text-white mb-4">
            Complete School Management
            <br />
            <span className="text-warning">Platform</span>
          </h1>
          <p className="lead text-white mb-5 mx-auto" style={{maxWidth: '700px'}}>
            Streamline your educational institution with our comprehensive management system. 
            From student portals to administrative dashboards, we've got everything covered.
          </p>
          
          {/* Role Selection */}
          <div className="row g-4 mb-5 justify-content-center">
            {roles.map((role) => (
              <div key={role.id} className="col-md-6 col-lg-4">
                <div 
                  className={`card h-100 shadow-lg border-0 hover-lift ${
                    selectedRole === role.id ? 'border-3 border-primary' : ''
                  }`}
                  onClick={() => setSelectedRole(role.id)}
                  style={{cursor: 'pointer', transition: 'all 0.3s ease'}}
                >
                  <div className="card-body text-center p-4">
                    <div className={`bg-${role.color} bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3`} style={{width: '80px', height: '80px'}}>
                      <span className={`text-${role.color} fs-1`}>
                        {role.id === 'student' && '📚'}
                        {role.id === 'teacher' && '👨‍🏫'}
                        {role.id === 'school-admin' && '🏫'}
                      </span>
                    </div>
                    <h3 className="h4 fw-bold mb-2">{role.name}</h3>
                    <p className="text-muted mb-4">{role.description}</p>
                    <Link
                      href={role.href}
                      className={`btn btn-${role.color} w-100 py-2`}
                    >
                      Access Portal →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Stats Section */}
      <section className="py-5 bg-primary text-white">
        <div className="container">
          <div className="row g-4 text-center">
            <div className="col-md-3">
              <div className="mb-2">
                <span className="display-4 fw-bold">500+</span>
              </div>
              <p className="mb-0">Schools Using</p>
            </div>
            <div className="col-md-3">
              <div className="mb-2">
                <span className="display-4 fw-bold">50K+</span>
              </div>
              <p className="mb-0">Active Students</p>
            </div>
            <div className="col-md-3">
              <div className="mb-2">
                <span className="display-4 fw-bold">5K+</span>
              </div>
              <p className="mb-0">Teachers</p>
            </div>
            <div className="col-md-3">
              <div className="mb-2">
                <span className="display-4 fw-bold">99%</span>
              </div>
              <p className="mb-0">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-5 bg-white">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">
              Powerful Features for Every Role
            </h2>
            <p className="lead text-muted">
              Discover what makes ChildClub the perfect choice for your institution
            </p>
          </div>

          <div className="row g-4 mb-5">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center p-4">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '70px', height: '70px'}}>
                    <span className="text-primary fs-1">📚</span>
                  </div>
                  <h3 className="h5 fw-bold mb-3">Student Management</h3>
                  <p className="text-muted">
                    Track progress, manage assignments, and monitor achievements with comprehensive student profiles and analytics.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center p-4">
                  <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '70px', height: '70px'}}>
                    <span className="text-success fs-1">👨‍🏫</span>
                  </div>
                  <h3 className="h5 fw-bold mb-3">Teacher Tools</h3>
                  <p className="text-muted">
                    Create assignments, grade work, and track student performance with powerful teacher management tools.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center p-4">
                  <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '70px', height: '70px'}}>
                    <span className="text-warning fs-1">🏫</span>
                  </div>
                  <h3 className="h5 fw-bold mb-3">Administrative Control</h3>
                  <p className="text-muted">
                    Comprehensive reporting and school-wide management with detailed analytics and insights.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center p-4">
                  <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '70px', height: '70px'}}>
                    <span className="text-info fs-1">📊</span>
                  </div>
                  <h3 className="h5 fw-bold mb-3">Real-time Reports</h3>
                  <p className="text-muted">
                    Generate instant reports on attendance, performance, and activities with exportable data.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center p-4">
                  <div className="bg-danger bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '70px', height: '70px'}}>
                    <span className="text-danger fs-1">📅</span>
                  </div>
                  <h3 className="h5 fw-bold mb-3">Calendar & Scheduling</h3>
                  <p className="text-muted">
                    Manage events, schedules, and deadlines with integrated calendar functionality.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center p-4">
                  <div className="bg-secondary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '70px', height: '70px'}}>
                    <span className="text-secondary fs-1">🔒</span>
                  </div>
                  <h3 className="h5 fw-bold mb-3">Secure & Private</h3>
                  <p className="text-muted">
                    Enterprise-grade security with role-based access control and data encryption.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link href="/features" className="btn btn-primary btn-lg px-5">
              View All Features →
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">
              How It Works
            </h2>
            <p className="lead text-muted">
              Get started in three simple steps
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="text-center">
                <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                  <span className="fs-3 fw-bold">1</span>
                </div>
                <h3 className="h5 fw-bold mb-3">Choose Your Role</h3>
                <p className="text-muted">
                  Select your portal - Student, Teacher, or School Admin - and access role-specific features.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="text-center">
                <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                  <span className="fs-3 fw-bold">2</span>
                </div>
                <h3 className="h5 fw-bold mb-3">Login & Setup</h3>
                <p className="text-muted">
                  Login with your credentials and set up your profile with necessary information.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="text-center">
                <div className="bg-warning text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                  <span className="fs-3 fw-bold">3</span>
                </div>
                <h3 className="h5 fw-bold mb-3">Start Managing</h3>
                <p className="text-muted">
                  Begin managing your tasks, assignments, students, and track all activities effortlessly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <h2 className="display-5 fw-bold mb-4">
                Why Choose ChildClub?
              </h2>
              <div className="mb-4">
                <div className="d-flex align-items-start mb-3">
                  <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center me-3" style={{width: '40px', height: '40px', flexShrink: 0}}>
                    <span>✓</span>
                  </div>
                  <div>
                    <h5 className="fw-bold mb-1">Easy to Use</h5>
                    <p className="text-muted mb-0">Intuitive interface designed for all age groups and technical abilities.</p>
                  </div>
                </div>

                <div className="d-flex align-items-start mb-3">
                  <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center me-3" style={{width: '40px', height: '40px', flexShrink: 0}}>
                    <span>✓</span>
                  </div>
                  <div>
                    <h5 className="fw-bold mb-1">Comprehensive Features</h5>
                    <p className="text-muted mb-0">Everything you need to manage a modern educational institution.</p>
                  </div>
                </div>

                <div className="d-flex align-items-start mb-3">
                  <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center me-3" style={{width: '40px', height: '40px', flexShrink: 0}}>
                    <span>✓</span>
                  </div>
                  <div>
                    <h5 className="fw-bold mb-1">24/7 Support</h5>
                    <p className="text-muted mb-0">Round-the-clock customer support to assist you whenever needed.</p>
                  </div>
                </div>

                <div className="d-flex align-items-start">
                  <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center me-3" style={{width: '40px', height: '40px', flexShrink: 0}}>
                    <span>✓</span>
                  </div>
                  <div>
                    <h5 className="fw-bold mb-1">Cost Effective</h5>
                    <p className="text-muted mb-0">Affordable pricing plans for schools of all sizes.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="bg-gradient-primary rounded-4 p-5 text-white text-center" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                <h3 className="h2 fw-bold mb-4">Ready to Get Started?</h3>
                <p className="lead mb-4">Join thousands of schools already using ChildClub</p>
                <div className="d-grid gap-3">
                  <Link href="/student/login" className="btn btn-light btn-lg">
                    Student Login
                  </Link>
                  <Link href="/teacher/login" className="btn btn-outline-light btn-lg">
                    Teacher Login
                  </Link>
                  <Link href="/admin/login" className="btn btn-outline-light btn-lg">
                    Admin Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">
              What People Say
            </h2>
            <p className="lead text-muted">
              Hear from our satisfied users
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <div className="mb-3">
                    <span className="text-warning">★★★★★</span>
                  </div>
                  <p className="text-muted mb-3">
                    "ChildClub has transformed how we manage our school. The interface is intuitive and our teachers love the assignment features."
                  </p>
                  <div className="d-flex align-items-center">
                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '50px', height: '50px'}}>
                      <span>PS</span>
                    </div>
                    <div>
                      <h6 className="fw-bold mb-0">Priya Sharma</h6>
                      <small className="text-muted">Principal, Delhi Public School</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <div className="mb-3">
                    <span className="text-warning">★★★★★</span>
                  </div>
                  <p className="text-muted mb-3">
                    "As a teacher, I can now easily track all my students' progress and create assignments in minutes. Highly recommended!"
                  </p>
                  <div className="d-flex align-items-center">
                    <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '50px', height: '50px'}}>
                      <span>RK</span>
                    </div>
                    <div>
                      <h6 className="fw-bold mb-0">Rajesh Kumar</h6>
                      <small className="text-muted">Teacher, St. Xavier's School</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <div className="mb-3">
                    <span className="text-warning">★★★★★</span>
                  </div>
                  <p className="text-muted mb-3">
                    "The student portal makes it so easy to check my assignments and grades. I love the clean interface!"
                  </p>
                  <div className="d-flex align-items-center">
                    <div className="bg-warning text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '50px', height: '50px'}}>
                      <span>AM</span>
                    </div>
                    <div>
                      <h6 className="fw-bold mb-0">Ananya Mehta</h6>
                      <small className="text-muted">Student, Class 10</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5 bg-primary text-white">
        <div className="container text-center">
          <h2 className="display-5 fw-bold mb-3">
            Ready to Transform Your School?
          </h2>
          <p className="lead mb-4">
            Join hundreds of schools using ChildClub for better education management
          </p>
          <Link href="/contact" className="btn btn-light btn-lg px-5">
            Contact Us Today →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-4 col-md-6">
              <h3 className="h4 fw-bold mb-3">🎓 ChildClub</h3>
              <p className="text-light-emphasis mb-3">
                Empowering education through technology. ChildClub is a comprehensive school management platform designed to streamline administrative tasks, enhance communication, and improve learning outcomes.
              </p>
              <div className="d-flex gap-2">
                <a href="#" className="btn btn-outline-light btn-sm">
                  <span>Facebook</span>
                </a>
                <a href="#" className="btn btn-outline-light btn-sm">
                  <span>Twitter</span>
                </a>
                <a href="#" className="btn btn-outline-light btn-sm">
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>

            <div className="col-lg-2 col-md-6">
              <h4 className="h6 fw-bold mb-3">Platform</h4>
              <ul className="list-unstyled">
                <li className="mb-2"><Link href="/features" className="text-light-emphasis text-decoration-none">Features</Link></li>
                <li className="mb-2"><Link href="/about" className="text-light-emphasis text-decoration-none">About Us</Link></li>
                <li className="mb-2"><Link href="/pricing" className="text-light-emphasis text-decoration-none">Pricing</Link></li>
                <li className="mb-2"><Link href="/security" className="text-light-emphasis text-decoration-none">Security</Link></li>
              </ul>
            </div>

            <div className="col-lg-2 col-md-6">
              <h4 className="h6 fw-bold mb-3">Portals</h4>
              <ul className="list-unstyled">
                <li className="mb-2"><Link href="/student/login" className="text-light-emphasis text-decoration-none">Student Login</Link></li>
                <li className="mb-2"><Link href="/teacher/login" className="text-light-emphasis text-decoration-none">Teacher Login</Link></li>
                <li className="mb-2"><Link href="/admin/login" className="text-light-emphasis text-decoration-none">Admin Login</Link></li>
              </ul>
            </div>

            <div className="col-lg-2 col-md-6">
              <h4 className="h6 fw-bold mb-3">Support</h4>
              <ul className="list-unstyled">
                <li className="mb-2"><Link href="/help" className="text-light-emphasis text-decoration-none">Help Center</Link></li>
                <li className="mb-2"><Link href="/contact" className="text-light-emphasis text-decoration-none">Contact Us</Link></li>
                <li className="mb-2"><Link href="/faq" className="text-light-emphasis text-decoration-none">FAQ</Link></li>
                <li className="mb-2"><Link href="/status" className="text-light-emphasis text-decoration-none">System Status</Link></li>
              </ul>
            </div>

            <div className="col-lg-2 col-md-6">
              <h4 className="h6 fw-bold mb-3">Legal</h4>
              <ul className="list-unstyled">
                <li className="mb-2"><Link href="/privacy" className="text-light-emphasis text-decoration-none">Privacy Policy</Link></li>
                <li className="mb-2"><Link href="/terms" className="text-light-emphasis text-decoration-none">Terms of Service</Link></li>
                <li className="mb-2"><Link href="/cookies" className="text-light-emphasis text-decoration-none">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>

          <hr className="border-secondary my-4" />

          <div className="row align-items-center">
            <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
              <p className="mb-0 text-light-emphasis">
                &copy; 2024 ChildClub Management System. All rights reserved.
              </p>
            </div>
            <div className="col-md-6 text-center text-md-end">
              <p className="mb-0 text-light-emphasis">
                Made with ❤️ for Better Education
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
