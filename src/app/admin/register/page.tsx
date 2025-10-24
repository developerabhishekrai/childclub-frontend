'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api-endpoints'
import { ApiError } from '@/lib/api'
import type { RegisterRequest } from '@/types/api'
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator'
import { validatePasswordComprehensive } from '@/lib/password-validator'

export default function AdminRegister() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    schoolName: '',
    schoolType: '',
    schoolAddress: '',
    schoolCity: '',
    schoolState: '',
    schoolCountry: '',
    schoolPostalCode: '',
    schoolPhone: '',
    schoolEmail: '',
    schoolWebsite: '',
    adminPosition: '',
    yearsOfExperience: '',
    educationLevel: '',
    certifications: '',
    termsAccepted: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }

  const validateForm = () => {
    // Validate password strength
    const passwordValidation = validatePasswordComprehensive(
      formData.password,
      formData.confirmPassword
    )
    
    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors[0])
      return false
    }
    
    if (!formData.termsAccepted) {
      setError('Please accept the terms and conditions')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Prepare registration data
      const registrationData: RegisterRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: 'school_admin',
        // Admin specific fields
        adminPosition: formData.adminPosition,
        yearsOfExperience: formData.yearsOfExperience,
        educationLevel: formData.educationLevel,
        certifications: formData.certifications,
        // School information
        schoolName: formData.schoolName,
        schoolType: formData.schoolType,
        schoolAddress: formData.schoolAddress,
        schoolCity: formData.schoolCity,
        schoolState: formData.schoolState,
        schoolCountry: formData.schoolCountry,
        schoolPostalCode: formData.schoolPostalCode,
        schoolPhone: formData.schoolPhone,
        schoolEmail: formData.schoolEmail,
        schoolWebsite: formData.schoolWebsite,
      }

      // Register user with admin and school fields using API helper
      const result = await authApi.register(registrationData)
      
      console.log('Registration successful:', result)

      // Check if school was created during registration
      if (result.school) {
        console.log('School created successfully during registration:', result.school)
      } else {
        console.warn('School was not created during registration. User may need to create it separately.')
      }

      setSuccess('✅ Registration successful! Your school registration is pending approval from Super Admin. You will be notified once approved.')
      setTimeout(() => {
        router.push('/admin/login')
      }, 4000)

    } catch (err) {
      console.error('Registration error:', err)
      
      // Handle API errors
      if (err instanceof ApiError) {
        // Handle specific error cases
        if (err.message && err.message.includes('Duplicate entry')) {
          if (err.message.includes('mobile') || err.message.includes('IDX_d376a9f93bba651f32a2c03a7d')) {
            setError('❌ This mobile number is already registered. Please use a different mobile number or login with your existing account.')
          } else if (err.message.includes('email')) {
            setError('❌ This email is already registered. Please use a different email or login with your existing account.')
          } else {
            setError(err.message)
          }
        } else {
          setError(err.message || 'Registration failed. Please try again.')
        }
      } else {
        setError('Network error. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-vh-100 bg-light py-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            {/* Header */}
            <div className="text-center mb-4">
              <div className="bg-warning rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '64px', height: '64px'}}>
                <span className="text-white fs-1">🏫</span>
              </div>
              <h1 className="h2 fw-bold text-dark">School Administrator Registration</h1>
              <p className="text-muted">Join ChildClub and manage your educational institution!</p>
            </div>

            {/* Registration Form */}
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                {error && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError('')}></button>
                  </div>
                )}

                {success && (
                  <div className="alert alert-success alert-dismissible fade show" role="alert">
                    {success}
                    <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Personal Information */}
                  <div className="row mb-4">
                    <div className="col-12">
                      <h5 className="text-warning mb-3">👤 Personal Information</h5>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="firstName" className="form-label fw-semibold">
                        First Name *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="lastName" className="form-label fw-semibold">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="email" className="form-label fw-semibold">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="mobile" className="form-label fw-semibold">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        id="mobile"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* School Information */}
                  <div className="row mb-4">
                    <div className="col-12">
                      <h5 className="text-warning mb-3">🏫 School Information</h5>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="schoolName" className="form-label fw-semibold">
                        School Name *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="schoolName"
                        name="schoolName"
                        value={formData.schoolName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="schoolType" className="form-label fw-semibold">
                        School Type
                      </label>
                      <select
                        className="form-select"
                        id="schoolType"
                        name="schoolType"
                        value={formData.schoolType}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select School Type *</option>
                        <option value="primary">Primary School</option>
                        <option value="secondary">Secondary School</option>
                        <option value="higher_secondary">Higher Secondary School</option>
                        <option value="international">International School</option>
                        <option value="special_needs">Special Needs School</option>
                      </select>
                    </div>
                    <div className="col-12 mb-3">
                      <label htmlFor="schoolAddress" className="form-label fw-semibold">
                        School Address
                      </label>
                      <textarea
                        className="form-control"
                        id="schoolAddress"
                        name="schoolAddress"
                        rows={2}
                        value={formData.schoolAddress}
                        onChange={handleChange}
                      ></textarea>
                    </div>
                    <div className="col-md-3 mb-3">
                      <label htmlFor="schoolCity" className="form-label fw-semibold">
                        City
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="schoolCity"
                        name="schoolCity"
                        value={formData.schoolCity}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label htmlFor="schoolState" className="form-label fw-semibold">
                        State/Province
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="schoolState"
                        name="schoolState"
                        value={formData.schoolState}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label htmlFor="schoolCountry" className="form-label fw-semibold">
                        Country
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="schoolCountry"
                        name="schoolCountry"
                        value={formData.schoolCountry}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label htmlFor="schoolPostalCode" className="form-label fw-semibold">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="schoolPostalCode"
                        name="schoolPostalCode"
                        value={formData.schoolPostalCode}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="schoolPhone" className="form-label fw-semibold">
                        School Phone
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        id="schoolPhone"
                        name="schoolPhone"
                        value={formData.schoolPhone}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="schoolEmail" className="form-label fw-semibold">
                        School Email
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="schoolEmail"
                        name="schoolEmail"
                        value={formData.schoolEmail}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-12 mb-3">
                      <label htmlFor="schoolWebsite" className="form-label fw-semibold">
                        School Website
                      </label>
                      <input
                        type="url"
                        className="form-control"
                        id="schoolWebsite"
                        name="schoolWebsite"
                        value={formData.schoolWebsite}
                        onChange={handleChange}
                        placeholder="https://www.schoolname.com"
                      />
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div className="row mb-4">
                    <div className="col-12">
                      <h5 className="text-warning mb-3">💼 Professional Information</h5>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="adminPosition" className="form-label fw-semibold">
                        Administrative Position *
                      </label>
                      <select
                        className="form-select"
                        id="adminPosition"
                        name="adminPosition"
                        value={formData.adminPosition}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Position</option>
                        <option value="principal">Principal</option>
                        <option value="vice_principal">Vice Principal</option>
                        <option value="headmaster">Headmaster</option>
                        <option value="director">Director</option>
                        <option value="administrator">Administrator</option>
                        <option value="coordinator">Coordinator</option>
                        <option value="manager">Manager</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="yearsOfExperience" className="form-label fw-semibold">
                        Years of Experience
                      </label>
                      <select
                        className="form-select"
                        id="yearsOfExperience"
                        name="yearsOfExperience"
                        value={formData.yearsOfExperience}
                        onChange={handleChange}
                      >
                        <option value="">Select Experience</option>
                        <option value="0-2">0-2 years</option>
                        <option value="3-5">3-5 years</option>
                        <option value="6-10">6-10 years</option>
                        <option value="11-15">11-15 years</option>
                        <option value="16-20">16-20 years</option>
                        <option value="20+">20+ years</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="educationLevel" className="form-label fw-semibold">
                        Highest Education Level
                      </label>
                      <select
                        className="form-select"
                        id="educationLevel"
                        name="educationLevel"
                        value={formData.educationLevel}
                        onChange={handleChange}
                      >
                        <option value="">Select Education Level</option>
                        <option value="bachelor">Bachelor's Degree</option>
                        <option value="master">Master's Degree</option>
                        <option value="doctorate">Doctorate/PhD</option>
                        <option value="diploma">Diploma</option>
                        <option value="certification">Professional Certification</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="certifications" className="form-label fw-semibold">
                        Professional Certifications
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="certifications"
                        name="certifications"
                        value={formData.certifications}
                        onChange={handleChange}
                        placeholder="e.g., Educational Leadership, School Management"
                      />
                    </div>
                  </div>

                  {/* Security */}
                  <div className="row mb-4">
                    <div className="col-12">
                      <h5 className="text-warning mb-3">🔐 Security</h5>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="password" className="form-label fw-semibold">
                        Password *
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={8}
                      />
                      <PasswordStrengthIndicator password={formData.password} />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="confirmPassword" className="form-label fw-semibold">
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="mb-4">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="termsAccepted"
                        name="termsAccepted"
                        checked={formData.termsAccepted}
                        onChange={handleChange}
                        required
                      />
                      <label className="form-check-label" htmlFor="termsAccepted">
                        I agree to the <Link href="/terms?from=admin" className="text-decoration-none">Terms and Conditions</Link> and{' '}
                        <Link href="/privacy?from=admin" className="text-decoration-none">Privacy Policy</Link> *
                      </label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="d-grid">
                    <button
                      type="submit"
                      className="btn btn-warning btn-lg"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Creating Admin Account...
                        </>
                      ) : (
                        'Create School Admin Account'
                      )}
                    </button>
                  </div>
                </form>

                {/* Login Link */}
                <div className="text-center mt-4">
                  <span className="text-muted">Already have an admin account? </span>
                  <Link href="/admin/login" className="text-decoration-none text-warning fw-semibold">
                    Sign in here
                  </Link>
                </div>
              </div>
            </div>

            {/* Back to Home */}
            <div className="text-center mt-4">
              <Link href="/" className="text-decoration-none text-muted">
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
