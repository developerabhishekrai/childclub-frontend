'use client';

import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, BookOpen, GraduationCap, Briefcase, ArrowLeft, RefreshCw, Eye, EyeOff, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { teachersApi } from '@/lib/api-endpoints';
import { ApiError, getStoredUser, getStoredToken, apiGet } from '@/lib/api';
import { validatePassword, generateSecurePassword, getStrengthColor, getStrengthLabel } from '@/lib/password-validator';

interface Class {
  id: number;
  name: string;
  grade: string;
  section: string;
  academicYear: string;
  maxStudents: number;
  currentStudents?: number;
  status: string;
}

export default function AddTeacherPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    password: '',
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
    classIds: [] as number[],
    joiningDate: '',
    salary: '',
    emergencyContact: '',
  });

  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<any>(null);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

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

  // Fetch classes from API
  const fetchClasses = async () => {
    try {
      setLoadingClasses(true);
      const token = getStoredToken();
      
      console.log('=== Fetch Classes Debug ===');
      console.log('Token available:', !!token);
      
      if (!token) {
        console.error('No authentication token found');
        setLoadingClasses(false);
        return;
      }

      console.log('Making API call to /classes...');
      
      // Try direct fetch as alternative
      const directResponse = await fetch('http://localhost:3001/classes', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Direct fetch response status:', directResponse.status);
      console.log('Direct fetch response ok:', directResponse.ok);
      
      if (!directResponse.ok) {
        throw new Error(`HTTP error! status: ${directResponse.status}`);
      }
      
      const response = await directResponse.json();
      console.log('Classes API Response:', response);
      console.log('Response type:', typeof response);
      console.log('Is array:', Array.isArray(response));
      
      if (Array.isArray(response)) {
        console.log('Total classes received:', response.length);
        // Filter only active classes
        const activeClasses = response.filter(cls => cls.status === 'ACTIVE' || cls.status === 'active');
        console.log('Active classes after filtering:', activeClasses.length);
        console.log('Active classes data:', activeClasses);
        setClasses(activeClasses);
      } else {
        console.error('Invalid response format:', response);
        setClasses([]);
      }
    } catch (error: any) {
      console.error('Error fetching classes:', error);
      console.error('Error details:', error.message);
      setClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  };

  // Check authentication on mount
  useEffect(() => {
    console.log('=== Page Load Debug ===');
    
    // Direct localStorage check
    const tokenRaw = localStorage.getItem('token');
    const userRaw = localStorage.getItem('user');
    
    console.log('Raw token from localStorage:', tokenRaw ? 'Present' : 'Missing');
    console.log('Raw user from localStorage:', userRaw);
    
    // Try to parse user
    let user = null;
    if (userRaw) {
      try {
        user = JSON.parse(userRaw);
        console.log('Parsed user successfully:', user);
      } catch (e) {
        console.error('Failed to parse user:', e);
      }
    }
    
    // Also try getStoredUser function
    const userFromFunction = getStoredUser();
    const token = getStoredToken();
    
    console.log('Token from getStoredToken():', !!token);
    console.log('User from getStoredUser():', userFromFunction);
    console.log('School ID:', userFromFunction?.schoolId || user?.schoolId);
    
    setDebugInfo({
      hasToken: !!token || !!tokenRaw,
      hasUser: !!userFromFunction || !!user,
      hasSchoolId: !!(userFromFunction?.schoolId || user?.schoolId),
      schoolId: userFromFunction?.schoolId || user?.schoolId,
      userRole: userFromFunction?.role || user?.role,
      userEmail: userFromFunction?.email || user?.email,
    });
    
    if (!token && !tokenRaw) {
      alert('You are not logged in. Redirecting to login...');
      router.push('/school-admin/login');
    } else {
      // Fetch classes and subjects when authenticated
      fetchClasses();
      fetchSubjects();
    }
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Check password strength when password changes
    if (name === 'password') {
      const strength = validatePassword(value);
      setPasswordStrength(strength);
    }
  };

  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword(12);
    setFormData(prev => ({ ...prev, password: newPassword }));
    const strength = validatePassword(newPassword);
    setPasswordStrength(strength);
    setShowPassword(true);
    
    // Clear password error if any
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: '' }));
    }
  };

  const handleCopyPassword = async () => {
    if (formData.password) {
      try {
        await navigator.clipboard.writeText(formData.password);
        setPasswordCopied(true);
        setTimeout(() => setPasswordCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy password:', err);
      }
    }
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
    setFormData(prev => ({
      ...prev,
      classIds: prev.classIds.includes(classId)
        ? prev.classIds.filter(id => id !== classId)
        : [...prev.classIds, classId]
    }));
  };

  const validateForm = () => {
    const newErrors: any = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    // Validate password with special character requirement
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors.join(', ');
      }
    }
    
    if (formData.mobile && !/^\d{10}$/.test(formData.mobile)) newErrors.mobile = 'Mobile number must be 10 digits';

    if (!formData.qualification.trim()) newErrors.qualification = 'Qualification is required';
    if (!formData.experienceYears.trim()) newErrors.experienceYears = 'Experience is required';
    if (formData.subjects.length === 0) newErrors.subjects = 'At least one subject is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setSuccessMessage('');
    
    try {
      // Get logged-in user's school ID - Try both methods
      let user = getStoredUser();
      
      // Fallback: Direct localStorage read
      if (!user) {
        const userRaw = localStorage.getItem('user');
        if (userRaw) {
          try {
            user = JSON.parse(userRaw);
            console.log('✅ Got user from direct localStorage read');
          } catch (e) {
            console.error('Failed to parse user from localStorage:', e);
          }
        }
      }
      
      console.log('=== Add Teacher Debug ===');
      console.log('Logged in user:', user);
      console.log('School ID:', user?.schoolId);
      console.log('All localStorage keys:', Object.keys(localStorage));
      
      if (!user) {
        throw new Error('User not logged in. Please login again and make sure cookies are enabled.');
      }
      
      if (!user.schoolId) {
        throw new Error('School ID not found in your profile. Backend response may be missing schoolId. Check console logs during login.');
      }

      // Prepare teacher data
      const teacherData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password,
        dateOfBirth: formData.dateOfBirth || undefined,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        postalCode: formData.postalCode,
        schoolId: Number(user.schoolId),
        qualification: formData.qualification,
        specialization: formData.specialization || undefined,
        experienceYears: formData.experienceYears ? parseInt(formData.experienceYears) : 0,
        department: formData.department || undefined,
        designation: formData.designation || undefined,
        subjects: formData.subjects,
        classIds: formData.classIds.length > 0 ? formData.classIds : undefined,
        joiningDate: formData.joiningDate ? new Date(formData.joiningDate) : undefined,
        salary: formData.salary ? parseFloat(formData.salary) : undefined,
        emergencyContact: formData.emergencyContact || undefined,
      };

      console.log('Creating teacher with data:', teacherData);
      
      // Call API
      const result = await teachersApi.create(teacherData);
      
      console.log('✅ Teacher created successfully:', result);
      setSuccessMessage('✅ Teacher added successfully! Redirecting...');
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        mobile: '',
        password: '',
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
        subjects: [],
        classIds: [],
        joiningDate: '',
        salary: '',
        emergencyContact: '',
      });
      setErrors({});
      
      // Redirect to teachers list after 2 seconds
      setTimeout(() => {
        router.push('/school-admin/teachers');
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error adding teacher:', error);
      
      // Show detailed error in UI
      let errorMessage = 'Error adding teacher. Please try again.';
      
      if (error instanceof ApiError) {
        errorMessage = `Error: ${error.message}`;
        console.error('API Error Status:', error.status);
        console.error('API Error Data:', error.data);
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Set error in form instead of alert
      setErrors({ submit: errorMessage });
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <div className="bg-white shadow-sm border-bottom">
        <div className="container-fluid py-3">
          <div className="d-flex align-items-center gap-3">
            <Link href="/school-admin/dashboard" className="btn btn-outline-secondary">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="h3 mb-0 fw-bold text-dark">
                <i className="fas fa-chalkboard-teacher me-2 text-success"></i>
                Add New Teacher
              </h1>
              <p className="text-muted mb-0">Hire a new faculty member</p>
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
                {/* Debug Info (Remove after testing) */}
                {debugInfo && !debugInfo.hasSchoolId && (
                  <div className="alert alert-warning mb-4">
                    <h6 className="alert-heading">⚠️ Debug Information</h6>
                    <ul className="mb-0 small">
                      <li>Token: {debugInfo.hasToken ? '✅ Present' : '❌ Missing'}</li>
                      <li>User Data: {debugInfo.hasUser ? '✅ Present' : '❌ Missing'}</li>
                      <li>School ID: {debugInfo.hasSchoolId ? `✅ ${debugInfo.schoolId}` : '❌ Missing'}</li>
                      <li>Role: {debugInfo.userRole || 'N/A'}</li>
                      <li>Email: {debugInfo.userEmail || 'N/A'}</li>
                    </ul>
                    <hr />
                    <p className="mb-0 small"><strong>Issue:</strong> School ID is missing. Please login again as School Admin.</p>
                  </div>
                )}
                
                {successMessage && (
                  <div className="alert alert-success alert-dismissible fade show mb-4" role="alert">
                    {successMessage}
                    <button type="button" className="btn-close" onClick={() => setSuccessMessage('')}></button>
                  </div>
                )}
                
                {errors.submit && (
                  <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
                    {errors.submit}
                    <button type="button" className="btn-close" onClick={() => setErrors({ ...errors, submit: '' })}></button>
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  {/* Personal Information */}
                  <div className="mb-5">
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <div className="bg-success bg-opacity-10 p-3 rounded-circle">
                        <User size={24} className="text-success" />
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
                          className={`form-control form-control-lg ${errors.firstName ? 'is-invalid' : ''}`}
                          placeholder="Enter first name"
                        />
                        {errors.firstName && (
                          <div className="invalid-feedback">{errors.firstName}</div>
                        )}
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
                          className={`form-control form-control-lg ${errors.lastName ? 'is-invalid' : ''}`}
                          placeholder="Enter last name"
                        />
                        {errors.lastName && (
                          <div className="invalid-feedback">{errors.lastName}</div>
                        )}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          Email Address <span className="text-danger">*</span>
                        </label>
                        <div className="input-group input-group-lg">
                          <span className="input-group-text bg-light border-end-0">
                            <Mail size={18} className="text-muted" />
                          </span>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`form-control border-start-0 ${errors.email ? 'is-invalid' : ''}`}
                            placeholder="Enter email address"
                          />
                          {errors.email && (
                            <div className="invalid-feedback">{errors.email}</div>
                          )}
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Mobile Number</label>
                        <div className="input-group input-group-lg">
                          <span className="input-group-text bg-light border-end-0">
                            <Phone size={18} className="text-muted" />
                          </span>
                          <input
                            type="tel"
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleInputChange}
                            className={`form-control border-start-0 ${errors.mobile ? 'is-invalid' : ''}`}
                            placeholder="Enter mobile number"
                          />
                          {errors.mobile && (
                            <div className="invalid-feedback">{errors.mobile}</div>
                          )}
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Date of Birth</label>
                        <div className="input-group input-group-lg">
                          <span className="input-group-text bg-light border-end-0">
                            <Calendar size={18} className="text-muted" />
                          </span>
                          <input
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleInputChange}
                            className="form-control border-start-0"
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          Password <span className="text-danger">*</span>
                        </label>
                        <div className="input-group input-group-lg">
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                            placeholder="Enter or generate password"
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
                            <RefreshCw size={18} />
                          </button>
                          {formData.password && (
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
                        {passwordStrength && formData.password && (
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
                        
                        {errors.password && (
                          <div className="text-danger small mt-2">{errors.password}</div>
                        )}
                        
                        <small className="text-muted d-block mt-2">
                          <i className="fas fa-info-circle me-1"></i>
                          Password must contain: uppercase, lowercase, number, and special character
                        </small>
                      </div>
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div className="mb-5">
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <div className="bg-primary bg-opacity-10 p-3 rounded-circle">
                        <GraduationCap size={24} className="text-primary" />
                      </div>
                      <h3 className="mb-0 fw-bold text-dark">Professional Information</h3>
                    </div>
                    <div className="row g-4">

                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          Qualification <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          name="qualification"
                          value={formData.qualification}
                          onChange={handleInputChange}
                          className={`form-control form-control-lg ${errors.qualification ? 'is-invalid' : ''}`}
                          placeholder="e.g., M.Sc., B.Ed."
                        />
                        {errors.qualification && (
                          <div className="invalid-feedback">{errors.qualification}</div>
                        )}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          Experience (Years) <span className="text-danger">*</span>
                        </label>
                        <input
                          type="number"
                          name="experienceYears"
                          value={formData.experienceYears}
                          onChange={handleInputChange}
                          className={`form-control form-control-lg ${errors.experienceYears ? 'is-invalid' : ''}`}
                          placeholder="e.g., 5"
                          min="0"
                        />
                        {errors.experienceYears && (
                          <div className="invalid-feedback">{errors.experienceYears}</div>
                        )}
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
                        <label className="form-label fw-semibold">Department</label>
                        <input
                          type="text"
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          className="form-control form-control-lg"
                          placeholder="e.g., Science, Arts"
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Designation</label>
                        <input
                          type="text"
                          name="designation"
                          value={formData.designation}
                          onChange={handleInputChange}
                          className="form-control form-control-lg"
                          placeholder="e.g., Senior Teacher, HOD"
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
                          placeholder="Emergency contact number"
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Joining Date</label>
                        <div className="input-group input-group-lg">
                          <span className="input-group-text bg-light border-end-0">
                            <Calendar size={18} className="text-muted" />
                          </span>
                          <input
                            type="date"
                            name="joiningDate"
                            value={formData.joiningDate}
                            onChange={handleInputChange}
                            className="form-control border-start-0"
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Salary (Monthly)</label>
                        <div className="input-group input-group-lg">
                          <span className="input-group-text bg-light border-end-0">₹</span>
                          <input
                            type="number"
                            name="salary"
                            value={formData.salary}
                            onChange={handleInputChange}
                            className="form-control border-start-0"
                            placeholder="Enter salary amount"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Subjects & Classes */}
                  <div className="mb-5">
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <div className="bg-warning bg-opacity-10 p-3 rounded-circle">
                        <BookOpen size={24} className="text-warning" />
                      </div>
                      <h3 className="mb-0 fw-bold text-dark">Subjects & Classes</h3>
                    </div>
                    <div className="row g-4">
                      <div className="col-12">
                        <label className="form-label fw-semibold">
                          Subjects <span className="text-danger">*</span>
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
                        {errors.subjects && (
                          <div className="text-danger small mt-2">{errors.subjects}</div>
                        )}
                      </div>

                      <div className="col-12">
                        <label className="form-label fw-semibold">
                          Assign to Classes (Optional - Multiple Selection)
                          {loadingClasses && (
                            <span className="spinner-border spinner-border-sm ms-2" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </span>
                          )}
                        </label>
                        {loadingClasses ? (
                          <div className="border rounded p-4 text-center">
                            <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading classes...</span>
                            </div>
                            <p className="mt-2 mb-0 text-muted">Loading classes...</p>
                          </div>
                        ) : classes.length === 0 ? (
                          <div className="alert alert-info">
                            <i className="fas fa-info-circle me-2"></i>
                            No classes available. Please create a class first from the{' '}
                            <Link href="/school-admin/create-class" className="text-primary fw-bold">
                              Create Class
                            </Link>{' '}
                            page.
                          </div>
                        ) : (
                          <div className="border rounded p-4 bg-light">
                            <div className="row g-3">
                              {classes.map((cls) => (
                                <div key={cls.id} className="col-md-4 col-sm-6">
                                  <div className="form-check">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      id={`class-${cls.id}`}
                                      checked={formData.classIds.includes(cls.id)}
                                      onChange={() => handleClassChange(cls.id)}
                                    />
                                    <label className="form-check-label" htmlFor={`class-${cls.id}`}>
                                      <strong>{cls.name}</strong>
                                      {cls.grade && <span className="text-muted ms-1">({cls.grade})</span>}
                                    </label>
                                  </div>
                                </div>
                              ))}
                            </div>
                            {formData.classIds.length > 0 && (
                              <div className="mt-3 p-2 bg-success bg-opacity-10 rounded">
                                <small className="text-success">
                                  <i className="fas fa-check-circle me-1"></i>
                                  {formData.classIds.length} class(es) selected
                                </small>
                              </div>
                            )}
                          </div>
                        )}
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
                        <div className="input-group input-group-lg">
                          <span className="input-group-text bg-light border-end-0">
                            <MapPin size={18} className="text-muted" />
                          </span>
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="form-control border-start-0"
                            placeholder="Enter full address"
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
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

                      <div className="col-md-6">
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

                      <div className="col-md-6">
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

                  {/* Actions */}
                  <div className="d-flex gap-3 justify-content-end pt-4 border-top">
                    <Link href="/school-admin/dashboard" className="btn btn-secondary btn-lg px-5">
                      <i className="fas fa-times me-2"></i>
                      Cancel
                    </Link>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn btn-success btn-lg px-5"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Adding Teacher...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-plus me-2"></i>
                          Add Teacher
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
