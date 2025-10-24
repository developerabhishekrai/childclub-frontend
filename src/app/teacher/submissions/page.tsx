'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search,
  Filter,
  Star,
  MessageSquare,
  Image as ImageIcon,
  FileIcon,
  Send,
  Award,
  Calendar,
  User,
  BookOpen
} from 'lucide-react';
import Swal from 'sweetalert2';

interface Attachment {
  url: string;
  originalName: string;
  mimetype: string;
  size: number;
}

interface Submission {
  id: number;
  taskId: number;
  studentId: number;
  status: 'draft' | 'submitted' | 'reviewed' | 'approved' | 'rejected' | 'resubmit';
  content: string;
  attachments: Attachment[];
  submittedAt: string;
  grade?: number;
  feedback?: string;
  teacherNotes?: string;
  attempts: number;
  isLate: number;
  student?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    className?: string;
  };
  task?: {
    id: number;
    title: string;
    maxScore: number;
    dueDate: string;
  };
}

export default function TeacherSubmissionsPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  
  // Form states for review
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [teacherNotes, setTeacherNotes] = useState('');
  const [reviewStatus, setReviewStatus] = useState<'reviewed' | 'approved' | 'rejected' | 'resubmit'>('reviewed');
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'student' | 'grade'>('date');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  useEffect(() => {
    filterAndSortSubmissions();
  }, [submissions, searchQuery, statusFilter, sortBy]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        Swal.fire({
          icon: 'error',
          title: 'Authentication Error',
          text: 'Please login again',
        });
        router.push('/teacher/login');
        return;
      }

      console.log('[Frontend] Fetching teacher submissions...');

      // Fetch submissions for assignments created by this teacher
      const response = await fetch('http://localhost:3001/submissions/teacher/my-submissions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }

      const allSubmissions = await response.json();
      console.log('[Frontend] Fetched', allSubmissions.length, 'submissions');
      
      setSubmissions(allSubmissions);
    } catch (error: any) {
      console.error('Error fetching submissions:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to fetch submissions',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortSubmissions = () => {
    let filtered = [...submissions];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(sub => 
        sub.student?.firstName.toLowerCase().includes(query) ||
        sub.student?.lastName.toLowerCase().includes(query) ||
        sub.task?.title.toLowerCase().includes(query) ||
        sub.content?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(sub => sub.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      } else if (sortBy === 'student') {
        const nameA = `${a.student?.firstName} ${a.student?.lastName}`.toLowerCase();
        const nameB = `${b.student?.firstName} ${b.student?.lastName}`.toLowerCase();
        return nameA.localeCompare(nameB);
      } else if (sortBy === 'grade') {
        return (b.grade || 0) - (a.grade || 0);
      }
      return 0;
    });

    setFilteredSubmissions(filtered);
  };

  const handleViewDetails = (submission: Submission) => {
    setSelectedSubmission(submission);
    setShowDetailModal(true);
  };

  const handleStartReview = (submission: Submission) => {
    setSelectedSubmission(submission);
    setGrade(submission.grade?.toString() || '');
    setFeedback(submission.feedback || '');
    setTeacherNotes(submission.teacherNotes || '');
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
      const response = await fetch(`http://localhost:3001/submissions/${selectedSubmission.id}/review`, {
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
        setShowDetailModal(false);
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

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { class: string; icon: any; label: string }> = {
      draft: { class: 'warning', icon: Clock, label: 'Draft' },
      submitted: { class: 'info', icon: FileText, label: 'Submitted' },
      reviewed: { class: 'primary', icon: Eye, label: 'Reviewed' },
      approved: { class: 'success', icon: CheckCircle, label: 'Approved' },
      rejected: { class: 'danger', icon: XCircle, label: 'Rejected' },
      resubmit: { class: 'warning', icon: Clock, label: 'Resubmit Required' },
    };

    const config = configs[status] || configs.submitted;
    const Icon = config.icon;

    return (
      <span className={`badge bg-${config.class} d-flex align-items-center gap-1`} style={{ width: 'fit-content' }}>
        <Icon size={14} />
        {config.label}
      </span>
    );
  };

  const getFileIcon = (mimetype: string) => {
    if (mimetype.includes('image')) return <ImageIcon size={16} className="text-primary" />;
    if (mimetype.includes('pdf')) return <FileIcon size={16} className="text-danger" />;
    return <FileIcon size={16} className="text-secondary" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getStats = () => {
    return {
      total: submissions.length,
      submitted: submissions.filter(s => s.status === 'submitted').length,
      reviewed: submissions.filter(s => s.status === 'reviewed').length,
      approved: submissions.filter(s => s.status === 'approved').length,
      pending: submissions.filter(s => s.status === 'submitted').length,
    };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-warning" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted fw-semibold">Loading submissions...</p>
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
            <Link href="/teacher/dashboard" className="btn btn-outline-secondary">
              <ArrowLeft size={20} />
            </Link>
            <div className="flex-grow-1">
              <h1 className="h3 mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                <FileText className="text-warning" size={28} />
                Student Submissions
              </h1>
              <p className="text-muted mb-0">Review aur grade karein apne students ke kaam ko</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container-fluid py-4">
        <div className="row g-3 mb-4">
          <div className="col-md-3 col-sm-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-primary bg-opacity-10 p-3 rounded-circle">
                    <FileText className="text-primary" size={24} />
                  </div>
                  <div>
                    <p className="text-muted mb-0 small">Total Submissions</p>
                    <h3 className="mb-0 fw-bold">{stats.total}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3 col-sm-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-warning bg-opacity-10 p-3 rounded-circle">
                    <Clock className="text-warning" size={24} />
                  </div>
                  <div>
                    <p className="text-muted mb-0 small">Pending Review</p>
                    <h3 className="mb-0 fw-bold">{stats.pending}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3 col-sm-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-info bg-opacity-10 p-3 rounded-circle">
                    <Eye className="text-info" size={24} />
                  </div>
                  <div>
                    <p className="text-muted mb-0 small">Reviewed</p>
                    <h3 className="mb-0 fw-bold">{stats.reviewed}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3 col-sm-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-success bg-opacity-10 p-3 rounded-circle">
                    <CheckCircle className="text-success" size={24} />
                  </div>
                  <div>
                    <p className="text-muted mb-0 small">Approved</p>
                    <h3 className="mb-0 fw-bold">{stats.approved}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-5">
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <Search size={18} className="text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search by student name, assignment title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="col-md-3">
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="submitted">Submitted</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="resubmit">Resubmit Required</option>
                </select>
              </div>

              <div className="col-md-3">
                <select
                  className="form-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                >
                  <option value="date">Sort by Date</option>
                  <option value="student">Sort by Student</option>
                  <option value="grade">Sort by Grade</option>
                </select>
              </div>

              <div className="col-md-1">
                <button 
                  className="btn btn-outline-secondary w-100"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setSortBy('date');
                  }}
                  title="Clear Filters"
                >
                  <Filter size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Submissions List */}
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white border-bottom">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">Submissions List</h5>
              <span className="badge bg-primary rounded-pill">{filteredSubmissions.length} submissions</span>
            </div>
          </div>

          <div className="card-body p-0">
            {filteredSubmissions.length === 0 ? (
              <div className="text-center py-5">
                <FileText size={64} className="text-muted mb-3" />
                <h5 className="text-muted">No submissions found</h5>
                <p className="text-muted">
                  {searchQuery || statusFilter !== 'all' 
                    ? 'Try changing your filters' 
                    : 'Student submissions will appear here'}
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '20%' }}>
                        <User size={16} className="me-2" />
                        Student
                      </th>
                      <th style={{ width: '25%' }}>
                        <BookOpen size={16} className="me-2" />
                        Assignment
                      </th>
                      <th style={{ width: '15%' }}>
                        <Calendar size={16} className="me-2" />
                        Submitted
                      </th>
                      <th style={{ width: '10%' }}>Status</th>
                      <th style={{ width: '10%' }}>
                        <Award size={16} className="me-2" />
                        Grade
                      </th>
                      <th style={{ width: '10%' }}>Files</th>
                      <th style={{ width: '10%' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubmissions.map((submission) => (
                      <tr key={submission.id}>
                        <td>
                          <div>
                            <div className="fw-semibold text-dark">
                              {submission.student?.firstName} {submission.student?.lastName}
                            </div>
                            <small className="text-muted">{submission.student?.email}</small>
                          </div>
                        </td>
                        <td>
                          <div>
                            <div className="fw-semibold text-dark">{submission.task?.title}</div>
                            <small className="text-muted">
                              Max Score: {submission.task?.maxScore} pts
                              {submission.isLate === 1 && (
                                <span className="badge bg-danger ms-2" style={{ fontSize: '0.7rem' }}>Late</span>
                              )}
                            </small>
                          </div>
                        </td>
                        <td>
                          <small>
                            {new Date(submission.submittedAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                            <br />
                            <span className="text-muted">
                              {new Date(submission.submittedAt).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </small>
                        </td>
                        <td>{getStatusBadge(submission.status)}</td>
                        <td>
                          {submission.grade !== null && submission.grade !== undefined ? (
                            <div>
                              <span className="fw-bold text-success fs-5">{submission.grade}</span>
                              <span className="text-muted">/{submission.task?.maxScore}</span>
                            </div>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          {submission.attachments && submission.attachments.length > 0 ? (
                            <span className="badge bg-secondary">
                              <FileIcon size={12} className="me-1" />
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
                              onClick={() => handleViewDetails(submission)}
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
            )}
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      {showDetailModal && selectedSubmission && (
        <div 
          className="modal show d-block" 
          tabIndex={-1} 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowDetailModal(false)}
        >
          <div 
            className="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-gradient" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <h5 className="modal-title text-white fw-bold d-flex align-items-center gap-2">
                  <FileText size={24} />
                  Submission Details
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowDetailModal(false)}
                ></button>
              </div>

              <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {/* Student Info */}
                <div className="card border-0 bg-light mb-3">
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <User size={18} className="text-primary" />
                          <strong>Student</strong>
                        </div>
                        <p className="mb-0">
                          {selectedSubmission.student?.firstName} {selectedSubmission.student?.lastName}
                        </p>
                        <small className="text-muted">{selectedSubmission.student?.email}</small>
                      </div>
                      <div className="col-md-6">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <BookOpen size={18} className="text-primary" />
                          <strong>Assignment</strong>
                        </div>
                        <p className="mb-0">{selectedSubmission.task?.title}</p>
                        <small className="text-muted">Max Score: {selectedSubmission.task?.maxScore} pts</small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submission Info */}
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <strong className="d-flex align-items-center gap-2">
                      <Calendar size={16} className="text-primary" />
                      Submitted At:
                    </strong>
                    <p className="mb-0">
                      {new Date(selectedSubmission.submittedAt).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <strong>Status:</strong>
                    <div className="mt-1">{getStatusBadge(selectedSubmission.status)}</div>
                  </div>
                  <div className="col-md-6">
                    <strong>Attempts:</strong>
                    <p className="mb-0">{selectedSubmission.attempts}</p>
                  </div>
                  <div className="col-md-6">
                    <strong>Late Submission:</strong>
                    <p className="mb-0">
                      {selectedSubmission.isLate === 1 ? (
                        <span className="badge bg-danger">Yes</span>
                      ) : (
                        <span className="badge bg-success">No</span>
                      )}
                    </p>
                  </div>
                </div>

                <hr />

                {/* Content */}
                <div className="mb-3">
                  <strong className="d-flex align-items-center gap-2 mb-2">
                    <MessageSquare size={16} className="text-primary" />
                    Submission Content:
                  </strong>
                  <div className="p-3 bg-light rounded border">
                    {selectedSubmission.content ? (
                      <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                        {selectedSubmission.content}
                      </p>
                    ) : (
                      <em className="text-muted">No content provided</em>
                    )}
                  </div>
                </div>

                {/* Attachments */}
                {selectedSubmission.attachments && selectedSubmission.attachments.length > 0 && (
                  <div className="mb-3">
                    <strong className="d-flex align-items-center gap-2 mb-2">
                      <FileIcon size={16} className="text-primary" />
                      Attached Files ({selectedSubmission.attachments.length}):
                    </strong>
                    <div className="list-group">
                      {selectedSubmission.attachments.map((file, index) => (
                        <div 
                          key={index} 
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          <div className="d-flex align-items-center gap-2">
                            {getFileIcon(file.mimetype)}
                            <div>
                              <div className="fw-semibold">{file.originalName}</div>
                              <small className="text-muted">{formatFileSize(file.size)}</small>
                            </div>
                          </div>
                          <div className="d-flex gap-2">
                            <a
                              href={`http://localhost:3001${file.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-outline-primary"
                            >
                              <Eye size={14} className="me-1" /> View
                            </a>
                            <a
                              href={`http://localhost:3001${file.url}`}
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

                {/* Grading Info */}
                {selectedSubmission.grade !== null && selectedSubmission.grade !== undefined && (
                  <>
                    <hr />
                    <div className="mb-3">
                      <strong className="d-flex align-items-center gap-2 mb-2">
                        <Award size={16} className="text-success" />
                        Grade:
                      </strong>
                      <div className="d-flex align-items-center gap-2">
                        <span className="fs-3 fw-bold text-success">{selectedSubmission.grade}</span>
                        <span className="text-muted">/ {selectedSubmission.task?.maxScore}</span>
                        <span className="badge bg-success">
                          {((selectedSubmission.grade / (selectedSubmission.task?.maxScore || 100)) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {/* Feedback */}
                {selectedSubmission.feedback && (
                  <div className="mb-3">
                    <strong className="d-flex align-items-center gap-2 mb-2">
                      <MessageSquare size={16} className="text-info" />
                      Teacher Feedback:
                    </strong>
                    <div className="p-3 bg-info bg-opacity-10 rounded border border-info">
                      <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                        {selectedSubmission.feedback}
                      </p>
                    </div>
                  </div>
                )}

                {/* Teacher Notes */}
                {selectedSubmission.teacherNotes && (
                  <div className="mb-3">
                    <strong className="d-flex align-items-center gap-2 mb-2">
                      <FileText size={16} className="text-warning" />
                      Private Notes:
                    </strong>
                    <div className="p-3 bg-warning bg-opacity-10 rounded border border-warning">
                      <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                        {selectedSubmission.teacherNotes}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowDetailModal(false)}
                >
                  Close
                </button>
                <button 
                  type="button" 
                  className="btn btn-success"
                  onClick={() => {
                    setShowDetailModal(false);
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
                      </div>
                      <div className="col-md-6">
                        <small className="text-muted">Assignment</small>
                        <p className="mb-0 fw-semibold">{selectedSubmission.task?.title}</p>
                      </div>
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
                    <small className="text-muted mt-1">
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
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="resubmit">Resubmit Required</option>
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
                  <small className="text-muted">Only visible to teachers</small>
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
