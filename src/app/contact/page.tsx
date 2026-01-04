'use client'

import { useState } from 'react'
import Link from 'next/link'
import { API_BASE_URL } from '@/lib/api'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    
    try {
      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        })
        
        // Reset success message after 5 seconds
        setTimeout(() => {
          setSubmitStatus('idle')
        }, 5000)
      } else {
        setSubmitStatus('error')
        setTimeout(() => {
          setSubmitStatus('idle')
        }, 5000)
      }
    } catch (error) {
      console.error('Error submitting contact form:', error)
      setSubmitStatus('error')
      setTimeout(() => {
        setSubmitStatus('idle')
      }, 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

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
                <Link href="/about" className="nav-link">About</Link>
                <Link href="/contact" className="nav-link active">Contact</Link>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="bg-primary text-white py-5">
        <div className="container text-center">
          <h1 className="display-4 fw-bold mb-3">
            Get in Touch
          </h1>
          <p className="lead mb-0">
            We'd love to hear from you. Let us know how we can help.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-5">
        <div className="container">
          <div className="row g-4">
            {/* Contact Information */}
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <h3 className="h4 fw-bold mb-4">Contact Information</h3>
                  
                  <div className="mb-4">
                    <div className="d-flex align-items-start mb-3">
                      <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '50px', height: '50px', flexShrink: 0}}>
                        <span className="text-primary fs-5">📍</span>
                      </div>
                      <div>
                        <h5 className="fw-bold mb-1">Address</h5>
                        <p className="text-muted mb-0">
                          123 Education Street<br />
                          New Delhi, India 110001
                        </p>
                      </div>
                    </div>

                    <div className="d-flex align-items-start mb-3">
                      <div className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '50px', height: '50px', flexShrink: 0}}>
                        <span className="text-success fs-5">📧</span>
                      </div>
                      <div>
                        <h5 className="fw-bold mb-1">Email</h5>
                        <p className="text-muted mb-0">
                          support@childclub.com<br />
                          sales@childclub.com
                        </p>
                      </div>
                    </div>

                    <div className="d-flex align-items-start mb-3">
                      <div className="bg-warning bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '50px', height: '50px', flexShrink: 0}}>
                        <span className="text-warning fs-5">📞</span>
                      </div>
                      <div>
                        <h5 className="fw-bold mb-1">Phone</h5>
                        <p className="text-muted mb-0">
                          +91 11 1234 5678<br />
                          +91 11 8765 4321
                        </p>
                      </div>
                    </div>

                    <div className="d-flex align-items-start">
                      <div className="bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '50px', height: '50px', flexShrink: 0}}>
                        <span className="text-info fs-5">⏰</span>
                      </div>
                      <div>
                        <h5 className="fw-bold mb-1">Working Hours</h5>
                        <p className="text-muted mb-0">
                          Monday - Friday: 9:00 AM - 6:00 PM<br />
                          Saturday: 10:00 AM - 4:00 PM
                        </p>
                      </div>
                    </div>
                  </div>

                  <hr className="my-4" />

                  <div>
                    <h5 className="fw-bold mb-3">Follow Us</h5>
                    <div className="d-flex gap-2">
                      <a href="#" className="btn btn-outline-primary btn-sm">Facebook</a>
                      <a href="#" className="btn btn-outline-info btn-sm">Twitter</a>
                      <a href="#" className="btn btn-outline-danger btn-sm">YouTube</a>
                      <a href="#" className="btn btn-outline-primary btn-sm">LinkedIn</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <h3 className="h4 fw-bold mb-4">Send Us a Message</h3>
                  
                  {submitStatus === 'success' && (
                    <div className="alert alert-success alert-dismissible fade show" role="alert">
                      <strong>Success!</strong> Your message has been sent successfully. We'll get back to you soon.
                      <button type="button" className="btn-close" onClick={() => setSubmitStatus('idle')}></button>
                    </div>
                  )}

                  {submitStatus === 'error' && (
                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                      <strong>Error!</strong> Something went wrong. Please try again later.
                      <button type="button" className="btn-close" onClick={() => setSubmitStatus('idle')}></button>
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label htmlFor="name" className="form-label fw-semibold">
                          Full Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-lg"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Enter your name"
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label htmlFor="email" className="form-label fw-semibold">
                          Email Address <span className="text-danger">*</span>
                        </label>
                        <input
                          type="email"
                          className="form-control form-control-lg"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Enter your email"
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label htmlFor="phone" className="form-label fw-semibold">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          className="form-control form-control-lg"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="Enter your phone number"
                        />
                      </div>

                      <div className="col-md-6">
                        <label htmlFor="subject" className="form-label fw-semibold">
                          Subject <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-select form-select-lg"
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select a subject</option>
                          <option value="general">General Inquiry</option>
                          <option value="sales">Sales & Pricing</option>
                          <option value="support">Technical Support</option>
                          <option value="demo">Request a Demo</option>
                          <option value="partnership">Partnership</option>
                          <option value="feedback">Feedback</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div className="col-12">
                        <label htmlFor="message" className="form-label fw-semibold">
                          Message <span className="text-danger">*</span>
                        </label>
                        <textarea
                          className="form-control form-control-lg"
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          rows={6}
                          placeholder="Tell us more about your inquiry..."
                          required
                        ></textarea>
                      </div>

                      <div className="col-12">
                        <button
                          type="submit"
                          className="btn btn-primary btn-lg px-5"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Sending...
                            </>
                          ) : (
                            <>Send Message →</>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-6 fw-bold mb-3">
              Quick Access
            </h2>
            <p className="lead text-muted">
              Access different portals directly
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm text-center h-100">
                <div className="card-body p-4">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '70px', height: '70px'}}>
                    <span className="text-primary fs-1">📚</span>
                  </div>
                  <h4 className="fw-bold mb-2">Student Portal</h4>
                  <p className="text-muted mb-3">Access your assignments and grades</p>
                  <Link href="/student/login" className="btn btn-primary">
                    Student Login →
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm text-center h-100">
                <div className="card-body p-4">
                  <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '70px', height: '70px'}}>
                    <span className="text-success fs-1">👨‍🏫</span>
                  </div>
                  <h4 className="fw-bold mb-2">Teacher Portal</h4>
                  <p className="text-muted mb-3">Manage your classes and students</p>
                  <Link href="/teacher/login" className="btn btn-success">
                    Teacher Login →
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm text-center h-100">
                <div className="card-body p-4">
                  <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '70px', height: '70px'}}>
                    <span className="text-warning fs-1">🏫</span>
                  </div>
                  <h4 className="fw-bold mb-2">Admin Portal</h4>
                  <p className="text-muted mb-3">Oversee your entire school</p>
                  <Link href="/admin/login" className="btn btn-warning">
                    Admin Login →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-6 fw-bold mb-3">
              Frequently Asked Questions
            </h2>
            <p className="lead text-muted">
              Quick answers to common questions
            </p>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="accordion" id="faqAccordion">
                <div className="accordion-item border-0 shadow-sm mb-3">
                  <h2 className="accordion-header">
                    <button className="accordion-button fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#faq1">
                      How do I get started with ChildClub?
                    </button>
                  </h2>
                  <div id="faq1" className="accordion-collapse collapse show" data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                      Contact our sales team through the form above or email us at sales@childclub.com. We'll schedule a demo and help you get set up.
                    </div>
                  </div>
                </div>

                <div className="accordion-item border-0 shadow-sm mb-3">
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#faq2">
                      What is the pricing structure?
                    </button>
                  </h2>
                  <div id="faq2" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                      We offer flexible pricing plans based on the size of your institution. Contact us for a customized quote that fits your needs.
                    </div>
                  </div>
                </div>

                <div className="accordion-item border-0 shadow-sm mb-3">
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#faq3">
                      Is my data secure?
                    </button>
                  </h2>
                  <div id="faq3" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                      Yes! We use enterprise-grade security measures including data encryption, regular backups, and strict access controls to protect your information.
                    </div>
                  </div>
                </div>

                <div className="accordion-item border-0 shadow-sm mb-3">
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#faq4">
                      Do you provide training?
                    </button>
                  </h2>
                  <div id="faq4" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                      Yes, we provide comprehensive training for administrators, teachers, and staff to ensure smooth adoption of the platform.
                    </div>
                  </div>
                </div>

                <div className="accordion-item border-0 shadow-sm">
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#faq5">
                      What kind of support do you offer?
                    </button>
                  </h2>
                  <div id="faq5" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                      We offer 24/7 email support and phone support during business hours. Premium plans include dedicated account managers and priority support.
                    </div>
                  </div>
                </div>
              </div>
            </div>
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

