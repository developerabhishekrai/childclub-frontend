'use client';

import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, BookOpen, ArrowLeft, GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function TeacherRegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
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
    joiningDate: '',
    salary: '',
    emergencyContact: '',
    termsAccepted: false,
  });

  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock departments and designations
  const departments = [
    'Mathematics', 'Science', 'English', 'Social Studies', 
    'Computer Science', 'Physical Education', 'Arts', 'Music'
  ];

  const designations = [
    'Primary Teacher', 'Secondary Teacher', 'Senior Teacher', 
    'Head of Department', 'Vice Principal', 'Principal'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.mobile) newErrors.mobile = 'Mobile number is required';
    else if (!/^\d{10}$/.test(formData.mobile)) newErrors.mobile = 'Mobile number must be 10 digits';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.qualification) newErrors.qualification = 'Qualification is required';
    if (!formData.specialization) newErrors.specialization = 'Specialization is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.designation) newErrors.designation = 'Designation is required';
    if (!formData.termsAccepted) newErrors.termsAccepted = 'Please accept the terms and conditions';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      console.log('Teacher registration data:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Registration successful! Please wait for admin approval.');
      // Reset form
      setFormData({
        firstName: '', lastName: '', email: '', mobile: '', password: '', confirmPassword: '',
        dateOfBirth: '', address: '', city: '', state: '', country: 'India', postalCode: '',
        qualification: '', specialization: '', experienceYears: '', department: '', designation: '',
        joiningDate: '', salary: '', emergencyContact: ''
      });
      setErrors({});
      
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
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
            <Link href="/" className="btn btn-outline-secondary">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="h3 mb-0 fw-bold text-dark">
                <i className="fas fa-chalkboard-teacher me-2 text-primary"></i>
                Teacher Registration
              </h1>
              <p className="text-muted mb-0">Join our teaching community</p>
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
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`form-control form-control-lg ${errors.email ? 'is-invalid' : ''}`}
                          placeholder="Enter email address"
                        />
                        {errors.email && (
                          <div className="invalid-feedback">{errors.email}</div>
                        )}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          Mobile Number <span className="text-danger">*</span>
                        </label>
                        <input
                          type="tel"
                          name="mobile"
                          value={formData.mobile}
                          onChange={handleInputChange}
                          className={`form-control form-control-lg ${errors.mobile ? 'is-invalid' : ''}`}
                          placeholder="Enter mobile number"
                        />
                        {errors.mobile && (
                          <div className="invalid-feedback">{errors.mobile}</div>
                        )}
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
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div className="mb-5">
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <div className="bg-success bg-opacity-10 p-3 rounded-circle">
                        <GraduationCap size={24} className="text-success" />
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
                          placeholder="e.g., M.Sc., B.Ed., Ph.D."
                        />
                        {errors.qualification && (
                          <div className="invalid-feedback">{errors.qualification}</div>
                        )}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          Specialization <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          name="specialization"
                          value={formData.specialization}
                          onChange={handleInputChange}
                          className={`form-control form-control-lg ${errors.specialization ? 'is-invalid' : ''}`}
                          placeholder="e.g., Mathematics, Physics"
                        />
                        {errors.specialization && (
                          <div className="invalid-feedback">{errors.specialization}</div>
                        )}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Years of Experience</label>
                        <input
                          type="number"
                          name="experienceYears"
                          value={formData.experienceYears}
                          onChange={handleInputChange}
                          className="form-control form-control-lg"
                          placeholder="0"
                          min="0"
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          Department <span className="text-danger">*</span>
                        </label>
                        <select
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          className={`form-select form-select-lg ${errors.department ? 'is-invalid' : ''}`}
                        >
                          <option value="">Select Department</option>
                          {departments.map((dept) => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                        {errors.department && (
                          <div className="invalid-feedback">{errors.department}</div>
                        )}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          Designation <span className="text-danger">*</span>
                        </label>
                        <select
                          name="designation"
                          value={formData.designation}
                          onChange={handleInputChange}
                          className={`form-select form-select-lg ${errors.designation ? 'is-invalid' : ''}`}
                        >
                          <option value="">Select Designation</option>
                          {designations.map((desig) => (
                            <option key={desig} value={desig}>{desig}</option>
                          ))}
                        </select>
                        {errors.designation && (
                          <div className="invalid-feedback">{errors.designation}</div>
                        )}
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
                        <label className="form-label fw-semibold">Expected Salary</label>
                        <input
                          type="number"
                          name="salary"
                          value={formData.salary}
                          onChange={handleInputChange}
                          className="form-control form-control-lg"
                          placeholder="Monthly salary"
                          min="0"
                        />
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
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="form-control form-control-lg"
                          placeholder="Enter full address"
                        />
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

                  {/* Account Security */}
                  <div className="mb-5">
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <div className="bg-warning bg-opacity-10 p-3 rounded-circle">
                        <BookOpen size={24} className="text-warning" />
                      </div>
                      <h3 className="mb-0 fw-bold text-dark">Account Security</h3>
                    </div>
                    <div className="row g-4">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          Password <span className="text-danger">*</span>
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className={`form-control form-control-lg ${errors.password ? 'is-invalid' : ''}`}
                          placeholder="Create password"
                        />
                        {errors.password && (
                          <div className="invalid-feedback">{errors.password}</div>
                        )}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          Confirm Password <span className="text-danger">*</span>
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className={`form-control form-control-lg ${errors.confirmPassword ? 'is-invalid' : ''}`}
                          placeholder="Confirm password"
                        />
                        {errors.confirmPassword && (
                          <div className="invalid-feedback">{errors.confirmPassword}</div>
                        )}
                      </div>
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
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label" htmlFor="termsAccepted">
                        I agree to the <Link href="/terms?from=teacher" className="text-decoration-none fw-semibold">Terms and Conditions</Link> and{' '}
                        <Link href="/privacy?from=teacher" className="text-decoration-none fw-semibold">Privacy Policy</Link> *
                      </label>
                    </div>
                    {errors.termsAccepted && (
                      <div className="text-danger small mt-1">{errors.termsAccepted}</div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="d-flex gap-3 justify-content-end pt-4 border-top">
                    <Link href="/" className="btn btn-secondary btn-lg px-5">
                      <i className="fas fa-times me-2"></i>
                      Cancel
                    </Link>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn btn-primary btn-lg px-5"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Registering...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-user-plus me-2"></i>
                          Register Teacher
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

