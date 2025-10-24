'use client'

import Link from 'next/link'

export default function FeaturesPage() {
  const features = [
    {
      category: "Student Management",
      icon: "📚",
      color: "primary",
      items: [
        "Complete student profiles with photos and personal information",
        "Track academic progress and performance analytics",
        "Assignment submission and grade tracking",
        "Attendance monitoring and history",
        "Personal dashboard with upcoming tasks",
        "Grade reports and progress cards"
      ]
    },
    {
      category: "Teacher Tools",
      icon: "👨‍🏫",
      color: "success",
      items: [
        "Create and manage assignments with deadlines",
        "Grade submissions with feedback options",
        "Class management and student grouping",
        "Attendance marking with bulk actions",
        "Performance analytics and reports",
        "Communication tools for parent-teacher interaction"
      ]
    },
    {
      category: "Administrative Control",
      icon: "🏫",
      color: "warning",
      items: [
        "Complete school overview dashboard",
        "Manage teachers, students, and staff",
        "Generate comprehensive reports",
        "Subject and curriculum management",
        "Class and section organization",
        "Fee management and tracking"
      ]
    },
    {
      category: "Calendar & Scheduling",
      icon: "📅",
      color: "info",
      items: [
        "Integrated calendar system",
        "Event creation and management",
        "Assignment deadline tracking",
        "Exam schedule management",
        "Holiday and leave management",
        "Automated reminders and notifications"
      ]
    },
    {
      category: "Reports & Analytics",
      icon: "📊",
      color: "danger",
      items: [
        "Real-time attendance reports",
        "Academic performance analytics",
        "Student progress tracking",
        "Teacher performance metrics",
        "Exportable data in multiple formats",
        "Custom report generation"
      ]
    },
    {
      category: "Security & Privacy",
      icon: "🔒",
      color: "dark",
      items: [
        "Role-based access control",
        "Secure authentication system",
        "Data encryption and backup",
        "Privacy compliance (GDPR ready)",
        "Audit logs and activity tracking",
        "Multi-factor authentication support"
      ]
    }
  ]

  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <header className="bg-white shadow-sm border-bottom sticky-top">
        <nav className="navbar navbar-expand-lg navbar-light">
          <div className="container">
            <Link href="/" className="navbar-brand">
              <h1 className="h3 fw-bold text-dark mb-0">
                🎓 ChildClub
              </h1>
            </Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <div className="navbar-nav ms-auto">
                <Link href="/" className="nav-link">Home</Link>
                <Link href="/features" className="nav-link active">Features</Link>
                <Link href="/about" className="nav-link">About</Link>
                <Link href="/contact" className="nav-link">Contact</Link>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="bg-primary text-white py-5">
        <div className="container text-center">
          <h1 className="display-4 fw-bold mb-3">
            Comprehensive Features
          </h1>
          <p className="lead mb-0">
            Everything you need to manage your educational institution effectively
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-5">
        <div className="container">
          <div className="row g-4">
            {features.map((feature, index) => (
              <div key={index} className="col-lg-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center mb-4">
                      <div className={`bg-${feature.color} bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3`} style={{width: '60px', height: '60px'}}>
                        <span className={`text-${feature.color} fs-2`}>{feature.icon}</span>
                      </div>
                      <h3 className="h4 fw-bold mb-0">{feature.category}</h3>
                    </div>
                    
                    <ul className="list-unstyled mb-0">
                      {feature.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="mb-2 d-flex align-items-start">
                          <span className="text-success me-2">✓</span>
                          <span className="text-muted">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">
              More Amazing Features
            </h2>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="text-center">
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '70px', height: '70px'}}>
                  <span className="fs-1">📱</span>
                </div>
                <h4 className="fw-bold mb-2">Mobile Responsive</h4>
                <p className="text-muted">Access from any device - desktop, tablet, or mobile</p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="text-center">
                <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '70px', height: '70px'}}>
                  <span className="fs-1">🔔</span>
                </div>
                <h4 className="fw-bold mb-2">Real-time Notifications</h4>
                <p className="text-muted">Stay updated with instant notifications for all activities</p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="text-center">
                <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '70px', height: '70px'}}>
                  <span className="fs-1">📤</span>
                </div>
                <h4 className="fw-bold mb-2">File Management</h4>
                <p className="text-muted">Upload and manage documents, assignments, and resources</p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="text-center">
                <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '70px', height: '70px'}}>
                  <span className="fs-1">🌐</span>
                </div>
                <h4 className="fw-bold mb-2">Multi-language Support</h4>
                <p className="text-muted">Available in multiple languages for global accessibility</p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="text-center">
                <div className="bg-danger bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '70px', height: '70px'}}>
                  <span className="fs-1">⚡</span>
                </div>
                <h4 className="fw-bold mb-2">Lightning Fast</h4>
                <p className="text-muted">Optimized performance for quick loading and smooth experience</p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="text-center">
                <div className="bg-secondary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '70px', height: '70px'}}>
                  <span className="fs-1">💬</span>
                </div>
                <h4 className="fw-bold mb-2">Communication Tools</h4>
                <p className="text-muted">Built-in messaging and announcement system</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5 bg-primary text-white">
        <div className="container text-center">
          <h2 className="display-6 fw-bold mb-3">
            Ready to Experience These Features?
          </h2>
          <p className="lead mb-4">
            Get started with ChildClub today
          </p>
          <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
            <Link href="/contact" className="btn btn-light btn-lg px-5">
              Contact Sales
            </Link>
            <Link href="/" className="btn btn-outline-light btn-lg px-5">
              View Portals
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-4 col-md-6">
              <h3 className="h4 fw-bold mb-3">🎓 ChildClub</h3>
              <p className="text-light-emphasis mb-3">
                Empowering education through technology. ChildClub is a comprehensive school management platform designed to streamline administrative tasks.
              </p>
            </div>

            <div className="col-lg-2 col-md-6">
              <h4 className="h6 fw-bold mb-3">Platform</h4>
              <ul className="list-unstyled">
                <li className="mb-2"><Link href="/features" className="text-light-emphasis text-decoration-none">Features</Link></li>
                <li className="mb-2"><Link href="/about" className="text-light-emphasis text-decoration-none">About Us</Link></li>
                <li className="mb-2"><Link href="/contact" className="text-light-emphasis text-decoration-none">Contact</Link></li>
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
              </ul>
            </div>

            <div className="col-lg-2 col-md-6">
              <h4 className="h6 fw-bold mb-3">Legal</h4>
              <ul className="list-unstyled">
                <li className="mb-2"><Link href="/privacy" className="text-light-emphasis text-decoration-none">Privacy Policy</Link></li>
                <li className="mb-2"><Link href="/terms" className="text-light-emphasis text-decoration-none">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <hr className="border-secondary my-4" />

          <div className="text-center">
            <p className="mb-0 text-light-emphasis">
              &copy; 2024 ChildClub Management System. All rights reserved. Made with ❤️ for Better Education
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

