'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Users, FileText, Settings, Clock, ArrowLeft, Sparkles, CheckCircle2, Star, Award, Target, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { apiGet, apiPost, getStoredToken, getStoredUser } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { showSuccess, showError, showLoading, closeLoading, showToast } from '@/lib/sweetalert';

interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  teacherId: number;
  employeeId: string;
  schoolId: number;
  qualification?: string;
  experienceYears?: number;
  department?: string;
  designation?: string;
}

export default function CreateClassPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    grade: '',
    section: '',
    academicYear: '',
    maxStudents: '',
    description: '',
    subjects: [] as string[],
    syllabus: '',
    rules: '',
    classTeacherId: '',
    startDate: '',
    endDate: '',
    schedule: '',
    roomNumber: '',
  });

  // Grade levels according to Indian education system
  const gradeOptions = [
    { value: 'Nursery', label: 'Nursery (Pre-Primary)' },
    { value: 'LKG', label: 'LKG (Pre-Primary)' },
    { value: 'UKG', label: 'UKG (Pre-Primary)' },
    { value: '1', label: 'Class 1 (Primary)' },
    { value: '2', label: 'Class 2 (Primary)' },
    { value: '3', label: 'Class 3 (Primary)' },
    { value: '4', label: 'Class 4 (Primary)' },
    { value: '5', label: 'Class 5 (Primary)' },
    { value: '6', label: 'Class 6 (Middle)' },
    { value: '7', label: 'Class 7 (Middle)' },
    { value: '8', label: 'Class 8 (Middle)' },
    { value: '9', label: 'Class 9 (Secondary)' },
    { value: '10', label: 'Class 10 (Secondary)' },
    { value: '11', label: 'Class 11 (Senior Secondary)' },
    { value: '12', label: 'Class 12 (Senior Secondary)' },
  ];

  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [submitError, setSubmitError] = useState<string>('');
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  // Fetch subjects from API
  const fetchSubjects = async () => {
    try {
      setLoadingSubjects(true);
      const token = getStoredToken();
      
      if (!token) {
        console.error('No authentication token found for subjects');
        setLoadingSubjects(false);
        return;
      }

      console.log('Making API call to /subjects...');
      
      const response = await apiGet<any[]>('/subjects', { token });
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

  // Fetch teachers from API
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const token = getStoredToken();
        if (!token) {
          console.error('No token found');
          setLoadingTeachers(false);
          return;
        }

        const response = await apiGet<Teacher[]>('/teachers', { token });
        setTeachers(response);
        console.log('Teachers fetched:', response);
      } catch (error) {
        console.error('Error fetching teachers:', error);
      } finally {
        setLoadingTeachers(false);
      }
    };

    fetchTeachers();
    fetchSubjects();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
    
    if (!formData.grade.trim()) newErrors.grade = 'Grade/Level is required';
    if (!formData.section.trim()) newErrors.section = 'Section is required';
    if (!formData.academicYear.trim()) newErrors.academicYear = 'Academic year is required';
    if (!formData.maxStudents.trim()) newErrors.maxStudents = 'Maximum students is required';

    if (formData.subjects.length === 0) newErrors.subjects = 'At least one subject is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      const token = getStoredToken();
      if (!token) {
        setSubmitError('Authentication required. Please login again.');
        return;
      }

      // Get logged-in user's school ID
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
      
      console.log('=== Create Class Debug ===');
      console.log('Logged in user:', user);
      console.log('School ID:', user?.schoolId);
      
      if (!user) {
        throw new Error('User not logged in. Please login again.');
      }
      
      if (!user.schoolId) {
        throw new Error('School ID not found. Please login again.');
      }

      // Generate class name from grade and section
      const className = `${formData.grade}-${formData.section}`;

      // Prepare data for API
      const classData = {
        name: className,  // Auto-generated from grade-section
        grade: formData.grade,
        section: formData.section,
        academicYear: formData.academicYear,
        maxStudents: parseInt(formData.maxStudents),
        description: formData.description || null,
        subjects: formData.subjects,
        syllabus: formData.syllabus || null,
        rules: formData.rules || null,
        classTeacherId: formData.classTeacherId ? parseInt(formData.classTeacherId) : null,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        schedule: formData.schedule || null,
        roomNumber: formData.roomNumber || null,
        schoolId: user.schoolId,
      };

      console.log('Creating class:', classData);
      
      // Show loading
      showLoading('Creating Class', 'Please wait while we create your new class...');
      
      // Call API using helper function
      const response = await apiPost('/classes', classData, { token });
      
      console.log('Class created successfully:', response);
      
      // Close loading
      closeLoading();
      
      // Show success with beautiful animation
      await showSuccess(
        'Class Created Successfully! 🎉',
        `Class "${className}" has been created successfully. You can now assign students and teachers to this class.`
      );
      
      // Redirect to classes list
      router.push('/school-admin/classes');
      
    } catch (error: any) {
      console.error('Error creating class:', error);
      
      // Close loading if it's open
      closeLoading();
      
      const errorMessage = error?.message || 'Error creating class. Please try again.';
      setSubmitError(errorMessage);
      
      // Show error with SweetAlert
      await showError(
        'Failed to Create Class',
        errorMessage
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100" style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh'
    }}>
      {/* Modern Header with Gradient */}
      <div className="bg-white shadow-lg" style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.2)'
      }}>
        <div className="container-fluid py-4">
          <div className="d-flex align-items-center gap-3">
            <Link 
              href="/school-admin/classes" 
              className="btn btn-outline-primary btn-lg rounded-pill px-4"
              style={{
                background: 'rgba(13, 110, 253, 0.1)',
                border: '2px solid rgba(13, 110, 253, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(13, 110, 253, 0.2)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(13, 110, 253, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="d-flex align-items-center gap-3">
              <div className="p-3 rounded-circle" style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
              }}>
                <GraduationCap size={32} className="text-white" />
              </div>
              <div>
                <h1 className="h2 mb-1 fw-bold" style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Create New Class
                </h1>
                <p className="text-muted mb-0 fs-5">
                  <Sparkles size={16} className="me-2 text-warning" />
                  Set up a new academic section with modern tools
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Modern Design */}
      <div className="container-fluid py-5">
        <div className="row justify-content-center">
          <div className="col-lg-10 col-xl-8">
            <div 
              className="card border-0 shadow-lg" 
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div className="card-body p-5">
                <form onSubmit={handleSubmit}>
                  {/* Basic Class Information */}
                  <div className="mb-5">
                    <div className="d-flex align-items-center gap-3 mb-4">
                      <div 
                        className="p-3 rounded-circle shadow-sm"
                        style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
                        }}
                      >
                        <BookOpen size={28} className="text-white" />
                      </div>
                      <div>
                        <h3 className="mb-1 fw-bold" style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text'
                        }}>
                          Basic Class Information
                        </h3>
                        <p className="text-muted mb-0 small">
                          <CheckCircle2 size={14} className="me-1 text-success" />
                          Essential details for your new class
                        </p>
                      </div>
                    </div>
                    <div className="row g-4">
                      {/* Preview of auto-generated class name */}
                      {formData.grade && formData.section && (
                        <div className="col-12">
                          <div 
                            className="d-flex align-items-center p-4 rounded-3 shadow-sm border-0"
                            style={{
                              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                              border: '2px solid rgba(102, 126, 234, 0.2) !important',
                              backdropFilter: 'blur(10px)'
                            }}
                          >
                            <div 
                              className="p-2 rounded-circle me-3"
                              style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)'
                              }}
                            >
                              <Star size={20} className="text-white" />
                            </div>
                            <div className="flex-grow-1">
                              <strong className="text-dark mb-1 d-block">Class Preview</strong>
                              <div className="d-flex align-items-center gap-2">
                                <span className="text-muted">Class will be created as:</span>
                                <span 
                                  className="badge px-3 py-2 fs-6 fw-bold"
                                  style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)'
                                  }}
                                >
                                  {formData.grade}-{formData.section}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="col-md-6">
                        <label className="form-label fw-semibold mb-2">
                          <GraduationCap size={16} className="me-2 text-primary" />
                          Grade/Level <span className="text-danger">*</span>
                        </label>
                        <select
                          name="grade"
                          value={formData.grade}
                          onChange={handleInputChange}
                          className={`form-select form-select-lg rounded-3 border-2 ${errors.grade ? 'is-invalid border-danger' : 'border-primary'}`}
                          style={{
                            background: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.3s ease'
                          }}
                          onFocus={(e) => {
                            e.target.style.boxShadow = '0 8px 32px rgba(102, 126, 234, 0.3)';
                            e.target.style.transform = 'translateY(-2px)';
                          }}
                          onBlur={(e) => {
                            e.target.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
                            e.target.style.transform = 'translateY(0)';
                          }}
                        >
                          <option value="">Select Grade/Level</option>
                          {gradeOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                        {errors.grade && (
                          <div className="invalid-feedback d-flex align-items-center">
                            <span className="me-2">⚠️</span>
                            {errors.grade}
                          </div>
                        )}
                        <small className="text-muted d-flex align-items-center mt-2">
                          <Target size={12} className="me-2" />
                          Select the grade/level: Pre-Primary, Primary, Middle, Secondary, or Senior Secondary
                        </small>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold mb-2">
                          <Users size={16} className="me-2 text-success" />
                          Section <span className="text-danger">*</span>
                        </label>
                        <select
                          name="section"
                          value={formData.section}
                          onChange={handleInputChange}
                          className={`form-select form-select-lg rounded-3 border-2 ${errors.section ? 'is-invalid border-danger' : 'border-success'}`}
                          style={{
                            background: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.3s ease'
                          }}
                          onFocus={(e) => {
                            e.target.style.boxShadow = '0 8px 32px rgba(25, 135, 84, 0.3)';
                            e.target.style.transform = 'translateY(-2px)';
                          }}
                          onBlur={(e) => {
                            e.target.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
                            e.target.style.transform = 'translateY(0)';
                          }}
                        >
                          <option value="">Select Section</option>
                          {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(section => (
                            <option key={section} value={section}>{section}</option>
                          ))}
                        </select>
                        {errors.section && (
                          <div className="invalid-feedback d-flex align-items-center">
                            <span className="me-2">⚠️</span>
                            {errors.section}
                          </div>
                        )}
                        <small className="text-muted d-flex align-items-center mt-2">
                          <Award size={12} className="me-2" />
                          Select section for this grade
                        </small>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold mb-2">
                          <Calendar size={16} className="me-2 text-warning" />
                          Academic Year <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          name="academicYear"
                          value={formData.academicYear}
                          onChange={handleInputChange}
                          className={`form-control form-control-lg rounded-3 border-2 ${errors.academicYear ? 'is-invalid border-danger' : 'border-warning'}`}
                          placeholder="e.g., 2024-2025"
                          style={{
                            background: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.3s ease'
                          }}
                          onFocus={(e) => {
                            e.target.style.boxShadow = '0 8px 32px rgba(255, 193, 7, 0.3)';
                            e.target.style.transform = 'translateY(-2px)';
                          }}
                          onBlur={(e) => {
                            e.target.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
                            e.target.style.transform = 'translateY(0)';
                          }}
                        />
                        {errors.academicYear && (
                          <div className="invalid-feedback d-flex align-items-center">
                            <span className="me-2">⚠️</span>
                            {errors.academicYear}
                          </div>
                        )}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold mb-2">
                          <Users size={16} className="me-2 text-info" />
                          Maximum Students <span className="text-danger">*</span>
                        </label>
                        <input
                          type="number"
                          name="maxStudents"
                          value={formData.maxStudents}
                          onChange={handleInputChange}
                          className={`form-control form-control-lg rounded-3 border-2 ${errors.maxStudents ? 'is-invalid border-danger' : 'border-info'}`}
                          placeholder="e.g., 40"
                          min="1"
                          max="100"
                          style={{
                            background: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.3s ease'
                          }}
                          onFocus={(e) => {
                            e.target.style.boxShadow = '0 8px 32px rgba(13, 202, 240, 0.3)';
                            e.target.style.transform = 'translateY(-2px)';
                          }}
                          onBlur={(e) => {
                            e.target.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
                            e.target.style.transform = 'translateY(0)';
                          }}
                        />
                        {errors.maxStudents && (
                          <div className="invalid-feedback d-flex align-items-center">
                            <span className="me-2">⚠️</span>
                            {errors.maxStudents}
                          </div>
                        )}
                      </div>

                      <div className="col-12">
                        <label className="form-label fw-semibold mb-2">
                          <FileText size={16} className="me-2 text-secondary" />
                          Description
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          className="form-control form-control-lg rounded-3 border-2 border-secondary"
                          rows={4}
                          placeholder="Brief description of the class..."
                          style={{
                            background: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.3s ease',
                            resize: 'vertical'
                          }}
                          onFocus={(e) => {
                            e.target.style.boxShadow = '0 8px 32px rgba(108, 117, 125, 0.3)';
                            e.target.style.transform = 'translateY(-2px)';
                          }}
                          onBlur={(e) => {
                            e.target.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
                            e.target.style.transform = 'translateY(0)';
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Academic Calendar */}
                  <div className="mb-5">
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <div className="bg-primary bg-opacity-10 p-3 rounded-circle">
                        <Calendar size={24} className="text-primary" />
                      </div>
                      <h3 className="mb-0 fw-bold text-dark">Academic Calendar</h3>
                    </div>
                    <div className="row g-4">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Start Date</label>
                        <div className="input-group input-group-lg">
                          <span className="input-group-text bg-light border-end-0">
                            <Calendar size={18} className="text-muted" />
                          </span>
                          <input
                            type="date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleInputChange}
                            className="form-control border-start-0"
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold">End Date</label>
                        <div className="input-group input-group-lg">
                          <span className="input-group-text bg-light border-end-0">
                            <Calendar size={18} className="text-muted" />
                          </span>
                          <input
                            type="date"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleInputChange}
                            className="form-control border-start-0"
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Class Schedule</label>
                        <div className="input-group input-group-lg">
                          <span className="input-group-text bg-light border-end-0">
                            <Clock size={18} className="text-muted" />
                          </span>
                          <input
                            type="text"
                            name="schedule"
                            value={formData.schedule}
                            onChange={handleInputChange}
                            className="form-control border-start-0"
                            placeholder="e.g., Monday to Friday, 8:00 AM - 2:00 PM"
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Room Number</label>
                        <div className="input-group input-group-lg">
                          <span className="input-group-text bg-light border-end-0">
                            <BookOpen size={18} className="text-muted" />
                          </span>
                          <input
                            type="text"
                            name="roomNumber"
                            value={formData.roomNumber}
                            onChange={handleInputChange}
                            className="form-control border-start-0"
                            placeholder="e.g., Room 101, Block A"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Subjects */}
                  <div className="mb-5">
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <div className="bg-warning bg-opacity-10 p-3 rounded-circle">
                        <FileText size={24} className="text-warning" />
                      </div>
                      <h3 className="mb-0 fw-bold text-dark">Subjects</h3>
                    </div>
                    <div className="row g-4">
                      <div className="col-12">
                        <label className="form-label fw-semibold">
                          Select Subjects <span className="text-danger">*</span>
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
                    </div>
                  </div>

                  {/* Class Teacher */}
                  <div className="mb-5">
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <div className="bg-success bg-opacity-10 p-3 rounded-circle">
                        <Users size={24} className="text-success" />
                      </div>
                      <h3 className="mb-0 fw-bold text-dark">Class Teacher Assignment</h3>
                    </div>
                    <div className="row g-4">
                      <div className="col-md-12">
                        <label className="form-label fw-semibold">Assign Class Teacher</label>
                        {loadingTeachers ? (
                          <div className="form-select form-select-lg d-flex align-items-center justify-content-center">
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Loading teachers...
                          </div>
                        ) : (
                          <>
                            <select
                              name="classTeacherId"
                              value={formData.classTeacherId}
                              onChange={handleInputChange}
                              className="form-select form-select-lg"
                            >
                              <option value="">Select a teacher (optional)</option>
                              {teachers.length === 0 ? (
                                <option disabled>No teachers available</option>
                              ) : (
                                teachers.map((teacher) => (
                                  <option key={teacher.id} value={teacher.id}>
                                    {teacher.firstName} {teacher.lastName} ({teacher.employeeId})
                                    {teacher.qualification && ` - ${teacher.qualification}`}
                                    {teacher.department && ` | ${teacher.department}`}
                                  </option>
                                ))
                              )}
                            </select>
                            {teachers.length === 0 && !loadingTeachers && (
                              <div className="text-muted small mt-2">
                                <i className="fas fa-info-circle me-1"></i>
                                No teachers found. Please add teachers first from the Teachers section.
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="mb-5">
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <div className="bg-secondary bg-opacity-10 p-3 rounded-circle">
                        <Settings size={24} className="text-secondary" />
                      </div>
                      <h3 className="mb-0 fw-bold text-dark">Additional Information</h3>
                    </div>
                    <div className="row g-4">
                      <div className="col-12">
                        <label className="form-label fw-semibold">Syllabus</label>
                        <textarea
                          name="syllabus"
                          value={formData.syllabus}
                          onChange={handleInputChange}
                          className="form-control form-control-lg"
                          rows={3}
                          placeholder="Class syllabus and curriculum details..."
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label fw-semibold">Class Rules & Guidelines</label>
                        <textarea
                          name="rules"
                          value={formData.rules}
                          onChange={handleInputChange}
                          className="form-control form-control-lg"
                          rows={3}
                          placeholder="Class rules, behavior guidelines, and policies..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Error Display */}
                  {submitError && (
                    <div className="alert alert-danger d-flex align-items-center" role="alert">
                      <i className="fas fa-exclamation-circle me-2"></i>
                      <div>{submitError}</div>
                    </div>
                  )}

                  {/* Modern Actions */}
                  <div className="d-flex gap-3 justify-content-end pt-4 border-top">
                    <Link 
                      href="/school-admin/classes" 
                      className="btn btn-outline-secondary btn-lg px-4 rounded-pill"
                      style={{
                        border: '2px solid #6c757d',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#6c757d';
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 32px rgba(108, 117, 125, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#6c757d';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <ArrowLeft size={20} className="me-2" />
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
                      onMouseEnter={(e) => {
                        if (!isSubmitting) {
                          e.currentTarget.style.transform = 'translateY(-3px)';
                          e.currentTarget.style.boxShadow = '0 12px 48px rgba(102, 126, 234, 0.4)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSubmitting) {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 8px 32px rgba(102, 126, 234, 0.3)';
                        }
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Creating Class...
                        </>
                      ) : (
                        <>
                          <Sparkles size={20} className="me-2" />
                          Create Class
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
