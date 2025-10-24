'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function TeacherLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.user.role === 'teacher') {
          localStorage.setItem('token', data.access_token);
          localStorage.setItem('userId', data.user.id);
          localStorage.setItem('userName', `${data.user.firstName} ${data.user.lastName}`);
          localStorage.setItem('userRole', data.user.role);
          
          setTimeout(() => {
            window.location.href = '/teacher/dashboard';
          }, 100);
        } else {
          setError('This login is only for teachers. Please use the correct portal.');
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-5" style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
            {/* Header */}
            <div className="text-center mb-4">
              <div className="mb-3">
                <span style={{ fontSize: '4rem' }}>👨‍🏫</span>
              </div>
              <h2 className="text-white fw-bold mb-2">Teacher Login</h2>
              <p className="text-white-50">Sign in to access your dashboard</p>
            </div>

            {/* Login Form Card */}
            <div className="card border-0 shadow-lg">
              <div className="card-body p-4 p-md-5">
                {error && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <strong>Error:</strong> {error}
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setError('')}
                      aria-label="Close"
                    ></button>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Email Field */}
                  <div className="mb-4">
                    <label htmlFor="email" className="form-label fw-semibold text-dark">
                      📧 Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control form-control-lg border-2"
                      id="email"
                      name="email"
                      placeholder="teacher@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      style={{
                        borderRadius: '10px',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  </div>

                  {/* Password Field */}
                  <div className="mb-4">
                    <label htmlFor="password" className="form-label fw-semibold text-dark">
                      🔒 Password
                    </label>
                    <div className="input-group">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-control form-control-lg border-2"
                        id="password"
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        style={{
                          borderRadius: '10px 0 0 10px',
                          transition: 'all 0.3s ease'
                        }}
                      />
                      <button
                        className="btn btn-outline-secondary border-2"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          borderRadius: '0 10px 10px 0'
                        }}
                      >
                        {showPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn btn-lg w-100 mb-3 text-white fw-bold"
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none'
                    }}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Signing In...
                      </>
                    ) : (
                      '🚀 Sign In to Dashboard'
                    )}
                  </button>

                  {/* Forgot Password Link */}
                  <div className="text-center">
                    <a href="#" className="text-decoration-none text-muted small">
                      Forgot your password?
                    </a>
                  </div>
                </form>
              </div>
            </div>

            {/* Back to Main */}
            <div className="text-center mt-4">
              <a href="/" className="text-decoration-none text-white">
                <small>← Back to Home</small>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
