'use client';

import React, { useState } from 'react';
import { X, User, Mail, Phone, MapPin, Calendar, BookOpen, GraduationCap, Briefcase } from 'lucide-react';

interface AddTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (teacherData: any) => void;
  classes: any[];
}

export default function AddTeacherModal({ isOpen, onClose, onSubmit, classes }: AddTeacherModalProps) {
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
    experience: '',
    subjects: [] as string[],
    classId: '',
    joiningDate: '',
    salary: '',
  });

  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableSubjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi', 
    'History', 'Geography', 'Civics', 'Economics', 'Computer Science', 
    'Physical Education', 'Art', 'Music', 'Sanskrit'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
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

  const validateForm = () => {
    const newErrors: any = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.mobile && !/^\d{10}$/.test(formData.mobile)) newErrors.mobile = 'Mobile number must be 10 digits';
    if (!formData.qualification.trim()) newErrors.qualification = 'Qualification is required';
    if (!formData.experience.trim()) newErrors.experience = 'Experience is required';
    if (formData.subjects.length === 0) newErrors.subjects = 'At least one subject is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error('Error adding teacher:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
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
      experience: '',
      subjects: [],
      classId: '',
      joiningDate: '',
      salary: '',
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex={-1}>
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow">
          {/* Header */}
          <div className="modal-header bg-success text-white border-0">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-white bg-opacity-25 p-2 rounded-circle">
                <User size={24} className="text-white" />
              </div>
              <div>
                <h4 className="modal-title fw-bold mb-1">Add New Teacher</h4>
                <p className="mb-0 opacity-75">Hire a new faculty member</p>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={handleClose}
              aria-label="Close"
            ></button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {/* Personal Information */}
              <div className="mb-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="bg-success bg-opacity-10 p-2 rounded-circle">
                    <User size={20} className="text-success" />
                  </div>
                  <h5 className="mb-0 fw-bold text-dark">Personal Information</h5>
                </div>
                <div className="row g-3">
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
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`form-control form-control-lg ${errors.password ? 'is-invalid' : ''}`}
                      placeholder="Enter password"
                    />
                    {errors.password && (
                      <div className="invalid-feedback">{errors.password}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="mb-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="bg-primary bg-opacity-10 p-2 rounded-circle">
                    <GraduationCap size={20} className="text-primary" />
                  </div>
                  <h5 className="mb-0 fw-bold text-dark">Professional Information</h5>
                </div>
                <div className="row g-3">
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
                      Experience <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      className={`form-control form-control-lg ${errors.experience ? 'is-invalid' : ''}`}
                      placeholder="e.g., 5 years"
                    />
                    {errors.experience && (
                      <div className="invalid-feedback">{errors.experience}</div>
                    )}
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

              {/* Subjects */}
              <div className="mb-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="bg-warning bg-opacity-10 p-2 rounded-circle">
                    <BookOpen size={20} className="text-warning" />
                  </div>
                  <h5 className="mb-0 fw-bold text-dark">Subjects & Classes</h5>
                </div>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label fw-semibold">
                      Subjects <span className="text-danger">*</span>
                    </label>
                    <div className="border rounded p-3">
                      <div className="row g-2">
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
                    </div>
                    {errors.subjects && (
                      <div className="text-danger small mt-1">{errors.subjects}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Assign to Class</label>
                    <div className="input-group input-group-lg">
                      <span className="input-group-text bg-light border-end-0">
                        <BookOpen size={18} className="text-muted" />
                      </span>
                      <select
                        name="classId"
                        value={formData.classId}
                        onChange={handleInputChange}
                        className="form-select border-start-0"
                      >
                        <option value="">Select a class (optional)</option>
                        {classes.map((cls) => (
                          <option key={cls.id} value={cls.id}>
                            {cls.grade}-{cls.section || 'A'} - {cls.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="mb-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="bg-info bg-opacity-10 p-2 rounded-circle">
                    <MapPin size={20} className="text-info" />
                  </div>
                  <h5 className="mb-0 fw-bold text-dark">Address Information</h5>
                </div>
                <div className="row g-3">
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
            </div>

            {/* Actions */}
            <div className="modal-footer bg-light border-0">
              <button
                type="button"
                className="btn btn-secondary btn-lg px-4"
                onClick={handleClose}
              >
                <i className="fas fa-times me-2"></i>
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-success btn-lg px-4"
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
  );
}
