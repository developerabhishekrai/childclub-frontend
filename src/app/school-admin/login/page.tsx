'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, School, Lock, Mail } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { storeToken, storeUser, API_BASE_URL } from '@/lib/api';

export default function SchoolAdminLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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
      });

      if (response.ok) {
        const data = await response.json();
        
        console.log('=== Login Response ===');
        console.log('Full response:', data);
        console.log('User data:', data.user);
        console.log('School ID:', data.user?.schoolId);
        
        // Check if user data exists
        if (!data.user) {
          setError('❌ Backend error: User data missing in response. Please contact admin.');
          console.error('❌ CRITICAL: data.user is missing from backend response!');
          return;
        }
        
        if (!data.user.schoolId) {
          setError('❌ School ID missing. Your school may not be approved yet.');
          console.error('❌ WARNING: data.user.schoolId is missing!');
          return;
        }
        
        // Store token and user using centralized functions
        storeToken(data.access_token);
        storeUser(data.user);
        
        // Also store individual fields for backward compatibility
        localStorage.setItem('userRole', 'school_admin');
        localStorage.setItem('userEmail', formData.email);
        
        console.log('✅ Data stored in localStorage');
        console.log('Token stored:', localStorage.getItem('token') ? 'Yes' : 'No');
        console.log('User stored:', localStorage.getItem('user'));
        
        // Verify storage before redirect
        const verifyUser = localStorage.getItem('user');
        if (!verifyUser) {
          setError('❌ Failed to store user data. Browser storage may be disabled.');
          console.error('❌ CRITICAL: localStorage.setItem failed!');
          return;
        }
        
        const parsedUser = JSON.parse(verifyUser);
        console.log('✅ Verification passed - School ID:', parsedUser.schoolId);
        
        // Small delay to ensure storage completes
        setTimeout(() => {
          console.log('🔄 Redirecting to dashboard...');
          window.location.href = '/school-admin/dashboard';
        }, 100);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
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
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
            {/* Header */}
            <div className="text-center mb-4">
              <div className="mb-3">
                <span style={{ fontSize: '4rem' }}>🏫</span>
              </div>
              <h2 className="text-white fw-bold mb-2">School Admin Portal</h2>
              <p className="text-white-50">Access your school management dashboard</p>
            </div>

            {/* Login Form Card */}
            <div className="card border-0 shadow-lg">
              <div className="card-body p-4 p-md-5">
                {error && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <strong>Error:</strong> {error}
                    <button type="button" className="btn-close" onClick={() => setError('')}></button>
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
                      placeholder="admin@school.com"
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
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
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
                    <a href="#" className="text-decoration-none text-muted">
                      Forgot your password?
                    </a>
                  </div>
                </form>
              </div>
            </div>

            {/* Additional Info */}
            <div className="text-center mt-4">
              <p className="text-white mb-3">
                Don't have a school account?
              </p>
              <a 
                href="/school-admin/register" 
                className="btn btn-light btn-sm px-4 mb-3"
                style={{ borderRadius: '20px' }}
              >
                📝 Register Your School
              </a>
              
              {/* Other Portals */}
              <p className="text-white mb-2 mt-3">Other Portals:</p>
              <div className="d-flex gap-2 justify-content-center flex-wrap">
                <a 
                  href="/teacher/login" 
                  className="btn btn-light btn-sm px-4"
                  style={{ borderRadius: '20px' }}
                >
                  👨‍🏫 Teacher
                </a>
                <a 
                  href="/student/login" 
                  className="btn btn-light btn-sm px-4"
                  style={{ borderRadius: '20px' }}
                >
                  🎓 Student
                </a>
              </div>
            </div>

            {/* Back to Main */}
            <div className="text-center mt-3">
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


