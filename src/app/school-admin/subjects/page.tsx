'use client';

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import Link from 'next/link';
import { getStoredToken, getStoredUser, apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { showSuccess, showError, showConfirm, showLoading, closeLoading } from '@/lib/sweetalert';

interface Subject {
  id: number;
  name: string;
  code: string;
  description?: string;
  status: 'active' | 'inactive';
  schoolId: number;
  gradeLevel?: string;
  totalMarks?: number;
  passingMarks?: number;
  isElective: number;
  color?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

interface SubjectFormData {
  name: string;
  code: string;
  description: string;
  gradeLevel: string;
  totalMarks: string;
  passingMarks: string;
  isElective: boolean;
  color: string;
  icon: string;
  status: 'active' | 'inactive';
}

const defaultFormData: SubjectFormData = {
  name: '',
  code: '',
  description: '',
  gradeLevel: '',
  totalMarks: '100',
  passingMarks: '33',
  isElective: false,
  color: '#3B82F6',
  icon: '📚',
  status: 'active'
};

const gradeOptions = [
  'All Grades', 'Nursery', 'LKG', 'UKG', 
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'
];

const iconOptions = [
  '📚', '📖', '✏️', '🔬', '🧮', '🌍', '🎨', '🎵', '⚽', '💻', '🔭', '📐', '🧪', '📝', '🎭', '🏃'
];

const colorOptions = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', 
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
];

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterGrade, setFilterGrade] = useState('all');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState<SubjectFormData>(defaultFormData);
  const [formErrors, setFormErrors] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch subjects
  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const token = getStoredToken();
      if (!token) {
        await showError('Authentication Required', 'Please login again.');
        return;
      }

      const response = await apiGet<Subject[]>('/subjects', { token });
      setSubjects(response);
      setFilteredSubjects(response);
    } catch (error: any) {
      console.error('Error fetching subjects:', error);
      await showError('Failed to Load Subjects', error?.message || 'Unable to fetch subjects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  // Filter subjects
  useEffect(() => {
    let filtered = [...subjects];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(subject =>
        subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subject.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(subject => subject.status === filterStatus);
    }

    // Filter by grade
    if (filterGrade !== 'all') {
      if (filterGrade === 'All Grades') {
        filtered = filtered.filter(subject => !subject.gradeLevel || subject.gradeLevel === 'All Grades');
      } else {
        filtered = filtered.filter(subject => subject.gradeLevel === filterGrade);
      }
    }

    setFilteredSubjects(filtered);
  }, [subjects, searchTerm, filterStatus, filterGrade]);

  // Open modal for create
  const handleCreateClick = () => {
    setModalMode('create');
    setEditingSubject(null);
    setFormData(defaultFormData);
    setFormErrors({});
    setShowModal(true);
  };

  // Open modal for edit
  const handleEditClick = (subject: Subject) => {
    setModalMode('edit');
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code,
      description: subject.description || '',
      gradeLevel: subject.gradeLevel || '',
      totalMarks: subject.totalMarks?.toString() || '100',
      passingMarks: subject.passingMarks?.toString() || '33',
      isElective: Boolean(subject.isElective),
      color: subject.color || '#3B82F6',
      icon: subject.icon || '📚',
      status: subject.status
    });
    setFormErrors({});
    setShowModal(true);
  };

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors: any = {};
    
    if (!formData.name.trim()) errors.name = 'Subject name is required';
    if (!formData.code.trim()) errors.code = 'Subject code is required';
    
    if (formData.totalMarks && parseInt(formData.totalMarks) <= 0) {
      errors.totalMarks = 'Total marks must be greater than 0';
    }
    
    if (formData.passingMarks && formData.totalMarks) {
      const passing = parseInt(formData.passingMarks);
      const total = parseInt(formData.totalMarks);
      if (passing > total) {
        errors.passingMarks = 'Passing marks cannot be greater than total marks';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      const token = getStoredToken();
      
      if (!token) {
        await showError('Authentication Error', 'Please login again.');
        return;
      }

      const subjectData = {
        name: formData.name,
        code: formData.code,
        description: formData.description || undefined,
        // schoolId will be extracted from JWT token on backend
        gradeLevel: formData.gradeLevel || undefined,
        totalMarks: formData.totalMarks ? parseInt(formData.totalMarks) : undefined,
        passingMarks: formData.passingMarks ? parseInt(formData.passingMarks) : undefined,
        isElective: formData.isElective,
        color: formData.color,
        icon: formData.icon,
        status: formData.status
      };

      showLoading(
        modalMode === 'create' ? 'Creating Subject' : 'Updating Subject',
        'Please wait...'
      );

      if (modalMode === 'create') {
        await apiPost('/subjects', subjectData, { token });
        closeLoading();
        await showSuccess('Subject Created!', `${formData.name} has been added successfully.`);
      } else if (editingSubject) {
        await apiPut(`/subjects/${editingSubject.id}`, subjectData, { token });
        closeLoading();
        await showSuccess('Subject Updated!', `${formData.name} has been updated successfully.`);
      }

      setShowModal(false);
      fetchSubjects();
      
    } catch (error: any) {
      closeLoading();
      console.error('Error saving subject:', error);
      await showError(
        'Failed to Save Subject',
        error?.message || 'Unable to save subject. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (subject: Subject) => {
    const confirmed = await showConfirm(
      'Delete Subject?',
      `Are you sure you want to delete "${subject.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const token = getStoredToken();
      if (!token) {
        await showError('Authentication Required', 'Please login again.');
        return;
      }

      showLoading('Deleting Subject', 'Please wait...');
      await apiDelete(`/subjects/${subject.id}`, { token });
      closeLoading();
      
      await showSuccess('Subject Deleted!', `${subject.name} has been deleted successfully.`);
      fetchSubjects();
      
    } catch (error: any) {
      closeLoading();
      console.error('Error deleting subject:', error);
      await showError('Failed to Delete Subject', error?.message || 'Unable to delete subject.');
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading subjects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <div className="bg-white shadow-sm border-bottom">
        <div className="container-fluid py-4">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <Link href="/school-admin/dashboard" className="btn btn-outline-secondary">
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="h3 mb-0 fw-bold text-dark">
                  <BookOpen size={28} className="me-2 text-primary" />
                  Subjects Management
                </h1>
                <p className="text-muted mb-0">Create and manage subjects for your school</p>
              </div>
            </div>
            <button 
              onClick={handleCreateClick}
              className="btn btn-primary btn-lg d-flex align-items-center gap-2"
            >
              <Plus size={20} />
              Add New Subject
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container-fluid py-4">
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-4">
                <div className="input-group">
                  <span className="input-group-text bg-light border-0">
                    <Search size={18} className="text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-0"
                    placeholder="Search subjects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={filterGrade}
                  onChange={(e) => setFilterGrade(e.target.value)}
                >
                  <option value="all">All Grades</option>
                  {gradeOptions.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-2">
                <div className="d-flex align-items-center gap-2 h-100">
                  <Filter size={18} className="text-muted" />
                  <span className="text-muted">
                    {filteredSubjects.length} subject{filteredSubjects.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subjects Grid */}
        {filteredSubjects.length === 0 ? (
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-5">
              <BookOpen size={64} className="text-muted mb-3" />
              <h4 className="text-muted">No subjects found</h4>
              <p className="text-muted">
                {searchTerm || filterStatus !== 'all' || filterGrade !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Get started by creating your first subject'}
              </p>
              {!searchTerm && filterStatus === 'all' && filterGrade === 'all' && (
                <button 
                  onClick={handleCreateClick}
                  className="btn btn-primary mt-3"
                >
                  <Plus size={18} className="me-2" />
                  Create First Subject
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {filteredSubjects.map((subject) => (
              <div key={subject.id} className="col-xl-3 col-lg-4 col-md-6">
                <div 
                  className="card border-0 shadow-sm h-100"
                  style={{
                    borderLeft: `4px solid ${subject.color || '#3B82F6'}`,
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12)';
                  }}
                >
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div 
                        className="p-3 rounded-circle"
                        style={{ 
                          backgroundColor: `${subject.color || '#3B82F6'}20`,
                          fontSize: '2rem'
                        }}
                      >
                        {subject.icon || '📚'}
                      </div>
                      <span className={`badge ${subject.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                        {subject.status}
                      </span>
                    </div>
                    
                    <h5 className="fw-bold mb-2">{subject.name}</h5>
                    <p className="text-muted small mb-2">Code: {subject.code}</p>
                    
                    {subject.description && (
                      <p className="text-muted small mb-3" style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {subject.description}
                      </p>
                    )}
                    
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      {subject.gradeLevel && (
                        <span className="badge bg-light text-dark">
                          Grade: {subject.gradeLevel}
                        </span>
                      )}
                      {subject.isElective ? (
                        <span className="badge bg-warning text-dark">Elective</span>
                      ) : (
                        <span className="badge bg-info text-dark">Core</span>
                      )}
                      {subject.totalMarks && (
                        <span className="badge bg-light text-dark">
                          Marks: {subject.totalMarks}
                        </span>
                      )}
                    </div>
                    
                    <div className="d-flex gap-2">
                      <button
                        onClick={() => handleEditClick(subject)}
                        className="btn btn-sm btn-outline-primary flex-grow-1"
                      >
                        <Edit size={14} className="me-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(subject)}
                        className="btn btn-sm btn-outline-danger"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div 
          className="modal fade show d-block" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowModal(false)}
        >
          <div 
            className="modal-dialog modal-lg modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">
                  {modalMode === 'create' ? (
                    <>
                      <Plus size={24} className="me-2 text-primary" />
                      Create New Subject
                    </>
                  ) : (
                    <>
                      <Edit size={24} className="me-2 text-warning" />
                      Edit Subject
                    </>
                  )}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    {/* Subject Name */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Subject Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
                        placeholder="e.g., Mathematics"
                      />
                      {formErrors.name && (
                        <div className="invalid-feedback">{formErrors.name}</div>
                      )}
                    </div>

                    {/* Subject Code */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Subject Code <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="code"
                        value={formData.code}
                        onChange={handleInputChange}
                        className={`form-control ${formErrors.code ? 'is-invalid' : ''}`}
                        placeholder="e.g., MATH101"
                      />
                      {formErrors.code && (
                        <div className="invalid-feedback">{formErrors.code}</div>
                      )}
                    </div>

                    {/* Grade Level */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Grade Level</label>
                      <select
                        name="gradeLevel"
                        value={formData.gradeLevel}
                        onChange={handleInputChange}
                        className="form-select"
                      >
                        <option value="">All Grades</option>
                        {gradeOptions.map(grade => (
                          <option key={grade} value={grade}>{grade}</option>
                        ))}
                      </select>
                    </div>

                    {/* Status */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="form-select"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>

                    {/* Total Marks */}
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Total Marks</label>
                      <input
                        type="number"
                        name="totalMarks"
                        value={formData.totalMarks}
                        onChange={handleInputChange}
                        className={`form-control ${formErrors.totalMarks ? 'is-invalid' : ''}`}
                        placeholder="100"
                        min="0"
                      />
                      {formErrors.totalMarks && (
                        <div className="invalid-feedback">{formErrors.totalMarks}</div>
                      )}
                    </div>

                    {/* Passing Marks */}
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Passing Marks</label>
                      <input
                        type="number"
                        name="passingMarks"
                        value={formData.passingMarks}
                        onChange={handleInputChange}
                        className={`form-control ${formErrors.passingMarks ? 'is-invalid' : ''}`}
                        placeholder="33"
                        min="0"
                      />
                      {formErrors.passingMarks && (
                        <div className="invalid-feedback">{formErrors.passingMarks}</div>
                      )}
                    </div>

                    {/* Is Elective */}
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Type</label>
                      <div className="form-check form-switch mt-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="isElective"
                          checked={formData.isElective}
                          onChange={handleInputChange}
                          id="isElective"
                        />
                        <label className="form-check-label" htmlFor="isElective">
                          {formData.isElective ? 'Elective' : 'Core'}
                        </label>
                      </div>
                    </div>

                    {/* Icon */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Icon</label>
                      <div className="d-flex flex-wrap gap-2">
                        {iconOptions.map(icon => (
                          <button
                            key={icon}
                            type="button"
                            className={`btn ${formData.icon === icon ? 'btn-primary' : 'btn-outline-secondary'}`}
                            onClick={() => setFormData(prev => ({ ...prev, icon }))}
                            style={{ fontSize: '1.5rem', padding: '0.5rem 1rem' }}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Color */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Color</label>
                      <div className="d-flex flex-wrap gap-2">
                        {colorOptions.map(color => (
                          <button
                            key={color}
                            type="button"
                            className="btn p-0 border"
                            onClick={() => setFormData(prev => ({ ...prev, color }))}
                            style={{
                              width: '40px',
                              height: '40px',
                              backgroundColor: color,
                              border: formData.color === color ? '3px solid #000' : '1px solid #ddd',
                              borderRadius: '8px'
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="col-12">
                      <label className="form-label fw-semibold">Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="form-control"
                        rows={3}
                        placeholder="Brief description of the subject..."
                      />
                    </div>
                  </div>
                </div>
                
                <div className="modal-footer border-0">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={18} className="me-2" />
                        {modalMode === 'create' ? 'Create Subject' : 'Update Subject'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
