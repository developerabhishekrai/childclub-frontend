'use client';

import React, { useState } from 'react';
import { X, BookOpen, Calendar, Users, FileText, Settings, Clock } from 'lucide-react';

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (classData: any) => void;
  teachers: any[];
}

export default function CreateClassModal({ isOpen, onClose, onSubmit, teachers }: CreateClassModalProps) {
  const [formData, setFormData] = useState({
    name: '',
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

  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableSubjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi', 
    'History', 'Geography', 'Civics', 'Economics', 'Computer Science', 
    'Physical Education', 'Art', 'Music', 'Sanskrit'
  ];

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
    
    if (!formData.name.trim()) newErrors.name = 'Class name is required';
    if (!formData.grade.trim()) newErrors.grade = 'Grade is required';
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
    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error('Error creating class:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      grade: '',
      section: '',
      academicYear: '',
      maxStudents: '',
      description: '',
      subjects: [],
      syllabus: '',
      rules: '',
      classTeacherId: '',
      startDate: '',
      endDate: '',
      schedule: '',
      roomNumber: '',
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
          <div className="modal-header bg-info text-white border-0">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-white bg-opacity-25 p-2 rounded-circle">
                <BookOpen size={24} className="text-white" />
              </div>
              <div>
                <h4 className="modal-title fw-bold mb-1">Create New Class</h4>
                <p className="mb-0 opacity-75">Set up a new academic section</p>
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
              {/* Basic Class Information */}
              <div className="mb-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="bg-info bg-opacity-10 p-2 rounded-circle">
                    <BookOpen size={20} className="text-info" />
                  </div>
                  <h5 className="mb-0 fw-bold text-dark">Basic Class Information</h5>
                </div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Class Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`form-control form-control-lg ${errors.name ? 'is-invalid' : ''}`}
                      placeholder="e.g., Science, Mathematics, English"
                    />
                    {errors.name && (
                      <div className="invalid-feedback">{errors.name}</div>
                    )}
                  </div>

                  <div className="col-md-3">
                    <label className="form-label fw-semibold">
                      Grade <span className="text-danger">*</span>
                    </label>
                    <select
                      name="grade"
                      value={formData.grade}
                      onChange={handleInputChange}
                      className={`form-select form-select-lg ${errors.grade ? 'is-invalid' : ''}`}
                    >
                      <option value="">Select Grade</option>
                      {Array.from({length: 12}, (_, i) => i + 1).map(grade => (
                        <option key={grade} value={grade.toString()}>Class {grade}</option>
                      ))}
                    </select>
                    {errors.grade && (
                      <div className="invalid-feedback">{errors.grade}</div>
                    )}
                  </div>

                  <div className="col-md-3">
                    <label className="form-label fw-semibold">
                      Section <span className="text-danger">*</span>
                    </label>
                    <select
                      name="section"
                      value={formData.section}
                      onChange={handleInputChange}
                      className={`form-select form-select-lg ${errors.section ? 'is-invalid' : ''}`}
                    >
                      <option value="">Select Section</option>
                      {['A', 'B', 'C', 'D', 'E', 'F'].map(section => (
                        <option key={section} value={section}>{section}</option>
                      ))}
                    </select>
                    {errors.section && (
                      <div className="invalid-feedback">{errors.section}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Academic Year <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="academicYear"
                      value={formData.academicYear}
                      onChange={handleInputChange}
                      className={`form-control form-control-lg ${errors.academicYear ? 'is-invalid' : ''}`}
                      placeholder="e.g., 2024-2025"
                    />
                    {errors.academicYear && (
                      <div className="invalid-feedback">{errors.academicYear}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Maximum Students <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      name="maxStudents"
                      value={formData.maxStudents}
                      onChange={handleInputChange}
                      className={`form-control form-control-lg ${errors.maxStudents ? 'is-invalid' : ''}`}
                      placeholder="e.g., 40"
                      min="1"
                      max="100"
                    />
                    {errors.maxStudents && (
                      <div className="invalid-feedback">{errors.maxStudents}</div>
                    )}
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-semibold">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="form-control form-control-lg"
                      rows={3}
                      placeholder="Brief description of the class..."
                    />
                  </div>
                </div>
              </div>

              {/* Academic Calendar */}
              <div className="mb-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="bg-primary bg-opacity-10 p-2 rounded-circle">
                    <Calendar size={20} className="text-primary" />
                  </div>
                  <h5 className="mb-0 fw-bold text-dark">Academic Calendar</h5>
                </div>
                <div className="row g-3">
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
              <div className="mb-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="bg-warning bg-opacity-10 p-2 rounded-circle">
                    <FileText size={20} className="text-warning" />
                  </div>
                  <h5 className="mb-0 fw-bold text-dark">Subjects</h5>
                </div>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label fw-semibold">
                      Select Subjects <span className="text-danger">*</span>
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
                </div>
              </div>

              {/* Class Teacher */}
              <div className="mb-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="bg-success bg-opacity-10 p-2 rounded-circle">
                    <Users size={20} className="text-success" />
                  </div>
                  <h5 className="mb-0 fw-bold text-dark">Class Teacher Assignment</h5>
                </div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Assign Class Teacher</label>
                    <select
                      name="classTeacherId"
                      value={formData.classTeacherId}
                      onChange={handleInputChange}
                      className="form-select form-select-lg"
                    >
                      <option value="">Select a teacher (optional)</option>
                      {teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.firstName} {teacher.lastName} - {teacher.subjects.join(', ')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="mb-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="bg-secondary bg-opacity-10 p-2 rounded-circle">
                    <Settings size={20} className="text-secondary" />
                  </div>
                  <h5 className="mb-0 fw-bold text-dark">Additional Information</h5>
                </div>
                <div className="row g-3">
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
                className="btn btn-info btn-lg px-4"
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Creating Class...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus me-2"></i>
                    Create Class
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
