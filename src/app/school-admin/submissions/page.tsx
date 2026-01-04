'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, Download, Eye, Filter, Search, MessageSquare, Send, Award, CheckCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '@/lib/api';

interface Submission {
  id: number;
  taskId: number;
  studentId: number;
  status: string;
  content: string;
  attachments: any[];
  submittedAt: string;
  grade?: number;
  feedback?: string;
  student?: {
    firstName: string;
    lastName: string;
    email: string;
    className?: string;
  };
  task?: {
    title: string;
    maxScore: number;
    type: string;
  };
}

export default function SchoolAdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  
  // Review/Grading states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [teacherNotes, setTeacherNotes] = useState('');
  const [reviewStatus, setReviewStatus] = useState<'reviewed' | 'approved' | 'rejected' | 'resubmit'>('reviewed');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Fetching submissions for school admin:', user.schoolId);

      // School admin can see all submissions from their school
      const schoolId = user.schoolId || user.id;
      const response = await fetch(`${API_BASE_URL}/submissions/school/${schoolId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Failed to fetch submissions:', errorData);
        throw new Error(`Failed to fetch submissions: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched submissions:', data.length);
      setSubmissions(data);
    } catch (error: any) {
      console.error('Error fetching submissions:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to fetch submissions',
        footer: 'Check console for more details'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    setShowViewModal(true);
  };

  const handleStartReview = (submission: Submission) => {
    setSelectedSubmission(submission);
    setGrade(submission.grade?.toString() || '');
    setFeedback(submission.feedback || '');
    setTeacherNotes('');
    setReviewStatus(submission.status === 'submitted' ? 'reviewed' : submission.status as any);
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedSubmission) return;

    // Validation
    if (!grade || parseFloat(grade) < 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Grade',
        text: 'Please enter a valid grade (0 or higher)',
      });
      return;
    }

    if (parseFloat(grade) > (selectedSubmission.task?.maxScore || 100)) {
      Swal.fire({
        icon: 'warning',
        title: 'Grade Too High',
        text: `Grade cannot exceed ${selectedSubmission.task?.maxScore}`,
      });
      return;
    }

    if (!feedback.trim()) {
      const result = await Swal.fire({
        icon: 'question',
        title: 'No Feedback',
        text: 'Are you sure you want to submit without feedback?',
        showCancelButton: true,
        confirmButtonText: 'Yes, Submit',
        cancelButtonText: 'Cancel',
      });

      if (!result.isConfirmed) return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/submissions/${selectedSubmission.id}/review`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          grade: parseFloat(grade),
          feedback: feedback.trim(),
          teacherNotes: teacherNotes.trim(),
          status: reviewStatus
        })
      });

      if (response.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'Review Submitted!',
          text: 'Your review has been saved successfully',
          confirmButtonColor: '#10b981',
        });
        setShowReviewModal(false);
        setShowViewModal(false);
        fetchSubmissions();
      } else {
        throw new Error('Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to submit review. Please try again.',
      });
    }
  };

  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = 
      sub.student?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.student?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.task?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      draft: { class: 'bg-warning', label: 'Draft' },
      submitted: { class: 'bg-info', label: 'Submitted' },
      reviewed: { class: 'bg-primary', label: 'Reviewed' },
      approved: { class: 'bg-success', label: 'Approved' },
      rejected: { class: 'bg-danger', label: 'Rejected' },
    };

    const config = statusConfig[status] || statusConfig.submitted;
    return <span className={`badge ${config.class}`}>{config.label}</span>;
  };

  const getTypeBadge = (type: string) => {
    const typeColors: any = {
      assignment: 'bg-primary',
      homework: 'bg-success',
      project: 'bg-info',
      quiz: 'bg-warning',
      exam: 'bg-danger'
    };
    return <span className={`badge ${typeColors[type?.toLowerCase()] || 'bg-secondary'}`}>{type}</span>;
  };

  // Calculate statistics
  const stats = {
    total: submissions.length,
    submitted: submissions.filter(s => s.status === 'submitted').length,
    reviewed: submissions.filter(s => s.status === 'reviewed' || s.status === 'approved').length,
    pending: submissions.filter(s => s.status === 'draft').length,
  };

  if (loading) {
    return (
      <div className="container-fluid">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <Link href="/school-admin/dashboard" className="btn btn-outline-secondary me-3">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="h3 mb-0">All Submissions</h1>
            <p className="text-muted mb-0">View all student submissions across the school</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="bg-primary bg-opacity-10 rounded-circle p-3 mx-auto mb-3" style={{width: '60px', height: '60px'}}>
                <FileText size={24} className="text-primary" />
              </div>
              <h4 className="mb-1">{stats.total}</h4>
              <p className="text-muted mb-0">Total Submissions</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="bg-info bg-opacity-10 rounded-circle p-3 mx-auto mb-3" style={{width: '60px', height: '60px'}}>
                <FileText size={24} className="text-info" />
              </div>
              <h4 className="mb-1">{stats.submitted}</h4>
              <p className="text-muted mb-0">Awaiting Review</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="bg-success bg-opacity-10 rounded-circle p-3 mx-auto mb-3" style={{width: '60px', height: '60px'}}>
                <FileText size={24} className="text-success" />
              </div>
              <h4 className="mb-1">{stats.reviewed}</h4>
              <p className="text-muted mb-0">Reviewed</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="bg-warning bg-opacity-10 rounded-circle p-3 mx-auto mb-3" style={{width: '60px', height: '60px'}}>
                <FileText size={24} className="text-warning" />
              </div>
              <h4 className="mb-1">{stats.pending}</h4>
              <p className="text-muted mb-0">Draft</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by student name or assignment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="reviewed">Reviewed</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="card">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">All Submissions</h5>
            <span className="badge bg-primary">{filteredSubmissions.length} submissions</span>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Student</th>
                  <th>Class</th>
                  <th>Assignment</th>
                  <th>Type</th>
                  <th>Submitted At</th>
                  <th>Status</th>
                  <th>Grade</th>
                  <th>Attachments</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map(submission => (
                  <tr key={submission.id}>
                    <td>
                      <div>
                        <div className="fw-bold">
                          {submission.student?.firstName} {submission.student?.lastName}
                        </div>
                        <small className="text-muted">{submission.student?.email}</small>
                      </div>
                    </td>
                    <td>
                      {submission.student?.className ? (
                        <span className="badge bg-secondary">{submission.student.className}</span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      <div className="fw-semibold">{submission.task?.title}</div>
                      <small className="text-muted">Max: {submission.task?.maxScore} pts</small>
                    </td>
                    <td>{getTypeBadge(submission.task?.type || 'assignment')}</td>
                    <td>
                      <small>{new Date(submission.submittedAt).toLocaleString()}</small>
                    </td>
                    <td>{getStatusBadge(submission.status)}</td>
                    <td>
                      {submission.grade ? (
                        <span className="fw-bold text-success">
                          {submission.grade} / {submission.task?.maxScore}
                        </span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      {submission.attachments && submission.attachments.length > 0 ? (
                        <span className="badge bg-secondary">
                          <i className="fas fa-paperclip me-1"></i>
                          {submission.attachments.length}
                        </span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleViewSubmission(submission)}
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-success"
                          onClick={() => handleStartReview(submission)}
                          title="Review & Grade"
                        >
                          <MessageSquare size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSubmissions.length === 0 && (
            <div className="text-center py-5">
              <FileText size={48} className="text-muted mb-3" />
              <h5>No submissions found</h5>
              <p className="text-muted">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>

      {/* View Submission Modal */}
      {showViewModal && selectedSubmission && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <FileText size={20} className="me-2" />
                  Submission Details
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowViewModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Student:</strong> {selectedSubmission.student?.firstName} {selectedSubmission.student?.lastName}
                  </div>
                  <div className="col-md-6">
                    <strong>Class:</strong> {selectedSubmission.student?.className || '-'}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Assignment:</strong> {selectedSubmission.task?.title}
                  </div>
                  <div className="col-md-6">
                    <strong>Type:</strong> {getTypeBadge(selectedSubmission.task?.type || 'assignment')}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Submitted:</strong> {new Date(selectedSubmission.submittedAt).toLocaleString()}
                  </div>
                  <div className="col-md-6">
                    <strong>Status:</strong> {getStatusBadge(selectedSubmission.status)}
                  </div>
                </div>
                <hr />
                <div className="mb-3">
                  <strong>Content:</strong>
                  <div className="p-3 bg-light rounded mt-2">
                    {selectedSubmission.content || <em className="text-muted">No content provided</em>}
                  </div>
                </div>
                
                {/* Display Attachments */}
                {selectedSubmission.attachments && selectedSubmission.attachments.length > 0 && (
                  <div className="mb-3">
                    <strong>Attachments:</strong>
                    <div className="list-group mt-2">
                      {selectedSubmission.attachments.map((file: any, index: number) => (
                        <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                          <div>
                            <i className={`fas ${
                              file.mimetype?.includes('image') ? 'fa-image text-primary' : 
                              file.mimetype?.includes('pdf') ? 'fa-file-pdf text-danger' : 
                              'fa-file text-secondary'
                            } me-2`}></i>
                            <span>{file.originalName}</span>
                            <small className="text-muted ms-2">({(file.size / 1024).toFixed(2)} KB)</small>
                          </div>
                          <div>
                            <a
                              href={`${API_BASE_URL}${file.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-outline-primary me-2"
                            >
                              <Eye size={14} className="me-1" /> View
                            </a>
                            <a
                              href={`${API_BASE_URL}${file.url}`}
                              download={file.originalName}
                              className="btn btn-sm btn-outline-success"
                            >
                              <Download size={14} className="me-1" /> Download
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedSubmission.grade && (
                  <div className="mb-3">
                    <strong>Grade:</strong> 
                    <span className="fw-bold text-success ms-2">
                      {selectedSubmission.grade} / {selectedSubmission.task?.maxScore} 
                      ({((selectedSubmission.grade / (selectedSubmission.task?.maxScore || 1)) * 100).toFixed(1)}%)
                    </span>
                  </div>
                )}

                {selectedSubmission.feedback && (
                  <div className="mb-3">
                    <strong>Teacher Feedback:</strong>
                    <div className="p-3 bg-info bg-opacity-10 rounded mt-2">
                      {selectedSubmission.feedback}
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowViewModal(false)}>Close</button>
                <button 
                  type="button" 
                  className="btn btn-success"
                  onClick={() => {
                    setShowViewModal(false);
                    handleStartReview(selectedSubmission);
                  }}
                >
                  <MessageSquare size={16} className="me-2" />
                  Review & Grade
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedSubmission && (
        <div 
          className="modal show d-block" 
          tabIndex={-1} 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowReviewModal(false)}
        >
          <div 
            className="modal-dialog modal-lg modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-gradient" style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>
                <h5 className="modal-title text-white fw-bold d-flex align-items-center gap-2">
                  <CheckCircle size={24} />
                  Review & Grade Submission
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowReviewModal(false)}
                ></button>
              </div>

              <div className="modal-body">
                {/* Student & Assignment Info */}
                <div className="card border-0 bg-light mb-3">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6">
                        <small className="text-muted">Student</small>
                        <p className="mb-0 fw-semibold">
                          {selectedSubmission.student?.firstName} {selectedSubmission.student?.lastName}
                        </p>
                        <small className="text-muted">{selectedSubmission.student?.email}</small>
                      </div>
                      <div className="col-md-6">
                        <small className="text-muted">Assignment</small>
                        <p className="mb-0 fw-semibold">{selectedSubmission.task?.title}</p>
                        <small className="text-muted">Max Score: {selectedSubmission.task?.maxScore} pts</small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submission Content Preview */}
                <div className="card border-0 bg-light mb-3">
                  <div className="card-body">
                    <small className="text-muted">Submission Content:</small>
                    <div className="mt-2" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                      {selectedSubmission.content || <em className="text-muted">No content provided</em>}
                    </div>
                  </div>
                </div>

                {/* Grade Input */}
                <div className="mb-3">
                  <label className="form-label fw-semibold d-flex align-items-center gap-2">
                    <Award size={18} className="text-warning" />
                    Grade (out of {selectedSubmission.task?.maxScore}) <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className="form-control form-control-lg"
                    min="0"
                    max={selectedSubmission.task?.maxScore}
                    step="0.5"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="Enter grade"
                  />
                  {grade && (
                    <small className="text-muted mt-1 d-block">
                      Percentage: {((parseFloat(grade) / (selectedSubmission.task?.maxScore || 100)) * 100).toFixed(1)}%
                    </small>
                  )}
                </div>

                {/* Status Selection */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Status</label>
                  <select
                    className="form-select"
                    value={reviewStatus}
                    onChange={(e) => setReviewStatus(e.target.value as any)}
                  >
                    <option value="reviewed">Reviewed</option>
                    <option value="approved">Approved ✅</option>
                    <option value="rejected">Rejected ❌</option>
                    <option value="resubmit">Resubmit Required 🔄</option>
                  </select>
                </div>

                {/* Feedback */}
                <div className="mb-3">
                  <label className="form-label fw-semibold d-flex align-items-center gap-2">
                    <MessageSquare size={18} className="text-info" />
                    Feedback for Student
                  </label>
                  <textarea
                    className="form-control"
                    rows={5}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Provide detailed feedback to help the student improve..."
                  />
                  <small className="text-muted">This will be visible to the student</small>
                </div>

                {/* Teacher Notes (Private) */}
                <div className="mb-3">
                  <label className="form-label fw-semibold d-flex align-items-center gap-2">
                    <FileText size={18} className="text-warning" />
                    Private Notes (Optional)
                  </label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={teacherNotes}
                    onChange={(e) => setTeacherNotes(e.target.value)}
                    placeholder="Add private notes for your reference (not visible to student)..."
                  />
                  <small className="text-muted">Only visible to school admins and teachers</small>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowReviewModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-success btn-lg"
                  onClick={handleSubmitReview}
                >
                  <Send size={18} className="me-2" />
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

