'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TermsAndConditions() {
  const searchParams = useSearchParams()
  const from = searchParams.get('from') || 'admin'
  
  const getBackUrl = () => {
    switch(from) {
      case 'student':
        return '/student/register'
      case 'teacher':
        return '/teacher/register'
      case 'admin':
      default:
        return '/admin/register'
    }
  }

  return (
    <div className="min-vh-100 bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            {/* Back Button */}
            <Link 
              href={getBackUrl()}
              className="btn btn-outline-secondary mb-4 d-inline-flex align-items-center gap-2"
            >
              <ArrowLeft size={20} />
              Back to Registration
            </Link>

            {/* Content Card */}
            <div className="card shadow-sm border-0">
              <div className="card-body p-4 p-md-5">
                <h1 className="display-5 fw-bold text-warning mb-2">Terms and Conditions</h1>
                <p className="text-muted mb-4">Last Updated: October 11, 2025</p>

                <div className="terms-content">
                  {/* Introduction */}
                  <section className="mb-4">
                    <h2 className="h4 fw-semibold mb-3">1. Introduction</h2>
                    <p className="text-secondary">
                      Welcome to ChildClub School Management System. These Terms and Conditions govern your use of our platform and services. 
                      By registering and using ChildClub, you agree to comply with and be bound by these terms.
                    </p>
                  </section>

                  {/* Acceptance */}
                  <section className="mb-4">
                    <h2 className="h4 fw-semibold mb-3">2. Acceptance of Terms</h2>
                    <p className="text-secondary">
                      By accessing or using ChildClub, you acknowledge that you have read, understood, and agree to be bound by these 
                      Terms and Conditions. If you do not agree with any part of these terms, you must not use our services.
                    </p>
                  </section>

                  {/* User Accounts */}
                  <section className="mb-4">
                    <h2 className="h4 fw-semibold mb-3">3. User Accounts and Registration</h2>
                    <div className="text-secondary">
                      <p className="mb-2">When creating an account, you agree to:</p>
                      <ul className="mb-3">
                        <li>Provide accurate, current, and complete information</li>
                        <li>Maintain and promptly update your account information</li>
                        <li>Maintain the security of your password and account</li>
                        <li>Accept responsibility for all activities that occur under your account</li>
                        <li>Notify us immediately of any unauthorized use of your account</li>
                      </ul>
                      <p>You are responsible for safeguarding your login credentials and must not share them with third parties.</p>
                    </div>
                  </section>

                  {/* User Roles */}
                  <section className="mb-4">
                    <h2 className="h4 fw-semibold mb-3">4. User Roles and Responsibilities</h2>
                    <div className="text-secondary">
                      <p className="mb-2"><strong>School Administrators:</strong></p>
                      <ul className="mb-3">
                        <li>Are responsible for managing their school's data and users</li>
                        <li>Must ensure compliance with local educational regulations</li>
                        <li>Are accountable for the accuracy of information entered into the system</li>
                      </ul>
                      
                      <p className="mb-2"><strong>Teachers:</strong></p>
                      <ul className="mb-3">
                        <li>Must maintain professional conduct when using the platform</li>
                        <li>Are responsible for timely updates of student records and assignments</li>
                        <li>Must protect student privacy and confidential information</li>
                      </ul>

                      <p className="mb-2"><strong>Students and Parents:</strong></p>
                      <ul>
                        <li>Must use the platform for educational purposes only</li>
                        <li>Must respect the intellectual property of others</li>
                        <li>Should report any issues or concerns to appropriate authorities</li>
                      </ul>
                    </div>
                  </section>

                  {/* Data and Privacy */}
                  <section className="mb-4">
                    <h2 className="h4 fw-semibold mb-3">5. Data and Privacy</h2>
                    <p className="text-secondary">
                      Your use of ChildClub is also governed by our <Link href="/privacy" className="text-warning text-decoration-none fw-semibold">Privacy Policy</Link>. 
                      We are committed to protecting your personal information and complying with applicable data protection laws.
                    </p>
                  </section>

                  {/* Acceptable Use */}
                  <section className="mb-4">
                    <h2 className="h4 fw-semibold mb-3">6. Acceptable Use Policy</h2>
                    <div className="text-secondary">
                      <p className="mb-2">You agree NOT to:</p>
                      <ul>
                        <li>Use the platform for any unlawful purpose</li>
                        <li>Upload or transmit viruses or malicious code</li>
                        <li>Attempt to gain unauthorized access to our systems</li>
                        <li>Interfere with or disrupt the platform's operation</li>
                        <li>Harass, abuse, or harm other users</li>
                        <li>Impersonate any person or entity</li>
                        <li>Collect or harvest information about other users</li>
                        <li>Use automated systems to access the platform without permission</li>
                      </ul>
                    </div>
                  </section>

                  {/* Intellectual Property */}
                  <section className="mb-4">
                    <h2 className="h4 fw-semibold mb-3">7. Intellectual Property Rights</h2>
                    <p className="text-secondary">
                      All content, features, and functionality of KidsClub, including but not limited to text, graphics, logos, 
                      and software, are owned by KidsClub and are protected by copyright, trademark, and other intellectual property laws. 
                      You may not reproduce, distribute, or create derivative works without our express written permission.
                    </p>
                  </section>

                  {/* Service Availability */}
                  <section className="mb-4">
                    <h2 className="h4 fw-semibold mb-3">8. Service Availability</h2>
                    <p className="text-secondary">
                      We strive to provide uninterrupted service but cannot guarantee that the platform will be available at all times. 
                      We reserve the right to modify, suspend, or discontinue any part of the service at any time with or without notice.
                    </p>
                  </section>

                  {/* Limitation of Liability */}
                  <section className="mb-4">
                    <h2 className="h4 fw-semibold mb-3">9. Limitation of Liability</h2>
                    <p className="text-secondary">
                      To the fullest extent permitted by law, KidsClub shall not be liable for any indirect, incidental, special, 
                      consequential, or punitive damages, including loss of profits, data, or other intangible losses resulting from 
                      your use or inability to use the service.
                    </p>
                  </section>

                  {/* Termination */}
                  <section className="mb-4">
                    <h2 className="h4 fw-semibold mb-3">10. Termination</h2>
                    <p className="text-secondary">
                      We reserve the right to terminate or suspend your account and access to the service immediately, without prior 
                      notice or liability, for any reason, including if you breach these Terms and Conditions.
                    </p>
                  </section>

                  {/* Changes to Terms */}
                  <section className="mb-4">
                    <h2 className="h4 fw-semibold mb-3">11. Changes to Terms</h2>
                    <p className="text-secondary">
                      We reserve the right to modify these Terms and Conditions at any time. We will notify users of any material 
                      changes by posting the new terms on this page. Your continued use of the service after such modifications 
                      constitutes your acceptance of the updated terms.
                    </p>
                  </section>

                  {/* Governing Law */}
                  <section className="mb-4">
                    <h2 className="h4 fw-semibold mb-3">12. Governing Law</h2>
                    <p className="text-secondary">
                      These Terms and Conditions shall be governed by and construed in accordance with the laws of India, 
                      without regard to its conflict of law provisions.
                    </p>
                  </section>

                  {/* Contact */}
                  <section className="mb-4">
                    <h2 className="h4 fw-semibold mb-3">13. Contact Information</h2>
                    <p className="text-secondary">
                      If you have any questions about these Terms and Conditions, please contact us at:
                    </p>
                    <div className="bg-light p-3 rounded mt-2">
                      <p className="mb-1"><strong>Email:</strong> support@kidsclub.com</p>
                      <p className="mb-1"><strong>Phone:</strong> +91-XXXX-XXXXXX</p>
                      <p className="mb-0"><strong>Address:</strong> KidsClub Headquarters, India</p>
                    </div>
                  </section>

                  {/* Agreement */}
                  <section className="mb-4">
                    <div className="alert alert-warning border-warning">
                      <h5 className="fw-semibold mb-2">Agreement</h5>
                      <p className="mb-0 small">
                        By clicking "I Agree" or by registering for an account, you acknowledge that you have read, 
                        understood, and agree to be bound by these Terms and Conditions.
                      </p>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

