'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, User, Mail, Phone, MapPin, Calendar, GraduationCap, Briefcase, Clock, Key, RefreshCw, Eye, EyeOff, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { apiGet, apiPut, getStoredToken, getStoredUser } from '@/lib/api';
import { validatePassword, generateSecurePassword, getStrengthColor, getStrengthLabel } from '@/lib/password-validator';
import Swal from 'sweetalert2';

interface Teacher {
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
  qualification?: string;
  specialization?: string;
  experienceYears?: number;
  department?: string;
  designation?: string;
  subjects?: string[];
  joiningDate?: string;
  salary?: number;
  emergencyContact?: string;
  status: string;
  role: string;
  schoolId: number;
}

export default function TeacherEditPage() {
  const params = useParams();
  const router = useRouter();
  const teacherId = params.id as string;
  
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    postalCode: '',
    qualification: '',
    specialization: '',
    experienceYears: '',
    department: '',
    designation: '',
    subjects: [] as string[],
    classId: '', // Add class assignment field
    joiningDate: '',
    salary: '',
    emergencyContact: '',
    employeeId: '',
    status: 'active'
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [classes, setClasses] = useState<any[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [selectedClasses, setSelectedClasses] = useState<number[]>([]);
  
  // Password Reset States
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<any>(null);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  const departments = [
    'Mathematics', 'Science', 'English', 'Hindi', 'Social Studies', 
    'Computer Science', 'Physical Education', 'Art', 'Music', 'Administration'
  ];

  const designations = [
    'Teacher', 'Senior Teacher', 'Head Teacher', 'Vice Principal', 'Principal',
    'Subject Coordinator', 'Class Teacher', 'Librarian', 'Counselor'
  ];

  useEffect(() => {
    if (teacherId) {
      fetchTeacher();
      fetchClasses();
      fetchTeacherClasses();
      fetchSubjects();
    }
  }, [teacherId]);

  // Fetch subjects from API
  const fetchSubjects = async () => {
    try {
      setLoadingSubjects(true);
      const token = getStoredToken();
      
      if (!token) {
        console.error('No authentication token found');
        setLoadingSubjects(false);
        return;
      }

      console.log('Making API call to /subjects...');
      
      const directResponse = await fetch('http://localhost:3001/subjects', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Subjects fetch response status:', directResponse.status);
      
      if (!directResponse.ok) {
        throw new Error(`HTTP error! status: ${directResponse.status}`);
      }
      
      const response = await directResponse.json();
      console.log('Subjects API Response:', response);
      
      if (Array.isArray(response)) {
        // Extract subject names from the response
        const subjectNames = response
          .filter(subject => subject.status === 'active')
          .map(subject => subject.name);
        console.log('Active subjects:', subjectNames);
        setAvailableSubjects(subjectNames);
      } else {
        console.error('Invalid response format:', response);
        setAvailableSubjects([]);
      }
    } catch (error: any) {
      console.error('Error fetching subjects:', error);
      console.error('Error details:', error.message);
      // Fallback to default subjects if API fails
      setAvailableSubjects([
        'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi', 
        'History', 'Geography', 'Civics', 'Economics', 'Computer Science', 
        'Physical Education', 'Art', 'Music', 'Sanskrit'
      ]);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const fetchClasses = async () => {
    try {
      setLoadingClasses(true);
      const token = getStoredToken();
      
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch('http://localhost:3001/classes', {
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

  const fetchTeacherClasses = async () => {
    try {
      const token = getStoredToken();
      
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch(`http://localhost:3001/teachers/${teacherId}/classes`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch teacher classes');
        return;
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        const classIds = data.map((cls: any) => cls.id);
        setSelectedClasses(classIds);
        console.log('Loaded teacher classes:', classIds);
      }
    } catch (error: any) {
      console.error('Error fetching teacher classes:', error);
    }
  };

  const fetchTeacher = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = getStoredToken();
      if (!token) {
        throw new Error('Authentication required. Please login again.');
      }

      const response = await apiGet<Teacher>(`/teachers/${teacherId}`, { token });
      setTeacher(response);
      
      // Populate form with existing data
      setFormData({
        firstName: response.firstName || '',
        lastName: response.lastName || '',
        email: response.email || '',
        mobile: response.mobile || '',
        dateOfBirth: response.dateOfBirth ? response.dateOfBirth.split('T')[0] : '',
        address: response.address || '',
        city: response.city || '',
        state: response.state || '',
        country: response.country || 'India',
        postalCode: response.postalCode || '',
        qualification: response.qualification || '',
        specialization: response.specialization || '',
        experienceYears: response.experienceYears?.toString() || '',
        department: response.department || '',
        designation: response.designation || '',
        subjects: response.subjects || [],
        classId: (response as any).classId ? (response as any).classId.toString() : '',
        joiningDate: response.joiningDate ? response.joiningDate.split('T')[0] : '',
        salary: response.salary?.toString() || '',
        emergencyContact: response.emergencyContact || '',
        employeeId: (response as any).employeeId || '',
        status: response.status || 'active'
      });
      
      console.log('Teacher fetched:', response);
    } catch (error: any) {
      console.error('Error fetching teacher:', error);
      setError(error?.message || 'Failed to fetch teacher details');
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

  const handleSubjectChange = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleClassChange = (classId: number) => {
    setSelectedClasses(prev => 
      prev.includes(classId)
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
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
        <p>Are you sure you want to reset the password for <strong>${teacher?.firstName} ${teacher?.lastName}</strong>?</p>
        <div class="alert alert-warning mt-3">
          <i class="fas fa-exclamation-triangle me-2"></i>
          The teacher will need to use the new password to login.
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
      const response = await fetch(`http://localhost:3001/teachers/${teacherId}/reset-password`, {
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
          <p>Password has been successfully reset for ${teacher?.firstName} ${teacher?.lastName}</p>
          <div class="alert alert-info mt-3">
            <strong>New Password:</strong> <code>${newPassword}</code>
            <button class="btn btn-sm btn-outline-primary ms-2" onclick="navigator.clipboard.writeText('${newPassword}')">
              <i class="fas fa-copy"></i> Copy
            </button>
          </div>
          <p class="text-muted small">Make sure to share this password with the teacher securely.</p>
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
      const teacherData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        mobile: formData.mobile || null,
        dateOfBirth: formData.dateOfBirth || null,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        country: formData.country,
        postalCode: formData.postalCode || null,
        qualification: formData.qualification || null,
        specialization: formData.specialization || null,
        experienceYears: formData.experienceYears || null,
        department: formData.department || null,
        designation: formData.designation || null,
        subjects: formData.subjects,
        classIds: selectedClasses.length > 0 ? selectedClasses : [],
        joiningDate: formData.joiningDate || null,
        salary: formData.salary ? parseFloat(formData.salary) : null,
        emergencyContact: formData.emergencyContact || null,
        status: formData.status,
      };

      console.log('Updating teacher:', teacherData);
      
      // Call API using helper function
      const response = await apiPut(`/teachers/${teacherId}`, teacherData, { token });
      
      console.log('Teacher updated successfully:', response);
      setSuccess('Teacher updated successfully!');
      
      // Redirect to teachers list page to refresh the data
      setTimeout(() => {
        router.push('/school-admin/teachers');
      }, 1500);
      
    } catch (error: any) {
      console.error('Error updating teacher:', error);
      const errorMessage = error?.message || 'Error updating teacher. Please try again.';
      setError(errorMessage);
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
          <p className="mt-3 text-muted">Loading teacher details...</p>
        </div>
      </div>
    );
  }

  if (error && !teacher) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="alert alert-danger" role="alert">
            <h5 className="alert-heading">Error Loading Teacher</h5>
            <p>{error}</p>
            <hr />
            <div className="d-flex gap-2 justify-content-center">
              <button 
                className="btn btn-outline-danger"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
              <Link href="/school-admin/teachers" className="btn btn-secondary">
                Back to Teachers
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
              <Link href={`/school-admin/teachers/${teacherId}`} className="btn btn-outline-secondary">
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="h3 mb-0 fw-bold text-dark">
                  <i className="fas fa-user-edit me-2 text-primary"></i>
                  Edit Teacher
                </h1>
                <p className="text-muted mb-0">Update teacher information and profile</p>
              </div>
            </div>
            <div>
              <Link 
                href={`/school-admin/teachers/${teacherId}`} 
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
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Date of Birth</label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          className="form-control form-control-lg"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Status</label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className="form-select form-select-lg"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="resigned">Resigned</option>
                          <option value="retired">Retired</option>
                          <option value="suspended">Suspended</option>
                        </select>
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
                            <strong>Security Notice:</strong> Reset the teacher's password if they forgot it or for security reasons.
                            Make sure to share the new password securely.
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

                  {/* Professional Information */}
                  <div className="mb-5">
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <div className="bg-success bg-opacity-10 p-3 rounded-circle">
                        <Briefcase size={24} className="text-success" />
                      </div>
                      <h3 className="mb-0 fw-bold text-dark">Professional Information</h3>
                    </div>
                    <div className="row g-4">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Department</label>
                        <select
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          className="form-select form-select-lg"
                        >
                          <option value="">Select Department</option>
                          {departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Designation</label>
                        <select
                          name="designation"
                          value={formData.designation}
                          onChange={handleInputChange}
                          className="form-select form-select-lg"
                        >
                          <option value="">Select Designation</option>
                          {designations.map(desig => (
                            <option key={desig} value={desig}>{desig}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Qualification</label>
                        <input
                          type="text"
                          name="qualification"
                          value={formData.qualification}
                          onChange={handleInputChange}
                          className="form-control form-control-lg"
                          placeholder="e.g., M.Sc, B.Ed, Ph.D"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Specialization</label>
                        <input
                          type="text"
                          name="specialization"
                          value={formData.specialization}
                          onChange={handleInputChange}
                          className="form-control form-control-lg"
                          placeholder="e.g., Mathematics, Physics"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Experience (Years)</label>
                        <input
                          type="number"
                          name="experienceYears"
                          value={formData.experienceYears}
                          onChange={handleInputChange}
                          className="form-control form-control-lg"
                          placeholder="Enter years of experience"
                          min="0"
                          max="50"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Joining Date</label>
                        <input
                          type="date"
                          name="joiningDate"
                          value={formData.joiningDate}
                          onChange={handleInputChange}
                          className="form-control form-control-lg"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Salary</label>
                        <input
                          type="number"
                          name="salary"
                          value={formData.salary}
                          onChange={handleInputChange}
                          className="form-control form-control-lg"
                          placeholder="Enter salary amount"
                          min="0"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Employee ID</label>
                        <input
                          type="text"
                          name="employeeId"
                          value={formData.employeeId || ''}
                          onChange={handleInputChange}
                          className="form-control form-control-lg"
                          placeholder="Enter employee ID"
                          readOnly
                        />
                        <small className="text-muted">Employee ID cannot be changed</small>
                      </div>
                    </div>
                  </div>

                  {/* Subjects */}
                  <div className="mb-5">
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <div className="bg-warning bg-opacity-10 p-3 rounded-circle">
                        <GraduationCap size={24} className="text-warning" />
                      </div>
                      <h3 className="mb-0 fw-bold text-dark">Subjects</h3>
                    </div>
                    <div className="row g-4">
                      <div className="col-12">
                        <label className="form-label fw-semibold">
                          Select Subjects
                          {loadingSubjects && (
                            <span className="spinner-border spinner-border-sm ms-2" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </span>
                          )}
                        </label>
                        {loadingSubjects ? (
                          <div className="border rounded p-4 text-center">
                            <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading subjects...</span>
                            </div>
                            <p className="mt-2 mb-0 text-muted">Loading subjects...</p>
                          </div>
                        ) : availableSubjects.length === 0 ? (
                          <div className="alert alert-info">
                            <i className="fas fa-info-circle me-2"></i>
                            No subjects available. Please create subjects first from the{' '}
                            <Link href="/school-admin/subjects" className="text-primary fw-bold">
                              Subjects
                            </Link>{' '}
                            page.
                          </div>
                        ) : (
                          <div className="border rounded p-4">
                            <div className="row g-3">
                              {availableSubjects.map((subject) => (
                                <div key={subject} className="col-md-4 col-sm-6">
                                  <div className="form-check">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      id={`subject-${subject}`}
                                      checked={formData.subjects.includes(subject)}
                                      onChange={() => handleSubjectChange(subject)}
                                    />
                                    <label className="form-check-label" htmlFor={`subject-${subject}`}>
                                      {subject}
                                    </label>
                                  </div>
                                </div>
                              ))}
                            </div>
                            {formData.subjects.length > 0 && (
                              <div className="mt-3 p-2 bg-success bg-opacity-10 rounded">
                                <small className="text-success">
                                  <i className="fas fa-check-circle me-1"></i>
                                  {formData.subjects.length} subject(s) selected
                                </small>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Class Assignment */}
                  <div className="mb-5">
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <div className="bg-info bg-opacity-10 p-3 rounded-circle">
                        <Calendar size={24} className="text-info" />
                      </div>
                      <h3 className="mb-0 fw-bold text-dark">Class Assignment</h3>
                    </div>
                    <div className="row g-4">
                      <div className="col-12">
                        <label className="form-label fw-semibold">
                          Assign to Classes (Multiple Selection)
                          {loadingClasses && (
                            <span className="spinner-border spinner-border-sm ms-2" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </span>
                          )}
                        </label>
                        <div className="border rounded p-4">
                          {loadingClasses ? (
                            <div className="text-center py-3">
                              <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading classes...</span>
                              </div>
                            </div>
                          ) : classes.length === 0 ? (
                            <div className="alert alert-info mb-0">
                              <i className="fas fa-info-circle me-2"></i>
                              No classes available. Please create classes first from the{' '}
                              <Link href="/school-admin/create-class" className="text-primary">
                                Create Class
                              </Link>{' '}
                              page.
                            </div>
                          ) : (
                            <div className="row g-3">
                              {classes.map((cls) => (
                                <div key={cls.id} className="col-md-4 col-sm-6">
                                  <div className="form-check">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      id={`class-${cls.id}`}
                                      checked={selectedClasses.includes(cls.id)}
                                      onChange={() => handleClassChange(cls.id)}
                                    />
                                    <label className="form-check-label" htmlFor={`class-${cls.id}`}>
                                      {cls.name}
                                    </label>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        {selectedClasses.length > 0 && (
                          <small className="text-success d-block mt-2">
                            <i className="fas fa-check-circle me-1"></i>
                            {selectedClasses.length} class(es) selected
                          </small>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="d-flex gap-3 justify-content-end pt-4 border-top">
                    <Link href={`/school-admin/teachers/${teacherId}`} className="btn btn-secondary btn-lg px-5">
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
                          Update Teacher
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
