'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { storeToken, storeUser, API_BASE_URL } from '@/lib/api'

export default function SuperAdminLogin() {
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
          role: 'super_admin'
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Store token and user using centralized functions
        storeToken(data.access_token)
        storeUser(data.user)
        localStorage.setItem('userRole', 'super_admin')
        
        // Redirect to super admin dashboard
        router.push('/super-admin/dashboard')
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
    <div className="min-vh-100 bg-gradient-primary d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            {/* Logo and Header */}
            <div className="text-center mb-4">
              <div className="bg-danger rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
                <span className="text-white fs-1">👑</span>
              </div>
              <h1 className="h2 fw-bold text-white">Super Admin Portal</h1>
              <p className="text-white-50">Access the ultimate control center</p>
            </div>

            {/* Login Form */}
            <div className="card shadow-lg border-0">
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
                    <Link href="/super-admin/forgot-password" className="text-decoration-none text-danger">
                      Forgot password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-danger btn-lg w-100 mb-3"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Accessing Portal...
                      </>
                    ) : (
                      'Access Super Admin Portal'
                    )}
                  </button>
                </form>

                {/* Security Notice */}
                <div className="alert alert-warning alert-sm mt-3 mb-0">
                  <small className="text-muted">
                    <strong>🔒 Security Notice:</strong> This portal provides access to system-wide controls. 
                    Please ensure you're on a secure network.
                  </small>
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
      </div>
    </div>
  )
}
