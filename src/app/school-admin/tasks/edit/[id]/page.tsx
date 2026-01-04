'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, BookOpen, Users, FileText, Tag, Clock, Star, Repeat, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { useRouter, useParams } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api';

export default function EditTaskPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    priority: '',
    status: 'pending',
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
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Filter students based on selected classes (only show active students)
  const filteredStudents = formData.assignedClasses.length > 0
    ? students.filter(student => 
        formData.assignedClasses.includes(student.currentClassId || student.classId) && 
        student.status === 'active'
      )
    : [];

  const assignmentTypes = [
    'assignment', 'homework', 'project', 'quiz', 'exam'
  ];

  const priorityLevels = ['low', 'medium', 'high', 'urgent'];

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'warning' },
    { value: 'in-progress', label: 'In Progress', color: 'info' },
    { value: 'completed', label: 'Completed', color: 'success' },
    { value: 'overdue', label: 'Overdue', color: 'danger' }
  ];

  const recurringPatterns = [
    'Daily', 'Weekly', 'Bi-weekly', 'Monthly', 'Quarterly'
  ];

  const availableTags = [
    'Mathematics', 'Science', 'English', 'History', 'Geography', 
    'Computer Science', 'Art', 'Music', 'Physical Education', 'Critical Thinking'
  ];

  // Fetch data on component mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
    fetchData();
  }, [taskId]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/school-admin/login');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Fetch assignment, classes, teachers, and students in parallel
      const [assignmentRes, classesRes, teachersRes, studentsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/assignments/${taskId}`, { headers }),
        fetch(`${API_BASE_URL}/classes`, { headers }),
        fetch(`${API_BASE_URL}/teachers`, { headers }),
        fetch(`${API_BASE_URL}/students`, { headers }),
      ]);

      if (assignmentRes.ok) {
        const assignmentData = await assignmentRes.json();

        // Parse date for datetime-local input
        const dueDate = new Date(assignmentData.dueDate);
        const formattedDate = dueDate.toISOString().slice(0, 16);

        setFormData({
          title: assignmentData.title || '',
          description: assignmentData.description || '',
          type: assignmentData.type || '',
          priority: assignmentData.priority || '',
          status: assignmentData.status || 'pending',
          dueDate: formattedDate,
          maxScore: assignmentData.maxScore?.toString() || '',
          instructions: assignmentData.instructions || '',
          rubric: assignmentData.rubric || '',
          tags: assignmentData.tags || [],
          isRecurring: assignmentData.isRecurring || false,
          recurringPattern: assignmentData.recurringPattern || '',
          assignedClasses: assignmentData.assignedClasses || [],
          assignedStudents: assignmentData.assignedStudents || [],
          assignedTeachers: assignmentData.assignedTeachers || [],
        });
      } else {
        throw new Error('Failed to fetch task');
      }

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
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load task. Please try again.',
      });
      router.push('/school-admin/tasks');
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
          newAssignedClasses.includes(student.currentClassId || student.classId) && 
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

  const getTeacherName = (teacherId: number) => {
    const teacher = teachers.find(t => t.id === teacherId);
    if (!teacher) return `Teacher ${teacherId}`;
    return teacher.firstName && teacher.lastName 
      ? `${teacher.firstName} ${teacher.lastName}`
      : teacher.name || teacher.username || `Teacher ${teacherId}`;
  };

  const validateForm = () => {
    const newErrors: any = {};
    
    if (!formData.title.trim()) newErrors.title = 'Task title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.type.trim()) newErrors.type = 'Task type is required';
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
        router.push('/school-admin/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/assignments/${taskId}`, {
        method: 'PATCH',
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
          text: 'Task updated successfully!',
          confirmButtonColor: '#0d6efd',
        });
        
        // Redirect to tasks list
        router.push('/school-admin/tasks');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update task');
      }
    } catch (error: any) {
      console.error('Error updating task:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to update task. Please try again.',
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
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading task...</p>
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
            <Link href="/school-admin/tasks" className="btn btn-outline-secondary">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="h3 mb-0 fw-bold text-dark">
                <i className="fas fa-edit me-2 text-primary"></i>
                Edit Task
              </h1>
              <p className="text-muted mb-0">Update task details and assignments</p>
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
                  {/* Basic Task Information */}
                  <div className="mb-5">
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <div className="bg-primary bg-opacity-10 p-3 rounded-circle">
                        <FileText size={24} className="text-primary" />
                      </div>
                      <h3 className="mb-0 fw-bold text-dark">Basic Task Information</h3>
                    </div>
                    <div className="row g-4">
                      <div className="col-12">
                        <label className="form-label fw-semibold">
                          Task Title <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          className={`form-control form-control-lg ${errors.title ? 'is-invalid' : ''}`}
                          placeholder="Enter task title"
                        />
                        {errors.title && (
                          <div className="invalid-feedback">{errors.title}</div>
                        )}
                      </div>

                      <div className="col-md-4">
                        <label className="form-label fw-semibold">
                          Task Type <span className="text-danger">*</span>
                        </label>
                        <select
                          name="type"
                          value={formData.type}
                          onChange={handleInputChange}
                          className={`form-select form-select-lg ${errors.type ? 'is-invalid' : ''}`}
                        >
                          <option value="">Select Type</option>
                          {assignmentTypes.map((type) => (
                            <option key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </option>
                          ))}
                        </select>
                        {errors.type && (
                          <div className="invalid-feedback">{errors.type}</div>
                        )}
                      </div>

                      <div className="col-md-4">
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
                            <option key={priority} value={priority}>
                              {priority.charAt(0).toUpperCase() + priority.slice(1)}
                            </option>
                          ))}
                        </select>
                        {errors.priority && (
                          <div className="invalid-feedback">{errors.priority}</div>
                        )}
                      </div>

                      <div className="col-md-4">
                        <label className="form-label fw-semibold">
                          Status <span className="text-danger">*</span>
                        </label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className="form-select form-select-lg"
                        >
                          {statusOptions.map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                        <small className="text-muted">Current status of the task</small>
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
                          placeholder="Detailed description of the task..."
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
                      <div className="bg-warning bg-opacity-10 p-3 rounded-circle">
                        <Clock size={24} className="text-warning" />
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
                          placeholder="Step-by-step instructions for completing the task..."
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
                              <div key={tag} className="col-md-4">
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

                  {/* Recurring Settings */}
                  <div className="mb-5">
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <div className="bg-success bg-opacity-10 p-3 rounded-circle">
                        <Repeat size={24} className="text-success" />
                      </div>
                      <h3 className="mb-0 fw-bold text-dark">Recurring Settings</h3>
                    </div>
                    <div className="row g-4">
                      <div className="col-12">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="isRecurring"
                            name="isRecurring"
                            checked={formData.isRecurring}
                            onChange={handleInputChange}
                          />
                          <label className="form-check-label fw-semibold" htmlFor="isRecurring">
                            This is a recurring task
                          </label>
                        </div>
                      </div>

                      {formData.isRecurring && (
                        <div className="col-12">
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

                  {/* Task Distribution */}
                  <div className="mb-5">
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <div className="bg-danger bg-opacity-10 p-3 rounded-circle">
                        <Users size={24} className="text-danger" />
                      </div>
                      <h3 className="mb-0 fw-bold text-dark">Assign To</h3>
                    </div>

                    {errors.assignment && (
                      <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
                        <AlertCircle size={20} className="me-2" />
                        <div>{errors.assignment}</div>
                      </div>
                    )}

                    {/* Classes Selection */}
                    <div className="mb-4">
                      <label className="form-label fw-semibold d-flex align-items-center gap-2">
                        <BookOpen size={18} />
                        Select Classes
                      </label>
                      <div className="border rounded p-4" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {classes.length === 0 ? (
                          <p className="text-muted mb-0">No classes available</p>
                        ) : (
                          <div className="row g-3">
                            {classes.map((cls) => (
                              <div key={cls.id} className="col-md-6">
                                <div className="form-check">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id={`class-${cls.id}`}
                                    checked={formData.assignedClasses.includes(cls.id)}
                                    onChange={() => handleClassChange(cls.id)}
                                  />
                                  <label className="form-check-label" htmlFor={`class-${cls.id}`}>
                                    {cls.name || `Class ${cls.grade}-${cls.section}`}
                                  </label>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Students Selection */}
                    {formData.assignedClasses.length > 0 ? (
                      <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <label className="form-label fw-semibold d-flex align-items-center gap-2 mb-0">
                            <Users size={18} />
                            Select Students from Selected Classes
                          </label>
                          {filteredStudents.length > 0 && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={handleSelectAllStudents}
                            >
                              {formData.assignedStudents.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
                            </button>
                          )}
                        </div>
                        <div className="border rounded p-4" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                          {filteredStudents.length === 0 ? (
                            <div className="alert alert-info mb-0">
                              <AlertCircle size={16} className="me-2" />
                              No active students found in selected classes
                            </div>
                          ) : (
                            <>
                              <div className="mb-3 text-muted small">
                                Showing {filteredStudents.length} student(s) from selected classes
                              </div>
                              <div className="row g-3">
                                {filteredStudents.map((student) => (
                                  <div key={student.id} className="col-md-6">
                                    <div className="form-check">
                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id={`student-${student.id}`}
                                        checked={formData.assignedStudents.includes(student.id)}
                                        onChange={() => handleStudentChange(student.id)}
                                      />
                                      <label className="form-check-label" htmlFor={`student-${student.id}`}>
                                        {student.firstName} {student.lastName}
                                        <small className="text-muted ms-2">
                                          ({classes.find(c => c.id === (student.currentClassId || student.classId))?.name || 'N/A'})
                                        </small>
                                      </label>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                        {formData.assignedStudents.length > 0 && (
                          <small className="text-muted mt-2 d-block">
                            {formData.assignedStudents.length} student(s) selected
                          </small>
                        )}
                      </div>
                    ) : (
                      <div className="alert alert-info mb-4">
                        <AlertCircle size={16} className="me-2" />
                        Please select classes first to see students
                      </div>
                    )}

                    {/* Teachers Selection */}
                    <div className="mb-4">
                      <label className="form-label fw-semibold d-flex align-items-center gap-2">
                        <Users size={18} />
                        Assign to Teachers (Optional)
                      </label>
                      <div className="border rounded p-4" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {teachers.length === 0 ? (
                          <p className="text-muted mb-0">No teachers available</p>
                        ) : (
                          <div className="row g-3">
                            {teachers.map((teacher) => (
                              <div key={teacher.id} className="col-md-6">
                                <div className="form-check">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id={`teacher-${teacher.id}`}
                                    checked={formData.assignedTeachers.includes(teacher.id)}
                                    onChange={() => handleTeacherChange(teacher.id)}
                                  />
                                  <label className="form-check-label" htmlFor={`teacher-${teacher.id}`}>
                                    {getTeacherName(teacher.id)}
                                  </label>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="d-flex justify-content-between gap-3">
                    <Link href="/school-admin/tasks" className="btn btn-lg btn-outline-secondary">
                      <ArrowLeft size={18} className="me-2" />
                      Cancel
                    </Link>
                    <button
                      type="submit"
                      className="btn btn-lg btn-primary px-5"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Updating...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-2"></i>
                          Update Task
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












