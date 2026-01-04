'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { API_BASE_URL } from '@/lib/api'

export default function StudentRegister() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    schoolName: '',
    grade: '',
    parentName: '',
    parentEmail: '',
    parentMobile: '',
    emergencyContact: '',
    medicalInfo: '',
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
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
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
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          role: 'student'
        }),
      })

      if (response.ok) {
        setSuccess('Registration successful! Please check your email for verification.')
        setTimeout(() => {
          router.push('/student/login')
        }, 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Registration failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-vh-100 bg-light py-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {/* Header */}
            <div className="text-center mb-4">
              <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '64px', height: '64px'}}>
                <span className="text-white fs-1">📚</span>
              </div>
              <h1 className="h2 fw-bold text-dark">Student Registration</h1>
              <p className="text-muted">Join ChildClub and start your educational journey!</p>
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
                      <h5 className="text-primary mb-3">📋 Personal Information</h5>
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
                    <div className="col-md-6 mb-3">
                      <label htmlFor="dateOfBirth" className="form-label fw-semibold">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="gender" className="form-label fw-semibold">
                        Gender
                      </label>
                      <select
                        className="form-select"
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="row mb-4">
                    <div className="col-12">
                      <h5 className="text-primary mb-3">🏠 Address Information</h5>
                    </div>
                    <div className="col-12 mb-3">
                      <label htmlFor="address" className="form-label fw-semibold">
                        Street Address
                      </label>
                      <textarea
                        className="form-control"
                        id="address"
                        name="address"
                        rows={2}
                        value={formData.address}
                        onChange={handleChange}
                      ></textarea>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label htmlFor="city" className="form-label fw-semibold">
                        City
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label htmlFor="state" className="form-label fw-semibold">
                        State/Province
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label htmlFor="postalCode" className="form-label fw-semibold">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Academic Information */}
                  <div className="row mb-4">
                    <div className="col-12">
                      <h5 className="text-primary mb-3">🎓 Academic Information</h5>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="schoolName" className="form-label fw-semibold">
                        Current School
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="schoolName"
                        name="schoolName"
                        value={formData.schoolName}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="grade" className="form-label fw-semibold">
                        Current Grade/Class
                      </label>
                      <select
                        className="form-select"
                        id="grade"
                        name="grade"
                        value={formData.grade}
                        onChange={handleChange}
                      >
                        <option value="">Select Grade</option>
                        <option value="1">Grade 1</option>
                        <option value="2">Grade 2</option>
                        <option value="3">Grade 3</option>
                        <option value="4">Grade 4</option>
                        <option value="5">Grade 5</option>
                        <option value="6">Grade 6</option>
                        <option value="7">Grade 7</option>
                        <option value="8">Grade 8</option>
                        <option value="9">Grade 9</option>
                        <option value="10">Grade 10</option>
                        <option value="11">Grade 11</option>
                        <option value="12">Grade 12</option>
                      </select>
                    </div>
                  </div>

                  {/* Parent/Guardian Information */}
                  <div className="row mb-4">
                    <div className="col-12">
                      <h5 className="text-primary mb-3">👨‍👩‍👧‍👦 Parent/Guardian Information</h5>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="parentName" className="form-label fw-semibold">
                        Parent/Guardian Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="parentName"
                        name="parentName"
                        value={formData.parentName}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="parentEmail" className="form-label fw-semibold">
                        Parent/Guardian Email
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="parentEmail"
                        name="parentEmail"
                        value={formData.parentEmail}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="parentMobile" className="form-label fw-semibold">
                        Parent/Guardian Mobile
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        id="parentMobile"
                        name="parentMobile"
                        value={formData.parentMobile}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="emergencyContact" className="form-label fw-semibold">
                        Emergency Contact
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        id="emergencyContact"
                        name="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="row mb-4">
                    <div className="col-12">
                      <h5 className="text-primary mb-3">ℹ️ Additional Information</h5>
                    </div>
                    <div className="col-12 mb-3">
                      <label htmlFor="medicalInfo" className="form-label fw-semibold">
                        Medical Information (Allergies, Conditions, etc.)
                      </label>
                      <textarea
                        className="form-control"
                        id="medicalInfo"
                        name="medicalInfo"
                        rows={3}
                        placeholder="Please mention any medical conditions, allergies, or special requirements..."
                        value={formData.medicalInfo}
                        onChange={handleChange}
                      ></textarea>
                    </div>
                  </div>

                  {/* Security */}
                  <div className="row mb-4">
                    <div className="col-12">
                      <h5 className="text-primary mb-3">🔐 Security</h5>
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
                        minLength={6}
                      />
                      <div className="form-text">Password must be at least 6 characters long</div>
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
                        I agree to the <Link href="/terms?from=student" className="text-decoration-none">Terms and Conditions</Link> and{' '}
                        <Link href="/privacy?from=student" className="text-decoration-none">Privacy Policy</Link> *
                      </label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="d-grid">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Creating Account...
                        </>
                      ) : (
                        'Create Student Account'
                      )}
                    </button>
                  </div>
                </form>

                {/* Login Link */}
                <div className="text-center mt-4">
                  <span className="text-muted">Already have an account? </span>
                  <Link href="/student/login" className="text-decoration-none text-primary fw-semibold">
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
