'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Shield } from 'lucide-react'

export default function PrivacyPolicy() {
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
                <div className="d-flex align-items-center gap-3 mb-2">
                  <Shield className="text-warning" size={40} />
                  <h1 className="display-5 fw-bold text-warning mb-0">Privacy Policy</h1>
                </div>
                <p className="text-muted mb-4">Last Updated: October 11, 2025</p>

                <div className="privacy-content">
                  {/* Introduction */}
                  <section className="mb-4">
                    <h2 className="h4 fw-semibold mb-3">1. Introduction</h2>
                    <p className="text-secondary">
                      At KidsClub, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, 
                      and safeguard your information when you use our School Management System. Please read this privacy policy 
                      carefully. If you do not agree with the terms of this privacy policy, please do not access the platform.
                    </p>
                  </section>

                  {/* Information We Collect */}
                  <section className="mb-4">
                    <h2 className="h4 fw-semibold mb-3">2. Information We Collect</h2>
                    
                    <div className="text-secondary">
                      <h5 className="fw-semibold mt-3 mb-2">2.1 Personal Information</h5>
                      <p className="mb-2">We may collect personal information that you voluntarily provide, including:</p>
                      <ul className="mb-3">
                        <li><strong>School Administrators:</strong> Name, email, phone number, school details, position, qualifications</li>
                        <li><strong>Teachers:</strong> Name, email, phone, address, qualifications, experience, department, designation</li>
                        <li><strong>Students:</strong> Name, date of birth, parent/guardian information, contact details, academic records</li>
                        <li><strong>Parents:</strong> Name, email, phone number, relationship to student</li>
                      </ul>

                      <h5 className="fw-semibold mt-3 mb-2">2.2 Academic Information</h5>
                      <p className="mb-2">We collect and store:</p>
                      <ul className="mb-3">
                        <li>Attendance records</li>
                        <li>Academic performance and grades</li>
                        <li>Assignment submissions and feedback</li>
                        <li>Behavior and disciplinary records</li>
                        <li>Extracurricular activities participation</li>
                      </ul>

                      <h5 className="fw-semibold mt-3 mb-2">2.3 Usage Information</h5>
                      <p className="mb-2">We automatically collect certain information when you use the platform:</p>
                      <ul>
                        <li>Log data (IP address, browser type, pages visited)</li>
                        <li>Device information</li>
                        <li>Usage patterns and preferences</li>
                        <li>Cookies and similar tracking technologies</li>
                      </ul>
                    </div>
                  </section>

                  {/* How We Use Your Information */}
                  <section className="mb-4">
                    <h2 className="h4 fw-semibold mb-3">3. How We Use Your Information</h2>
                    <div className="text-secondary">
                      <p className="mb-2">We use the collected information for:</p>
                      <ul>
                        <li>Providing and maintaining the school management services</li>
                        <li>Managing student enrollment and academic records</li>
                        <li>Facilitating communication between teachers, students, and parents</li>
                        <li>Tracking attendance and academic performance</li>
                        <li>Generating reports and analytics</li>
                        <li>Sending notifications and updates</li>
                        <li>Improving our services and user experience</li>
                        <li>Ensuring security and preventing fraud</li>
                        <li>Complying with legal obligations</li>
                      </ul>
                    </div>
                  </section>

                  {/* Information Sharing */}
                  <section className="mb-4">
                    <h2 className="h4 fw-semibold mb-3">4. Information Sharing and Disclosure</h2>
                    <div className="text-secondary">
                      <p className="mb-2">We may share your information in the following circumstances:</p>
                      <ul className="mb-3">
                        <li><strong>Within the School:</strong> Information is shared with authorized school staff, teachers, and administrators as necessary for educational purposes</li>
                        <li><strong>With Parents/Guardians:</strong> Student information is shared with authorized parents or guardians</li>
                        <li><strong>Service Providers:</strong> We may share data with third-party service providers who assist in operating our platform</li>
                        <li><strong>Legal Requirements:</strong> We may disclose information when required by law or to protect our rights</li>
                        <li><strong>School Transfer:</strong> If a student transfers schools, relevant academic records may be shared with the new institution</li>
                      </ul>
                      <p className="fw-semibold">We do NOT sell, rent, or trade your personal information to third parties for marketing purposes.</p>
                    </div>
                  </section>

                  {/* Data Security */}
                  <section className="mb-4">
                    <h2 className="h4 fw-semibold mb-3">5. Data Security</h2>
                    <p className="text-secondary">
                      We implement appropriate technical and organizational security measures to protect your personal information, including:
                    </p>
                    <ul className="text-secondary">
                      <li>Encryption of data in transit and at rest</li>
                      <li>Secure authentication and access controls</li>
                      <li>Regular security audits and updates</li>
                      <li>Employee training on data protection</li>
                      <li>Backup and disaster recovery procedures</li>
                    </ul>
                    <p className="text-secondary mt-2">
                      However, no method of transmission over the internet is 100% secure. While we strive to protect your information, 
                      we cannot guarantee absolute security.
                    </p>
                  </section>

                  {/* Data Retention */}
                  <section className="mb-4">
                    <h2 className="h4 fw-semibold mb-3">6. Data Retention</h2>
                    <p className="text-secondary">
                      We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, 
                      unless a longer retention period is required or permitted by law. Academic records are typically retained according to 
                      educational regulations and institutional policies.
                    </p>
                  </section>

                  {/* Your Rights */}
                  <section className="mb-4">
                    <h2 className="h4 fw-semibold mb-3">7. Your Privacy Rights</h2>
                    <div className="text-secondary">
                      <p className="mb-2">You have the following rights regarding your personal information:</p>
                      <ul>
                        <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                        <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                        <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal requirements)</li>
                        <li><strong>Restriction:</strong> Request restriction of processing your personal information</li>
                        <li><strong>Portability:</strong> Request transfer of your data to another organization</li>
                        <li><strong>Objection:</strong> Object to processing of your personal information</li>
                        <li><strong>Withdraw Consent:</strong> Withdraw consent where processing is based on consent</li>
                      </ul>
                      <p className="mt-2">To exercise these rights, please contact us using the information provided below.</p>
                    </div>
                  </section>

                  {/* Children's Privacy */}
                  <section className="mb-4">
                    <h2 className="h4 fw-semibold mb-3">8. Children's Privacy</h2>
                    <p className="text-secondary">
                      KidsClub is designed for use in educational settings with students of all ages. We take special care to protect 
                      the privacy of minors. For students under 18, we require parental consent for registration and data processing. 
                      Parents and guardians have the right to review, update, or delete their child's information at any time.
                    </p>
                  </section>

                  {/* Cookies */}
                  <section className="mb-4">
                    <h2 className="h4 fw-semibold mb-3">9. Cookies and Tracking Technologies</h2>
                    <p className="text-secondary mb-2">
                      We use cookies and similar tracking technologies to enhance your experience. Cookies help us:
                    </p>
                    <ul className="text-secondary">
                      <li>Remember your login information</li>
                      <li>Understand how you use the platform</li>
                      <li>Personalize your experience</li>
                      <li>Analyze usage patterns and improve our services</li>
                    </ul>
                    <p className="text-secondary mt-2">
                      You can control cookies through your browser settings. However, disabling cookies may affect the functionality of the platform.
                    </p>
                  </section>

                  {/* Third-Party Links */}
                  <section className="mb-4">
                    <h2 className="h4 fw-semibold mb-3">10. Third-Party Links</h2>
                    <p className="text-secondary">
                      Our platform may contain links to third-party websites or services. We are not responsible for the privacy practices 
                      of these third parties. We encourage you to review the privacy policies of any third-party sites you visit.
                    </p>
                  </section>

                  {/* International Users */}
                  <section className="mb-4">
                    <h2 className="h4 fw-semibold mb-3">11. International Data Transfers</h2>
                    <p className="text-secondary">
                      Your information may be transferred to and processed in countries other than your country of residence. 
                      We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
                    </p>
                  </section>

                  {/* Changes to Policy */}
                  <section className="mb-4">
                    <h2 className="h4 fw-semibold mb-3">12. Changes to This Privacy Policy</h2>
                    <p className="text-secondary">
                      We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new 
                      Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy 
                      periodically for any changes.
                    </p>
                  </section>

                  {/* Contact */}
                  <section className="mb-4">
                    <h2 className="h4 fw-semibold mb-3">13. Contact Us</h2>
                    <p className="text-secondary">
                      If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, 
                      please contact us:
                    </p>
                    <div className="bg-light p-3 rounded mt-2">
                      <p className="mb-1"><strong>Data Protection Officer</strong></p>
                      <p className="mb-1"><strong>Email:</strong> privacy@kidsclub.com</p>
                      <p className="mb-1"><strong>Support Email:</strong> support@kidsclub.com</p>
                      <p className="mb-1"><strong>Phone:</strong> +91-XXXX-XXXXXX</p>
                      <p className="mb-0"><strong>Address:</strong> KidsClub Headquarters, India</p>
                    </div>
                  </section>

                  {/* Acknowledgment */}
                  <section className="mb-4">
                    <div className="alert alert-info border-info">
                      <h5 className="fw-semibold mb-2">Your Consent</h5>
                      <p className="mb-0 small">
                        By using KidsClub, you consent to this Privacy Policy and agree to its terms. If you do not agree with 
                        this policy, please do not use our platform.
                      </p>
                    </div>
                  </section>
                </div>
              </div>
            </div>

            {/* Related Links */}
            <div className="mt-4 text-center">
              <Link href={`/terms?from=${from}`} className="btn btn-outline-warning me-2">
                View Terms and Conditions
              </Link>
              <Link href={getBackUrl()} className="btn btn-warning">
                Back to Registration
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

