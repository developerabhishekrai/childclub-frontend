'use client'

import Link from 'next/link'

export default function AboutPage() {
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
                <Link href="/features" className="nav-link">Features</Link>
                <Link href="/about" className="nav-link active">About</Link>
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
            About ChildClub
          </h1>
          <p className="lead mb-0">
            Transforming education management with innovative technology
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <h2 className="display-5 fw-bold mb-4">
                Our Mission
              </h2>
              <p className="lead text-muted mb-4">
                To empower educational institutions with cutting-edge technology that simplifies management, enhances communication, and improves learning outcomes for students worldwide.
              </p>
              <p className="text-muted mb-4">
                ChildClub was founded with a vision to bridge the gap between traditional education management and modern technology. We believe that by providing intuitive, comprehensive tools, we can help schools focus on what truly matters - quality education.
              </p>
              <p className="text-muted">
                Our platform serves thousands of schools, teachers, and students across the globe, making education management easier, more efficient, and more effective.
              </p>
            </div>

            <div className="col-lg-6">
              <div className="bg-gradient-primary rounded-4 p-5 text-white" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                <div className="text-center mb-4">
                  <div className="bg-white text-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '100px', height: '100px'}}>
                    <span className="fs-1">🎓</span>
                  </div>
                </div>
                <h3 className="h3 fw-bold text-center mb-4">Our Vision</h3>
                <p className="text-center mb-0">
                  To be the world's leading education management platform, enabling every school to achieve excellence through technology-driven solutions that foster better learning experiences.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">
              Our Core Values
            </h2>
            <p className="lead text-muted">
              The principles that guide everything we do
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center p-4">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '70px', height: '70px'}}>
                    <span className="text-primary fs-1">💡</span>
                  </div>
                  <h4 className="fw-bold mb-3">Innovation</h4>
                  <p className="text-muted mb-0">
                    We constantly innovate to provide cutting-edge solutions that meet the evolving needs of modern education.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center p-4">
                  <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '70px', height: '70px'}}>
                    <span className="text-success fs-1">🤝</span>
                  </div>
                  <h4 className="fw-bold mb-3">Collaboration</h4>
                  <p className="text-muted mb-0">
                    We believe in the power of collaboration between students, teachers, and administrators.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center p-4">
                  <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '70px', height: '70px'}}>
                    <span className="text-warning fs-1">⭐</span>
                  </div>
                  <h4 className="fw-bold mb-3">Excellence</h4>
                  <p className="text-muted mb-0">
                    We strive for excellence in everything we do, from product design to customer support.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center p-4">
                  <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '70px', height: '70px'}}>
                    <span className="text-info fs-1">🔒</span>
                  </div>
                  <h4 className="fw-bold mb-3">Security</h4>
                  <p className="text-muted mb-0">
                    We prioritize data security and privacy, ensuring all information is protected with industry-leading standards.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center p-4">
                  <div className="bg-danger bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '70px', height: '70px'}}>
                    <span className="text-danger fs-1">❤️</span>
                  </div>
                  <h4 className="fw-bold mb-3">User-Centric</h4>
                  <p className="text-muted mb-0">
                    We design with users in mind, creating intuitive interfaces that everyone can use easily.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center p-4">
                  <div className="bg-secondary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '70px', height: '70px'}}>
                    <span className="text-secondary fs-1">🌍</span>
                  </div>
                  <h4 className="fw-bold mb-3">Accessibility</h4>
                  <p className="text-muted mb-0">
                    We believe education technology should be accessible to all, regardless of location or resources.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-5 bg-primary text-white">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">
              Our Impact
            </h2>
            <p className="lead mb-0">
              Numbers that speak for themselves
            </p>
          </div>

          <div className="row g-4 text-center">
            <div className="col-md-3">
              <div className="mb-2">
                <span className="display-3 fw-bold">500+</span>
              </div>
              <p className="mb-0 fs-5">Schools Worldwide</p>
            </div>
            <div className="col-md-3">
              <div className="mb-2">
                <span className="display-3 fw-bold">50K+</span>
              </div>
              <p className="mb-0 fs-5">Active Students</p>
            </div>
            <div className="col-md-3">
              <div className="mb-2">
                <span className="display-3 fw-bold">5K+</span>
              </div>
              <p className="mb-0 fs-5">Dedicated Teachers</p>
            </div>
            <div className="col-md-3">
              <div className="mb-2">
                <span className="display-3 fw-bold">99%</span>
              </div>
              <p className="mb-0 fs-5">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="text-center mb-5">
                <h2 className="display-5 fw-bold mb-3">
                  Our Story
                </h2>
              </div>
              
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <h4 className="fw-bold mb-3">The Beginning</h4>
                  <p className="text-muted mb-0">
                    ChildClub was born from a simple observation: schools were struggling with outdated management systems that were complex, expensive, and difficult to use. Our founders, experienced educators and technologists, came together to create a solution that would truly serve the needs of modern educational institutions.
                  </p>
                </div>
              </div>

              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <h4 className="fw-bold mb-3">Growth & Evolution</h4>
                  <p className="text-muted mb-0">
                    What started as a small project has grown into a comprehensive platform serving hundreds of schools worldwide. We've continuously evolved our platform based on feedback from educators, administrators, and students, ensuring that ChildClub remains at the forefront of education technology.
                  </p>
                </div>
              </div>

              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <h4 className="fw-bold mb-3">The Future</h4>
                  <p className="text-muted mb-0">
                    We're committed to continuing our mission of improving education management. With upcoming features like AI-powered analytics, enhanced mobile experiences, and expanded integration capabilities, we're excited about the future of ChildClub and the positive impact we can make on education worldwide.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">
              Meet Our Team
            </h2>
            <p className="lead text-muted">
              The people behind ChildClub
            </p>
          </div>

          <div className="row g-4 justify-content-center">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm text-center">
                <div className="card-body p-4">
                  <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '100px', height: '100px'}}>
                    <span className="fs-1">👨‍💼</span>
                  </div>
                  <h4 className="fw-bold mb-1">Raj Malhotra</h4>
                  <p className="text-muted mb-3">Founder & CEO</p>
                  <p className="text-muted small">
                    Former educator with 15+ years of experience in education technology and school management.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm text-center">
                <div className="card-body p-4">
                  <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '100px', height: '100px'}}>
                    <span className="fs-1">👩‍💻</span>
                  </div>
                  <h4 className="fw-bold mb-1">Priya Singh</h4>
                  <p className="text-muted mb-3">Chief Technology Officer</p>
                  <p className="text-muted small">
                    Tech innovator with expertise in building scalable education platforms and cloud solutions.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm text-center">
                <div className="card-body p-4">
                  <div className="bg-warning text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '100px', height: '100px'}}>
                    <span className="fs-1">👨‍🏫</span>
                  </div>
                  <h4 className="fw-bold mb-1">Amit Kumar</h4>
                  <p className="text-muted mb-3">Head of Product</p>
                  <p className="text-muted small">
                    Product strategist passionate about creating user-friendly education solutions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5 bg-primary text-white">
        <div className="container text-center">
          <h2 className="display-6 fw-bold mb-3">
            Join Us in Transforming Education
          </h2>
          <p className="lead mb-4">
            Be part of the ChildClub community
          </p>
          <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
            <Link href="/contact" className="btn btn-light btn-lg px-5">
              Get in Touch
            </Link>
            <Link href="/" className="btn btn-outline-light btn-lg px-5">
              Explore Portals
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

