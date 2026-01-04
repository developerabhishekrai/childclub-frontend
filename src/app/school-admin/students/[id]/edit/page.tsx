'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, User, Mail, Phone, MapPin, Calendar, BookOpen, Users, Key, RefreshCw, Eye, EyeOff, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { apiGet, apiPut, getStoredToken, getStoredUser, API_BASE_URL } from '@/lib/api';
import { validatePassword, generateSecurePassword, getStrengthColor, getStrengthLabel } from '@/lib/password-validator';
import Swal from 'sweetalert2';

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  enrollNumber?: string;
  gender?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  emergencyContact?: string;
  previousSchool?: string;
  currentClassId?: number;
  status: string;
  role: string;
  schoolId: number;
}

export default function StudentEditPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;
  
  const [student, setStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    dateOfBirth: '',
    gender: 'other',
    address: '',
    city: '',
    state: '',
    country: 'India',
    postalCode: '',
    enrollNumber: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    emergencyContact: '',
    previousSchool: '',
    classId: '',
    status: 'active'
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [classes, setClasses] = useState<any[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  
  // Password Reset States
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<any>(null);
  const [resettingPassword, setResettingPassword] = useState(false);

  useEffect(() => {
    if (studentId) {
      fetchStudent();
      fetchClasses();
    }
  }, [studentId]);

  const fetchClasses = async () => {
    try {
      setLoadingClasses(true);
      const token = getStoredToken();
      
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/classes`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        const activeClasses = data.filter(cls => cls.status === 'ACTIVE' || cls.status === 'active');
        setClasses(activeClasses);
      } else {
        setClasses([]);
      }
    } catch (error: any) {
      console.error('Error fetching classes:', error);
      setClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  };

  const fetchStudent = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = getStoredToken();
      if (!token) {
        throw new Error('Authentication required. Please login again.');
      }

      const response = await apiGet<Student>(`/students/${studentId}`, { token });
      setStudent(response);
      
      // Populate form with existing data
      setFormData({
        firstName: response.firstName || '',
        lastName: response.lastName || '',
        email: response.email || '',
        mobile: response.mobile || '',
        dateOfBirth: response.dateOfBirth ? response.dateOfBirth.split('T')[0] : '',
        gender: response.gender || 'other',
        address: response.address || '',
        city: response.city || '',
        state: response.state || '',
        country: response.country || 'India',
        postalCode: response.postalCode || '',
        enrollNumber: response.enrollNumber || '',
        parentName: response.parentName || '',
        parentPhone: response.parentPhone || '',
        parentEmail: response.parentEmail || '',
        emergencyContact: response.emergencyContact || '',
        previousSchool: response.previousSchool || '',
        classId: response.currentClassId ? response.currentClassId.toString() : '',
        status: response.status || 'active'
      });
      
      console.log('Student fetched:', response);
    } catch (error: any) {
      console.error('Error fetching student:', error);
      setError(error?.message || 'Failed to fetch student details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  // Password Reset Functions
  const handleGeneratePassword = () => {
    const password = generateSecurePassword(12);
    setNewPassword(password);
    const strength = validatePassword(password);
    setPasswordStrength(strength);
    setShowPassword(true);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setNewPassword(password);
    const strength = validatePassword(password);
    setPasswordStrength(strength);
  };

  const handleCopyPassword = async () => {
    if (newPassword) {
      try {
        await navigator.clipboard.writeText(newPassword);
        setPasswordCopied(true);
        setTimeout(() => setPasswordCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy password:', err);
      }
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword) {
      Swal.fire({
        icon: 'warning',
        title: 'No Password',
        text: 'Please generate or enter a password first',
      });
      return;
    }

    // Validate password
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      Swal.fire({
        icon: 'error',
        title: 'Weak Password',
        html: `<div class="text-start">
          <p>Password requirements not met:</p>
          <ul>${validation.errors.map(err => `<li>${err}</li>`).join('')}</ul>
        </div>`,
      });
      return;
    }

    // Confirm password reset
    const result = await Swal.fire({
      icon: 'question',
      title: 'Reset Password?',
      html: `
        <p>Are you sure you want to reset the password for <strong>${student?.firstName} ${student?.lastName}</strong>?</p>
        <div class="alert alert-warning mt-3">
          <i class="fas fa-exclamation-triangle me-2"></i>
          The student will need to use the new password to login.
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Yes, Reset Password',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc3545',
    });

    if (!result.isConfirmed) return;

    setResettingPassword(true);
    try {
      const token = getStoredToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      // Call API to reset password
      const response = await fetch(`${API_BASE_URL}/students/${studentId}/reset-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword }),
      });

      if (!response.ok) {
        throw new Error('Failed to reset password');
      }

      await Swal.fire({
        icon: 'success',
        title: 'Password Reset Successful!',
        html: `
          <p>Password has been successfully reset for ${student?.firstName} ${student?.lastName}</p>
          <div class="alert alert-info mt-3">
            <strong>New Password:</strong> <code>${newPassword}</code>
            <button class="btn btn-sm btn-outline-primary ms-2" onclick="navigator.clipboard.writeText('${newPassword}')">
              <i class="fas fa-copy"></i> Copy
            </button>
          </div>
          <p class="text-muted small">Make sure to share this password with the student and parent securely.</p>
        `,
        confirmButtonText: 'OK',
      });

      // Clear password field after success
      setNewPassword('');
      setPasswordStrength(null);
      setShowPassword(false);

    } catch (error: any) {
      console.error('Error resetting password:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error?.message || 'Failed to reset password. Please try again.',
      });
    } finally {
      setResettingPassword(false);
    }
  };

  const validateForm = () => {
    const newErrors: any = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    
    setError(Object.values(newErrors).join(', '));
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      const token = getStoredToken();
      if (!token) {
        throw new Error('Authentication required. Please login again.');
      }

      // Get logged-in user's school ID
      let user = getStoredUser();
      
      // Fallback: Direct localStorage read
      if (!user) {
        const userRaw = localStorage.getItem('user');
        if (userRaw) {
          try {
            user = JSON.parse(userRaw);
          } catch (e) {
            console.error('Failed to parse user from localStorage:', e);
          }
        }
      }
      
      if (!user || !user.schoolId) {
        throw new Error('School ID not found. Please login again.');
      }

      // Prepare data for API
      const studentData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        mobile: formData.mobile || null,
        dateOfBirth: formData.dateOfBirth || null,
        gender: formData.gender,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        country: formData.country,
        postalCode: formData.postalCode || null,
        enrollNumber: formData.enrollNumber || null,
        parentName: formData.parentName || null,
        parentPhone: formData.parentPhone || null,
        parentEmail: formData.parentEmail || null,
        emergencyContact: formData.emergencyContact || null,
        previousSchool: formData.previousSchool || null,
        classId: formData.classId || null,
        status: formData.status,
      };

      console.log('Updating student:', studentData);
      
      // Call API using helper function
      const response = await apiPut(`/students/${studentId}`, studentData, { token });
      
      console.log('Student updated successfully:', response);
      setSuccess('Student updated successfully!');
      
      // Show success alert
      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Student information has been updated successfully.',
        timer: 1500,
        showConfirmButton: false
      });
      
      // Redirect to students list page
      router.push('/school-admin/students');
      
    } catch (error: any) {
      console.error('Error updating student:', error);
      let errorMessage = error?.message || 'Error updating student. Please try again.';
      
      // Check if it's an enrollment number conflict
      if (errorMessage.includes('Enrollment number already exists')) {
        errorMessage = 'This enrollment number already exists in the selected class. Please use a different enrollment number.';
      }
      
      setError(errorMessage);
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading student details...</p>
        </div>
      </div>
    );
  }

  if (error && !student) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="alert alert-danger" role="alert">
            <h5 className="alert-heading">Error Loading Student</h5>
            <p>{error}</p>
            <hr />
            <div className="d-flex gap-2 justify-content-center">
              <button 
                className="btn btn-outline-danger"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
              <Link href="/school-admin/students" className="btn btn-secondary">
                Back to Students
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <div className="bg-white shadow-sm border-bottom">
        <div className="container-fluid py-3">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <Link href="/school-admin/students" className="btn btn-outline-secondary">
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="h3 mb-0 fw-bold text-dark">
                  <i className="fas fa-user-edit me-2 text-primary"></i>
                  Edit Student
                </h1>
                <p className="text-muted mb-0">Update student information and profile</p>
              </div>
            </div>
            <div>
              <Link 
                href="/school-admin/students" 
                className="btn btn-outline-secondary me-2"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-lg-10 col-xl-8">
            <div className="card border-0 shadow">
              <div className="card-body p-4 p-lg-5">
                {/* Success/Error Messages */}
                {success && (
                  <div className="alert alert-success d-flex align-items-center" role="alert">
                    <i className="fas fa-check-circle me-2"></i>
                    <div>{success}</div>
                  </div>
                )}
                
                {error && (
                  <div className="alert alert-danger d-flex align-items-center" role="alert">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    <div>{error}</div>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Personal Information */}
                  <div className="mb-5">
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <div className="bg-primary bg-opacity-10 p-3 rounded-circle">
                        <User size={24} className="text-primary" />
                      </div>
                      <h3 className="mb-0 fw-bold text-dark">Personal Information</h3>
                    </div>
                    <div className="row g-4">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          First Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="form-control form-control-lg"
                          placeholder="Enter first name"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          Last Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="form-control form-control-lg"
                          placeholder="Enter last name"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          Email Address <span className="text-danger">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="form-control form-control-lg"
                          placeholder="Enter email address"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Mobile Number</label>
                        <input
                          type="tel"
                          name="mobile"
                          value={formData.mobile}
                          onChange={handleInputChange}
                          className="form-control form-control-lg"
                          placeholder="Enter mobile number"
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">Date of Birth</label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          className="form-control form-control-lg"
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">Gender</label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className="form-select form-select-lg"
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">Status</label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className="form-select form-select-lg"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="graduated">Graduated</option>
                          <option value="transferred">Transferred</option>
                          <option value="suspended">Suspended</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Enrollment Number</label>
                        <input
                          type="text"
                          name="enrollNumber"
                          value={formData.enrollNumber}
                          onChange={handleInputChange}
                          className="form-control form-control-lg"
                          placeholder="Enter enrollment number"
                        />
                        <small className="text-muted d-block mt-2">
                          <i className="fas fa-info-circle me-1"></i>
                          Enrollment number must be unique within the selected class
                        </small>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Previous School</label>
                        <input
                          type="text"
                          name="previousSchool"
                          value={formData.previousSchool}
                          onChange={handleInputChange}
                          className="form-control form-control-lg"
                          placeholder="Enter previous school name"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password Reset Section */}
                  <div className="mb-5">
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <div className="bg-danger bg-opacity-10 p-3 rounded-circle">
                        <Key size={24} className="text-danger" />
                      </div>
                      <h3 className="mb-0 fw-bold text-dark">Password Reset</h3>
                    </div>
                    <div className="card bg-light border-warning">
                      <div className="card-body">
                        <div className="alert alert-warning d-flex align-items-start mb-3">
                          <i className="fas fa-exclamation-triangle me-2 mt-1"></i>
                          <div>
                            <strong>Security Notice:</strong> Reset the student's password if they forgot it or for security reasons.
                            Make sure to share the new password securely with the student and parent.
                          </div>
                        </div>
                        
                        <div className="row g-3">
                          <div className="col-12">
                            <label className="form-label fw-semibold">
                              New Password
                            </label>
                            <div className="input-group input-group-lg">
                              <input
                                type={showPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={handlePasswordChange}
                                className="form-control"
                                placeholder="Enter new password or generate one"
                              />
                              <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => setShowPassword(!showPassword)}
                                title={showPassword ? "Hide password" : "Show password"}
                              >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-primary"
                                onClick={handleGeneratePassword}
                                title="Generate secure password"
                              >
                                <RefreshCw size={18} /> Generate
                              </button>
                              {newPassword && (
                                <button
                                  type="button"
                                  className="btn btn-outline-success"
                                  onClick={handleCopyPassword}
                                  title="Copy password"
                                >
                                  {passwordCopied ? <Check size={18} /> : <Copy size={18} />}
                                </button>
                              )}
                            </div>
                            
                            {/* Password Strength Indicator */}
                            {passwordStrength && newPassword && (
                              <div className="mt-2">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                  <small className="text-muted">Password Strength:</small>
                                  <small className={`text-${getStrengthColor(passwordStrength.strength)} fw-bold`}>
                                    {getStrengthLabel(passwordStrength.strength)}
                                  </small>
                                </div>
                                <div className="progress" style={{ height: '6px' }}>
                                  <div
                                    className={`progress-bar bg-${getStrengthColor(passwordStrength.strength)}`}
                                    role="progressbar"
                                    style={{ width: `${passwordStrength.score}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                            
                            <small className="text-muted d-block mt-2">
                              <i className="fas fa-info-circle me-1"></i>
                              Password must contain: uppercase, lowercase, number, and special character
                            </small>
                          </div>
                          
                          <div className="col-12">
                            <button
                              type="button"
                              onClick={handleResetPassword}
                              disabled={resettingPassword || !newPassword}
                              className="btn btn-danger btn-lg w-100"
                            >
                              {resettingPassword ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                  Resetting Password...
                                </>
                              ) : (
                                <>
                                  <Key size={18} className="me-2" />
                                  Reset Password
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="mb-5">
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <div className="bg-info bg-opacity-10 p-3 rounded-circle">
                        <MapPin size={24} className="text-info" />
                      </div>
                      <h3 className="mb-0 fw-bold text-dark">Address Information</h3>
                    </div>
                    <div className="row g-4">
                      <div className="col-12">
                        <label className="form-label fw-semibold">Address</label>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="form-control form-control-lg"
                          rows={3}
                          placeholder="Enter complete address"
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">City</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="form-control form-control-lg"
                          placeholder="Enter city"
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">State</label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className="form-control form-control-lg"
                          placeholder="Enter state"
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">Country</label>
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          className="form-control form-control-lg"
                          placeholder="Enter country"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Postal Code</label>
                        <input
                          type="text"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          className="form-control form-control-lg"
                          placeholder="Enter postal code"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Parent/Guardian Information */}
                  <div className="mb-5">
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <div className="bg-success bg-opacity-10 p-3 rounded-circle">
                        <Users size={24} className="text-success" />
                      </div>
                      <h3 className="mb-0 fw-bold text-dark">Parent/Guardian Information</h3>
                    </div>
                    <div className="row g-4">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Parent/Guardian Name</label>
                        <input
                          type="text"
                          name="parentName"
                          value={formData.parentName}
                          onChange={handleInputChange}
                          className="form-control form-control-lg"
                          placeholder="Enter parent/guardian name"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Parent Phone</label>
                        <input
                          type="tel"
                          name="parentPhone"
                          value={formData.parentPhone}
                          onChange={handleInputChange}
                          className="form-control form-control-lg"
                          placeholder="Enter parent phone number"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Parent Email</label>
                        <input
                          type="email"
                          name="parentEmail"
                          value={formData.parentEmail}
                          onChange={handleInputChange}
                          className="form-control form-control-lg"
                          placeholder="Enter parent email address"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Emergency Contact</label>
                        <input
                          type="tel"
                          name="emergencyContact"
                          value={formData.emergencyContact}
                          onChange={handleInputChange}
                          className="form-control form-control-lg"
                          placeholder="Enter emergency contact number"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Class Assignment */}
                  <div className="mb-5">
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <div className="bg-warning bg-opacity-10 p-3 rounded-circle">
                        <BookOpen size={24} className="text-warning" />
                      </div>
                      <h3 className="mb-0 fw-bold text-dark">Class Assignment</h3>
                    </div>
                    <div className="row g-4">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          Assign to Class
                          {loadingClasses && (
                            <span className="spinner-border spinner-border-sm ms-2" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </span>
                          )}
                        </label>
                        <select
                          name="classId"
                          value={formData.classId}
                          onChange={handleInputChange}
                          className="form-select form-select-lg"
                          disabled={loadingClasses}
                        >
                          <option value="">
                            {loadingClasses 
                              ? 'Loading classes...' 
                              : classes.length === 0 
                                ? 'No classes available' 
                                : 'Select a class (optional)'
                            }
                          </option>
                          {!loadingClasses && classes.map((cls) => (
                            <option key={cls.id} value={cls.id}>
                              {cls.name}
                            </option>
                          ))}
                        </select>
                        {!loadingClasses && classes.length === 0 && (
                          <small className="text-muted mt-2 d-block">
                            <i className="fas fa-info-circle me-1"></i>
                            No classes available. Please create classes first from the{' '}
                            <Link href="/school-admin/create-class" className="text-primary">
                              Create Class
                            </Link>{' '}
                            page.
                          </small>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="d-flex gap-3 justify-content-end pt-4 border-top">
                    <Link href="/school-admin/students" className="btn btn-secondary btn-lg px-5">
                      <i className="fas fa-times me-2"></i>
                      Cancel
                    </Link>
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn btn-primary btn-lg px-5"
                    >
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save size={18} className="me-2" />
                          Update Student
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

