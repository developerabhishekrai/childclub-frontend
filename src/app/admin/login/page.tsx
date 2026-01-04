'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { storeToken, storeUser, API_BASE_URL } from '@/lib/api'

export default function AdminLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: 'school_admin'
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Store token and user using centralized functions
        storeToken(data.access_token)
        storeUser(data.user)
        localStorage.setItem('userRole', 'school_admin')
        
        // Redirect to admin dashboard
        router.push('/school-admin/dashboard')
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Login failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            {/* Logo and Header */}
            <div className="text-center mb-4">
              <div className="bg-warning rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '64px', height: '64px'}}>
                <span className="text-white fs-1">🏫</span>
              </div>
              <h1 className="h3 fw-bold text-dark">School Admin Portal</h1>
              <p className="text-muted">Access your school management dashboard</p>
            </div>

            {/* Login Form */}
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                {error && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError('')}></button>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-semibold">
                      Email Address
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

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label fw-semibold">
                      Password
                    </label>
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      required
                    />
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="rememberMe" />
                      <label className="form-check-label text-muted" htmlFor="rememberMe">
                        Remember me
                      </label>
                    </div>
                    <Link href="/admin/forgot-password" className="text-decoration-none text-primary">
                      Forgot password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-warning btn-lg w-100 mb-3"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Signing in...
                      </>
                    ) : (
                      'Sign In to Dashboard'
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="text-center my-3">
                  <span className="text-muted">or</span>
                </div>

                {/* Alternative Login */}
                <div className="d-grid gap-2">
                  <button className="btn btn-outline-secondary btn-lg">
                    <span className="me-2">📧</span>
                    Continue with Email
                  </button>
                </div>

                {/* Sign Up Link */}
                <div className="text-center mt-4">
                  <span className="text-muted">Don't have an admin account? </span>
                  <Link href="/admin/register" className="text-decoration-none text-warning fw-semibold">
                    Register here
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
