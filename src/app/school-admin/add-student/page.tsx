'use client';

import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, BookOpen, ArrowLeft, Sparkles, RefreshCw, Eye, EyeOff, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { showSuccess, showError, showLoading, closeLoading } from '@/lib/sweetalert';
import { validatePassword, generateSecurePassword, getStrengthColor, getStrengthLabel } from '@/lib/password-validator';

interface Class {
  id: number;
  name: string;
  grade: string;
  section: string;
  description?: string;
}

export default function AddStudentPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    password: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: 'Uttar Pradesh', // Set default state
    country: 'India',
    postalCode: '',
    classId: '', // Will be set dynamically
    schoolId: '', // Will be fetched from localStorage
    enrollNumber: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    emergencyContact: '',
    previousSchool: '',
    gender: 'other',
  });

  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<any>(null);

  // Fetch classes dynamically from backend
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Get schoolId from user object in localStorage
        const userRaw = localStorage.getItem('user');
        const user = userRaw ? JSON.parse(userRaw) : null;
        const schoolId = user?.schoolId;
        
        console.log('🔍 Debug Info:', { userRaw, user, schoolId });
        
        // Update schoolId in formData
        if (schoolId) {
          setFormData(prev => ({ ...prev, schoolId: String(schoolId) }));
        }

        const response = await fetch('http://localhost:3001/classes', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setClasses(data);
          console.log('Fetched classes:', data);
        } else {
          console.error('Failed to fetch classes');
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClasses();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
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
    if (!formData.enrollNumber.trim()) newErrors.enrollNumber = 'Enrollment number is required';
    if (!formData.classId) newErrors.classId = 'Please select a class';
    if (!formData.state || formData.state === 'Choose...') newErrors.state = 'Please select a valid state';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }

      console.log('=== Add Student Debug ===');
      console.log('Form Data:', formData);
      console.log('Token available:', !!token);
      
      // Get schoolId from user object if not in formData
      let currentSchoolId = formData.schoolId;
      if (!currentSchoolId) {
        const userRaw = localStorage.getItem('user');
        const user = userRaw ? JSON.parse(userRaw) : null;
        currentSchoolId = user?.schoolId;
        console.log('⚠️ SchoolId not in formData, fetched from localStorage:', currentSchoolId);
      }
      
      if (!currentSchoolId) {
        throw new Error('School ID not found. Please login again.');
      }

      // Show loading
      showLoading('Adding Student', 'Please wait while we add the student...');

      // Prepare student data with proper type conversion
      const studentData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        mobile: formData.mobile || null,
        password: formData.password,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : null,
        gender: formData.gender || 'other',
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        country: formData.country,
        postalCode: formData.postalCode || null,
        classId: formData.classId ? parseInt(formData.classId) : null, // Convert to number
        schoolId: parseInt(String(currentSchoolId)), // ✅ Ensure it's a valid number
        enrollNumber: formData.enrollNumber || null,
        parentName: formData.parentName || null,
        parentPhone: formData.parentPhone || null,
        parentEmail: formData.parentEmail || null,
        emergencyContact: formData.emergencyContact || null,
        previousSchool: formData.previousSchool || null,
      };

      console.log('Student Data (formatted):', studentData);
      console.log('✅ SchoolId type:', typeof studentData.schoolId, 'Value:', studentData.schoolId);

      // Make API call to create student
      const response = await fetch('http://localhost:3001/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(studentData),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        closeLoading();
        
        // Parse error message for better user feedback
        let errorMessage = 'An error occurred while adding the student. Please try again.';
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.message) {
            errorMessage = errorJson.message;
            
            // Highlight the enrollment number field if it's a duplicate
            if (errorMessage.includes('Enrollment number already exists')) {
              setErrors({ enrollNumber: 'This enrollment number already exists in the selected class' });
            }
          }
        } catch (e) {
          // If parsing fails, use the raw text
          errorMessage = errorText;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Student created successfully:', result);
      
      // Close loading
      closeLoading();
      
      // Show success
      await showSuccess(
        'Student Added Successfully! 🎉',
        `Student "${formData.firstName} ${formData.lastName}" has been added successfully to the school.`
      );
      
      // Reset form but keep schoolId
      const schoolId = formData.schoolId;
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        mobile: '',
        password: '',
        dateOfBirth: '',
        address: '',
        city: '',
        state: 'Uttar Pradesh', // Keep default state
        country: 'India',
        postalCode: '',
        classId: '', // Reset class selection
        schoolId: schoolId, // Keep school ID
        enrollNumber: '',
        parentName: '',
        parentPhone: '',
        parentEmail: '',
        emergencyContact: '',
        previousSchool: '',
        gender: 'other',
      });
      setErrors({});
      setPasswordStrength(null);
    } catch (error: any) {
      console.error('Error adding student:', error);
      closeLoading();
      await showError(
        'Failed to Add Student',
        error.message || 'An error occurred while adding the student. Please try again.'
      );
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
                <i className="fas fa-user-plus me-2 text-primary"></i>
                Add New Student
              </h1>
              <p className="text-muted mb-0">Enroll a new student in the school</p>
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

                      <div className="col-md-12">
                        <label className="form-label fw-semibold">Previous School</label>
                        <input
                          type="text"
                          name="previousSchool"
                          value={formData.previousSchool}
                          onChange={handleInputChange}
                          className="form-control form-control-lg"
                          placeholder="Enter previous school name (if any)"
                        />
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
                        <label className="form-label fw-semibold">
                          State <span className="text-danger">*</span>
                        </label>
                        <select
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className={`form-select form-select-lg ${errors.state ? 'is-invalid' : ''}`}
                        >
                          <option value="">Choose State</option>
                          <option value="Andhra Pradesh">Andhra Pradesh</option>
                          <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                          <option value="Assam">Assam</option>
                          <option value="Bihar">Bihar</option>
                          <option value="Chhattisgarh">Chhattisgarh</option>
                          <option value="Goa">Goa</option>
                          <option value="Gujarat">Gujarat</option>
                          <option value="Haryana">Haryana</option>
                          <option value="Himachal Pradesh">Himachal Pradesh</option>
                          <option value="Jharkhand">Jharkhand</option>
                          <option value="Karnataka">Karnataka</option>
                          <option value="Kerala">Kerala</option>
                          <option value="Madhya Pradesh">Madhya Pradesh</option>
                          <option value="Maharashtra">Maharashtra</option>
                          <option value="Manipur">Manipur</option>
                          <option value="Meghalaya">Meghalaya</option>
                          <option value="Mizoram">Mizoram</option>
                          <option value="Nagaland">Nagaland</option>
                          <option value="Odisha">Odisha</option>
                          <option value="Punjab">Punjab</option>
                          <option value="Rajasthan">Rajasthan</option>
                          <option value="Sikkim">Sikkim</option>
                          <option value="Tamil Nadu">Tamil Nadu</option>
                          <option value="Telangana">Telangana</option>
                          <option value="Tripura">Tripura</option>
                          <option value="Uttar Pradesh">Uttar Pradesh</option>
                          <option value="Uttarakhand">Uttarakhand</option>
                          <option value="West Bengal">West Bengal</option>
                          <option value="Delhi">Delhi</option>
                          <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                          <option value="Ladakh">Ladakh</option>
                          <option value="Chandigarh">Chandigarh</option>
                          <option value="Daman and Diu">Daman and Diu</option>
                          <option value="Dadra and Nagar Haveli">Dadra and Nagar Haveli</option>
                          <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                          <option value="Lakshadweep">Lakshadweep</option>
                          <option value="Puducherry">Puducherry</option>
                        </select>
                        {errors.state && (
                          <div className="invalid-feedback">{errors.state}</div>
                        )}
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

                  {/* Parent/Guardian Information */}
                  <div className="mb-5">
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <div className="bg-success bg-opacity-10 p-3 rounded-circle">
                        <User size={24} className="text-success" />
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
                        <div className="input-group input-group-lg">
                          <span className="input-group-text bg-light border-end-0">
                            <Phone size={18} className="text-muted" />
                          </span>
                          <input
                            type="tel"
                            name="parentPhone"
                            value={formData.parentPhone}
                            onChange={handleInputChange}
                            className="form-control border-start-0"
                            placeholder="Enter parent phone number"
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Parent Email</label>
                        <div className="input-group input-group-lg">
                          <span className="input-group-text bg-light border-end-0">
                            <Mail size={18} className="text-muted" />
                          </span>
                          <input
                            type="email"
                            name="parentEmail"
                            value={formData.parentEmail}
                            onChange={handleInputChange}
                            className="form-control border-start-0"
                            placeholder="Enter parent email address"
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Emergency Contact</label>
                        <div className="input-group input-group-lg">
                          <span className="input-group-text bg-light border-end-0">
                            <Phone size={18} className="text-muted" />
                          </span>
                          <input
                            type="tel"
                            name="emergencyContact"
                            value={formData.emergencyContact}
                            onChange={handleInputChange}
                            className="form-control border-start-0"
                            placeholder="Enter emergency contact number"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Academic Information */}
                  <div className="mb-5">
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <div className="bg-warning bg-opacity-10 p-3 rounded-circle">
                        <BookOpen size={24} className="text-warning" />
                      </div>
                      <h3 className="mb-0 fw-bold text-dark">Academic Information</h3>
                    </div>
                    <div className="row g-4">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          Enrollment Number <span className="text-danger">*</span>
                        </label>
                        <div className="input-group input-group-lg">
                          <span className="input-group-text bg-light border-end-0">
                            <BookOpen size={18} className="text-muted" />
                          </span>
                          <input
                            type="text"
                            name="enrollNumber"
                            value={formData.enrollNumber}
                            onChange={handleInputChange}
                            className={`form-control border-start-0 ${errors.enrollNumber ? 'is-invalid' : ''}`}
                            placeholder="Enter enrollment number"
                          />
                          {errors.enrollNumber && (
                            <div className="invalid-feedback">{errors.enrollNumber}</div>
                          )}
                        </div>
                        <small className="text-muted d-block mt-2">
                          <i className="fas fa-info-circle me-1"></i>
                          Enrollment number must be unique within the selected class
                        </small>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          Assign to Class <span className="text-danger">*</span>
                        </label>
                        <div className="input-group input-group-lg">
                          <span className="input-group-text bg-light border-end-0">
                            <BookOpen size={18} className="text-muted" />
                          </span>
                          <select
                            name="classId"
                            value={formData.classId}
                            onChange={handleInputChange}
                            disabled={loadingClasses}
                            className={`form-select border-start-0 ${errors.classId ? 'is-invalid' : ''}`}
                          >
                            <option value="">
                              {loadingClasses ? 'Loading classes...' : 'Select a class'}
                            </option>
                            {classes.map((cls) => (
                              <option key={cls.id} value={cls.id}>
                                {cls.name} - Grade {cls.grade} {cls.section ? `(Section ${cls.section})` : ''}
                              </option>
                            ))}
                          </select>
                          {errors.classId && (
                            <div className="invalid-feedback">{errors.classId}</div>
                          )}
                        </div>
                        {!loadingClasses && classes.length === 0 && (
                          <small className="text-muted">
                            No classes found. Please create a class first.
                          </small>
                        )}
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
                      className="btn btn-lg px-5 rounded-pill fw-bold"
                      style={{
                        background: isSubmitting 
                          ? 'linear-gradient(135deg, #6c757d 0%, #495057 100%)'
                          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        color: 'white',
                        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                        transition: 'all 0.3s ease',
                        minWidth: '180px'
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Adding Student...
                        </>
                      ) : (
                        <>
                          <Sparkles size={20} className="me-2" />
                          Add Student
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
