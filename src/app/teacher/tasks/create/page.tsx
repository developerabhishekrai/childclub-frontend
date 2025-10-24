'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, BookOpen, Users, FileText, Tag, Clock, Star, Repeat, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';

export default function CreateAssignmentPage() {
  const router = useRouter();
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
    assignedClasses: [] as number[],
    assignedStudents: [] as number[],
    assignedTeachers: [] as number[],
  });

  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Real data from API
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  
  // Filter students based on selected classes (only show active students)
  const filteredStudents = formData.assignedClasses.length > 0
    ? students.filter(student => 
        formData.assignedClasses.includes(student.currentClassId) && 
        student.status === 'active'
      )
    : [];

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

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/teacher/login');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Fetch classes, teachers, and students in parallel
      const [classesRes, teachersRes, studentsRes] = await Promise.all([
        fetch('http://localhost:3001/classes', { headers }),
        fetch('http://localhost:3001/teachers', { headers }),
        fetch('http://localhost:3001/students', { headers }),
      ]);

      if (classesRes.ok) {
        const classesData = await classesRes.json();
        setClasses(classesData);
      }

      if (teachersRes.ok) {
        const teachersData = await teachersRes.json();
        setTeachers(teachersData);
      }

      if (studentsRes.ok) {
        const studentsData = await studentsRes.json();
        setStudents(studentsData);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsLoading(false);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load data. Please refresh the page.',
      });
    }
  };

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

  const handleClassChange = (classId: number) => {
    setFormData(prev => {
      const newAssignedClasses = prev.assignedClasses.includes(classId)
        ? prev.assignedClasses.filter(id => id !== classId)
        : [...prev.assignedClasses, classId];
      
      // Filter out students that are not in the newly selected classes or not active
      const filteredStudentIds = students
        .filter(student => 
          newAssignedClasses.includes(student.currentClassId) && 
          student.status === 'active'
        )
        .map(student => student.id);
      
      const newAssignedStudents = prev.assignedStudents.filter(studentId =>
        filteredStudentIds.includes(studentId)
      );
      
      return {
        ...prev,
        assignedClasses: newAssignedClasses,
        assignedStudents: newAssignedStudents
      };
    });
  };

  const handleStudentChange = (studentId: number) => {
    setFormData(prev => ({
      ...prev,
      assignedStudents: prev.assignedStudents.includes(studentId)
        ? prev.assignedStudents.filter(id => id !== studentId)
        : [...prev.assignedStudents, studentId]
    }));
  };

  const handleSelectAllStudents = () => {
    if (formData.assignedStudents.length === filteredStudents.length) {
      // Deselect all
      setFormData(prev => ({
        ...prev,
        assignedStudents: []
      }));
    } else {
      // Select all filtered students
      setFormData(prev => ({
        ...prev,
        assignedStudents: filteredStudents.map(student => student.id)
      }));
    }
  };

  const handleTeacherChange = (teacherId: number) => {
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
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/teacher/login');
        return;
      }

      const response = await fetch('http://localhost:3001/assignments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          maxScore: parseInt(formData.maxScore),
        }),
      });

      if (response.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Assignment created successfully!',
          confirmButtonColor: '#ffc107',
        });
        
        // Redirect to tasks list
        router.push('/teacher/tasks');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create assignment');
      }
    } catch (error: any) {
      console.error('Error creating assignment:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to create assignment. Please try again.',
        confirmButtonColor: '#dc3545',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-warning" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <div className="bg-white shadow-sm border-bottom">
        <div className="container-fluid py-3">
          <div className="d-flex align-items-center gap-3">
            <Link href="/teacher/tasks" className="btn btn-outline-secondary">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="h3 mb-0 fw-bold text-dark">
                <i className="fas fa-tasks me-2 text-primary"></i>
                Create New Assignment
              </h1>
              <p className="text-muted mb-0">Create a new assignment for your students</p>
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
                  {/* Basic Assignment Information */}
                  <div className="mb-5">
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <div className="bg-warning bg-opacity-10 p-3 rounded-circle">
                        <FileText size={24} className="text-warning" />
                      </div>
                      <h3 className="mb-0 fw-bold text-dark">Basic Assignment Information</h3>
                    </div>
                    <div className="row g-4">
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
                  <div className="mb-5">
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <div className="bg-primary bg-opacity-10 p-3 rounded-circle">
                        <Clock size={24} className="text-primary" />
                      </div>
                      <h3 className="mb-0 fw-bold text-dark">Due Date & Scoring</h3>
                    </div>
                    <div className="row g-4">
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
                  <div className="mb-5">
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <div className="bg-info bg-opacity-10 p-3 rounded-circle">
                        <FileText size={24} className="text-info" />
                      </div>
                      <h3 className="mb-0 fw-bold text-dark">Instructions & Rubric</h3>
                    </div>
                    <div className="row g-4">
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
                  <div className="mb-5">
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <div className="bg-secondary bg-opacity-10 p-3 rounded-circle">
                        <Tag size={24} className="text-secondary" />
                      </div>
                      <h3 className="mb-0 fw-bold text-dark">Tags & Categories</h3>
                    </div>
                    <div className="row g-4">
                      <div className="col-12">
                        <label className="form-label fw-semibold">Select Tags</label>
                        <div className="border rounded p-4">
                          <div className="row g-3">
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
                  <div className="mb-5">
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <div className="bg-success bg-opacity-10 p-3 rounded-circle">
                        <Repeat size={24} className="text-success" />
                      </div>
                      <h3 className="mb-0 fw-bold text-dark">Recurring Options</h3>
                    </div>
                    <div className="row g-4">
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
                  <div className="mb-5">
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <div className="bg-warning bg-opacity-10 p-3 rounded-circle">
                        <Users size={24} className="text-warning" />
                      </div>
                      <h3 className="mb-0 fw-bold text-dark">Assignment Targets</h3>
                    </div>
                    <div className="row g-4">
                      <div className="col-12">
                        <label className="form-label fw-semibold">Assign to Classes</label>
                        <div className="border rounded p-4">
                          {classes.length === 0 ? (
                            <p className="text-muted mb-0">No classes available</p>
                          ) : (
                            <div className="row g-3">
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
                                      Class {cls.name || `${cls.grade}-${cls.section}`}
                                    </label>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          Assign to Specific Students
                          {filteredStudents.length > 0 && (
                            <span className="badge bg-primary ms-2">{filteredStudents.length} Students</span>
                          )}
                        </label>
                        <div className="border rounded p-3">
                          {formData.assignedClasses.length === 0 ? (
                            <p className="text-muted mb-0 small">
                              <i className="fas fa-info-circle me-2"></i>
                              Please select classes first
                            </p>
                          ) : filteredStudents.length === 0 ? (
                            <p className="text-muted mb-0 small">
                              <i className="fas fa-users-slash me-2"></i>
                              No students in selected classes
                            </p>
                          ) : (
                            <>
                              {filteredStudents.length > 5 && (
                                <div className="form-check mb-3 pb-3 border-bottom">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="select-all-students"
                                    checked={formData.assignedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                                    onChange={handleSelectAllStudents}
                                  />
                                  <label className="form-check-label fw-bold" htmlFor="select-all-students">
                                    <i className="fas fa-check-double me-2"></i>
                                    Select All ({filteredStudents.length} students)
                                  </label>
                                </div>
                              )}
                              <div style={{maxHeight: '200px', overflowY: 'auto'}}>
                                {filteredStudents.map((student) => (
                                  <div key={student.id} className="form-check mb-2">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      id={`student-${student.id}`}
                                      checked={formData.assignedStudents.includes(student.id)}
                                      onChange={() => handleStudentChange(student.id)}
                                    />
                                    <label className="form-check-label" htmlFor={`student-${student.id}`}>
                                      {student.firstName} {student.lastName}
                                      {student.className && (
                                        <span className="text-muted small"> ({student.className})</span>
                                      )}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>


                      {errors.assignment && (
                        <div className="col-12">
                          <div className="text-danger small">{errors.assignment}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="d-flex gap-3 justify-content-end pt-4 border-top">
                    <Link href="/teacher/tasks" className="btn btn-secondary btn-lg px-5">
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
        </div>
      </div>
    </div>
  );
}
