'use client';

import React, { useState } from 'react';
import { X, Calendar, BookOpen, Users, FileText, Tag, Clock, Star, Repeat } from 'lucide-react';

interface CreateAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (assignmentData: any) => void;
  classes: any[];
  teachers: any[];
  students: any[];
}

export default function CreateAssignmentModal({ isOpen, onClose, onSubmit, classes, teachers, students }: CreateAssignmentModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    priority: '',
    dueDate: '',
    maxScore: '',
    instructions: '',
    rubric: '',
    tags: [] as string[],
    isRecurring: false,
    recurringPattern: '',
    assignedClasses: [] as string[],
    assignedStudents: [] as string[],
    assignedTeachers: [] as string[],
  });

  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const assignmentTypes = [
    'Homework', 'Project', 'Quiz', 'Test', 'Essay', 'Presentation', 
    'Lab Report', 'Research Paper', 'Group Work', 'Oral Exam'
  ];

  const priorityLevels = ['Low', 'Medium', 'High', 'Urgent'];

  const recurringPatterns = [
    'Daily', 'Weekly', 'Bi-weekly', 'Monthly', 'Quarterly'
  ];

  const availableTags = [
    'Mathematics', 'Science', 'English', 'History', 'Geography', 
    'Computer Science', 'Art', 'Music', 'Physical Education', 'Critical Thinking'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      if (name === 'isRecurring') {
        setFormData(prev => ({ ...prev, [name]: checked }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTagChange = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleClassChange = (classId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedClasses: prev.assignedClasses.includes(classId)
        ? prev.assignedClasses.filter(id => id !== classId)
        : [...prev.assignedClasses, classId]
    }));
  };

  const handleStudentChange = (studentId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedStudents: prev.assignedStudents.includes(studentId)
        ? prev.assignedStudents.filter(id => id !== studentId)
        : [...prev.assignedStudents, studentId]
    }));
  };

  const handleTeacherChange = (teacherId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedTeachers: prev.assignedTeachers.includes(teacherId)
        ? prev.assignedTeachers.filter(id => id !== teacherId)
        : [...prev.assignedTeachers, teacherId]
    }));
  };

  const validateForm = () => {
    const newErrors: any = {};
    
    if (!formData.title.trim()) newErrors.title = 'Assignment title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.type.trim()) newErrors.type = 'Assignment type is required';
    if (!formData.priority.trim()) newErrors.priority = 'Priority level is required';
    if (!formData.dueDate.trim()) newErrors.dueDate = 'Due date is required';
    if (!formData.maxScore.trim()) newErrors.maxScore = 'Maximum score is required';
    if (formData.assignedClasses.length === 0 && formData.assignedStudents.length === 0) {
      newErrors.assignment = 'Must assign to at least one class or student';
    }
    
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
      console.error('Error creating assignment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      type: '',
      priority: '',
      dueDate: '',
      maxScore: '',
      instructions: '',
      rubric: '',
      tags: [],
      isRecurring: false,
      recurringPattern: '',
      assignedClasses: [],
      assignedStudents: [],
      assignedTeachers: [],
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
          <div className="modal-header bg-warning text-white border-0">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-white bg-opacity-25 p-2 rounded-circle">
                <Calendar size={24} className="text-white" />
              </div>
              <div>
                <h4 className="modal-title fw-bold mb-1">Create New Assignment</h4>
                <p className="mb-0 opacity-75">Set up a new task for students</p>
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
              {/* Basic Assignment Information */}
              <div className="mb-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="bg-warning bg-opacity-10 p-2 rounded-circle">
                    <FileText size={20} className="text-warning" />
                  </div>
                  <h5 className="mb-0 fw-bold text-dark">Basic Assignment Information</h5>
                </div>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label fw-semibold">
                      Assignment Title <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`form-control form-control-lg ${errors.title ? 'is-invalid' : ''}`}
                      placeholder="Enter assignment title"
                    />
                    {errors.title && (
                      <div className="invalid-feedback">{errors.title}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Assignment Type <span className="text-danger">*</span>
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className={`form-select form-select-lg ${errors.type ? 'is-invalid' : ''}`}
                    >
                      <option value="">Select Type</option>
                      {assignmentTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    {errors.type && (
                      <div className="invalid-feedback">{errors.type}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Priority Level <span className="text-danger">*</span>
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className={`form-select form-select-lg ${errors.priority ? 'is-invalid' : ''}`}
                    >
                      <option value="">Select Priority</option>
                      {priorityLevels.map((priority) => (
                        <option key={priority} value={priority}>{priority}</option>
                      ))}
                    </select>
                    {errors.priority && (
                      <div className="invalid-feedback">{errors.priority}</div>
                    )}
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-semibold">
                      Description <span className="text-danger">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className={`form-control form-control-lg ${errors.description ? 'is-invalid' : ''}`}
                      rows={3}
                      placeholder="Detailed description of the assignment..."
                    />
                    {errors.description && (
                      <div className="invalid-feedback">{errors.description}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Due Date and Scoring */}
              <div className="mb-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="bg-primary bg-opacity-10 p-2 rounded-circle">
                    <Clock size={20} className="text-primary" />
                  </div>
                  <h5 className="mb-0 fw-bold text-dark">Due Date & Scoring</h5>
                </div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Due Date <span className="text-danger">*</span>
                    </label>
                    <div className="input-group input-group-lg">
                      <span className="input-group-text bg-light border-end-0">
                        <Calendar size={18} className="text-muted" />
                      </span>
                      <input
                        type="datetime-local"
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={handleInputChange}
                        className={`form-control border-start-0 ${errors.dueDate ? 'is-invalid' : ''}`}
                      />
                      {errors.dueDate && (
                        <div className="invalid-feedback">{errors.dueDate}</div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Maximum Score <span className="text-danger">*</span>
                    </label>
                    <div className="input-group input-group-lg">
                      <span className="input-group-text bg-light border-end-0">
                        <Star size={18} className="text-muted" />
                      </span>
                      <input
                        type="number"
                        name="maxScore"
                        value={formData.maxScore}
                        onChange={handleInputChange}
                        className={`form-control border-start-0 ${errors.maxScore ? 'is-invalid' : ''}`}
                        placeholder="e.g., 100"
                        min="1"
                        max="1000"
                      />
                      {errors.maxScore && (
                        <div className="invalid-feedback">{errors.maxScore}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions and Rubric */}
              <div className="mb-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="bg-info bg-opacity-10 p-2 rounded-circle">
                    <FileText size={20} className="text-info" />
                  </div>
                  <h5 className="mb-0 fw-bold text-dark">Instructions & Rubric</h5>
                </div>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label fw-semibold">Instructions for Students</label>
                    <textarea
                      name="instructions"
                      value={formData.instructions}
                      onChange={handleInputChange}
                      className="form-control form-control-lg"
                      rows={4}
                      placeholder="Step-by-step instructions for completing the assignment..."
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-semibold">Grading Rubric</label>
                    <textarea
                      name="rubric"
                      value={formData.rubric}
                      onChange={handleInputChange}
                      className="form-control form-control-lg"
                      rows={4}
                      placeholder="Detailed grading criteria and rubric..."
                    />
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="mb-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="bg-secondary bg-opacity-10 p-2 rounded-circle">
                    <Tag size={20} className="text-secondary" />
                  </div>
                  <h5 className="mb-0 fw-bold text-dark">Tags & Categories</h5>
                </div>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label fw-semibold">Select Tags</label>
                    <div className="border rounded p-3">
                      <div className="row g-2">
                        {availableTags.map((tag) => (
                          <div key={tag} className="col-md-4 col-sm-6">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`tag-${tag}`}
                                checked={formData.tags.includes(tag)}
                                onChange={() => handleTagChange(tag)}
                              />
                              <label className="form-check-label" htmlFor={`tag-${tag}`}>
                                {tag}
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recurring Options */}
              <div className="mb-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="bg-success bg-opacity-10 p-2 rounded-circle">
                    <Repeat size={20} className="text-success" />
                  </div>
                  <h5 className="mb-0 fw-bold text-dark">Recurring Options</h5>
                </div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="isRecurring"
                        checked={formData.isRecurring}
                        onChange={handleInputChange}
                        id="recurringSwitch"
                      />
                      <label className="form-check-label fw-semibold" htmlFor="recurringSwitch">
                        Make this assignment recurring
                      </label>
                    </div>
                  </div>

                  {formData.isRecurring && (
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Recurring Pattern</label>
                      <select
                        name="recurringPattern"
                        value={formData.recurringPattern}
                        onChange={handleInputChange}
                        className="form-select form-select-lg"
                      >
                        <option value="">Select Pattern</option>
                        {recurringPatterns.map((pattern) => (
                          <option key={pattern} value={pattern}>{pattern}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Assignment Targets */}
              <div className="mb-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="bg-warning bg-opacity-10 p-2 rounded-circle">
                    <Users size={20} className="text-warning" />
                  </div>
                  <h5 className="mb-0 fw-bold text-dark">Assignment Targets</h5>
                </div>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label fw-semibold">Assign to Classes</label>
                    <div className="border rounded p-3">
                      <div className="row g-2">
                        {classes.map((cls) => (
                          <div key={cls.id} className="col-md-6 col-sm-12">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`class-${cls.id}`}
                                checked={formData.assignedClasses.includes(cls.id)}
                                onChange={() => handleClassChange(cls.id)}
                              />
                              <label className="form-check-label" htmlFor={`class-${cls.id}`}>
                                {cls.grade}-{cls.section || 'A'} - {cls.name}
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Assign to Specific Students</label>
                    <div className="border rounded p-3" style={{maxHeight: '200px', overflowY: 'auto'}}>
                      {students.map((student) => (
                        <div key={student.id} className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`student-${student.id}`}
                            checked={formData.assignedStudents.includes(student.id)}
                            onChange={() => handleStudentChange(student.id)}
                          />
                          <label className="form-check-label" htmlFor={`student-${student.id}`}>
                            {student.firstName} {student.lastName}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Assign to Teachers</label>
                    <div className="border rounded p-3" style={{maxHeight: '200px', overflowY: 'auto'}}>
                      {teachers.map((teacher) => (
                        <div key={teacher.id} className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`teacher-${teacher.id}`}
                            checked={formData.assignedTeachers.includes(teacher.id)}
                            onChange={() => handleTeacherChange(teacher.id)}
                          />
                          <label className="form-check-label" htmlFor={`teacher-${teacher.id}`}>
                            {teacher.firstName} {teacher.lastName}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {errors.assignment && (
                    <div className="col-12">
                      <div className="text-danger small">{errors.assignment}</div>
                    </div>
                  )}
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
                className="btn btn-warning btn-lg px-4"
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Creating Assignment...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus me-2"></i>
                    Create Assignment
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
