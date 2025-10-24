'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Calendar, Clock, BookOpen, AlertCircle, CheckCircle, FileText, User } from 'lucide-react';
import Swal from 'sweetalert2';

interface Assignment {
  id: number;
  title: string;
  description: string;
  type: string;
  priority: string;
  dueDate: string;
  maxScore: number;
  instructions: string;
  rubric: string;
  tags: string[];
  createdBy: number;
  createdAt: string;
  creatorName?: string;
  submissionStatus?: string;
  submissionId?: number;
  grade?: number;
  feedback?: string;
}

export default function StudentTasksPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedTask, setSelectedTask] = useState<Assignment | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submissionContent, setSubmissionContent] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('token');
      let userId = localStorage.getItem('userId');
      const userStr = localStorage.getItem('user');
      
      // Get userId from user object if not in localStorage
      if (!userId && userStr) {
        try {
          const user = JSON.parse(userStr);
          userId = user.id?.toString();
          if (userId) {
            localStorage.setItem('userId', userId);
          }
        } catch (e) {
          console.error('Error parsing user:', e);
        }
      }
      
      if (!userId || !token) {
        console.error('No user ID or token found');
        setLoading(false);
        return;
      }
      
      console.log('Fetching assignments for student userId:', userId);
      
      // Fetch assignments assigned to this student
      const response = await fetch(`http://localhost:3001/assignments/by-student/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched assignments:', data);
        
        // Fetch submissions for this student
        const submissionsResponse = await fetch(`http://localhost:3001/submissions/student/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        let submissions = [];
        if (submissionsResponse.ok) {
          submissions = await submissionsResponse.json();
          console.log('Fetched submissions:', submissions);
        }

        // Merge assignments with submission status
        const assignmentsWithStatus = data.map((assignment: any) => {
          const submission = submissions.find((s: any) => s.taskId === assignment.id);
          
          return {
            ...assignment,
            submissionStatus: submission?.status || 'not_started',
            submissionId: submission?.id,
            grade: submission?.grade,
            feedback: submission?.feedback,
            creatorName: 'Teacher/Admin'
          };
        });
        
        setAssignments(assignmentsWithStatus);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      Swal.fire('Error', 'Failed to fetch assignments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = 
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      assignment.submissionStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleViewTask = (assignment: Assignment) => {
    setSelectedTask(assignment);
    setShowViewModal(true);
  };

  const handleStartSubmission = (assignment: Assignment) => {
    setSelectedTask(assignment);
    setSubmissionContent(assignment.submissionId ? assignment.feedback || '' : '');
    setUploadedFiles([]);
    setIsEditing(!!assignment.submissionId);
    setShowSubmitModal(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const token = localStorage.getItem('token');
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('http://localhost:3001/uploads/submission', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (response.ok) {
          return await response.json();
        }
        throw new Error('Upload failed');
      });

      const uploadedResults = await Promise.all(uploadPromises);
      setUploadedFiles(prev => [...prev, ...uploadedResults]);
      Swal.fire('Success', 'Files uploaded successfully!', 'success');
    } catch (error) {
      console.error('Error uploading files:', error);
      Swal.fire('Error', 'Failed to upload files', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateStatus = async (assignmentId: number, submissionId: number | undefined, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      let userId = localStorage.getItem('userId');
      const userStr = localStorage.getItem('user');
      
      if (!userId && userStr) {
        const user = JSON.parse(userStr);
        userId = user.id?.toString();
      }

      if (submissionId) {
        // Update existing submission
        const response = await fetch(`http://localhost:3001/submissions/${submissionId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
          Swal.fire('Success', 'Status updated successfully', 'success');
          fetchAssignments();
        } else {
          Swal.fire('Error', 'Failed to update status', 'error');
        }
      } else {
        // Create new submission with status
        const response = await fetch('http://localhost:3001/submissions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            taskId: assignmentId,
            studentId: parseInt(userId || '0'),
            status: newStatus,
            content: ''
          })
        });

        if (response.ok) {
          Swal.fire('Success', 'Status updated successfully', 'success');
          fetchAssignments();
        } else {
          Swal.fire('Error', 'Failed to update status', 'error');
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
      Swal.fire('Error', 'Failed to update status', 'error');
    }
  };

  const handleSubmitAssignment = async () => {
    if (!selectedTask || !submissionContent.trim()) {
      Swal.fire('Error', 'Please enter your submission content', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      let userId = localStorage.getItem('userId');
      const userStr = localStorage.getItem('user');
      
      if (!userId && userStr) {
        const user = JSON.parse(userStr);
        userId = user.id?.toString();
      }

      const response = await fetch('http://localhost:3001/submissions', {
        method: isEditing && selectedTask.submissionId ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...(isEditing && selectedTask.submissionId ? { id: selectedTask.submissionId } : {}),
          taskId: selectedTask.id,
          studentId: parseInt(userId || '0'),
          content: submissionContent,
          attachments: uploadedFiles,
          status: 'submitted'
        })
      }).then(res => {
        if (isEditing && selectedTask.submissionId) {
          return fetch(`http://localhost:3001/submissions/${selectedTask.submissionId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              content: submissionContent,
              attachments: uploadedFiles,
              status: 'submitted'
            })
          });
        }
        return res;
      });

      if (response.ok) {
        Swal.fire('Success', 'Assignment submitted successfully!', 'success');
        setShowSubmitModal(false);
        setSubmissionContent('');
        fetchAssignments();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Submission error:', errorData);
        Swal.fire('Error', errorData.message || 'Failed to submit assignment', 'error');
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
      Swal.fire('Error', 'Failed to submit assignment', 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      not_started: { class: 'bg-secondary', label: 'Not Started' },
      draft: { class: 'bg-warning', label: 'Draft' },
      submitted: { class: 'bg-info', label: 'Submitted' },
      reviewed: { class: 'bg-primary', label: 'Reviewed' },
      approved: { class: 'bg-success', label: 'Approved' },
      rejected: { class: 'bg-danger', label: 'Rejected' },
      resubmit: { class: 'bg-warning', label: 'Resubmit Required' }
    };

    const config = statusConfig[status] || statusConfig.not_started;
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
    return <span className={`badge ${typeColors[type.toLowerCase()] || 'bg-secondary'}`}>{type}</span>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityClasses: any = {
      low: 'badge bg-secondary',
      medium: 'badge bg-info',
      high: 'badge bg-warning',
      urgent: 'badge bg-danger'
    };
    return <span className={priorityClasses[priority.toLowerCase()] || 'badge bg-secondary'}>{priority}</span>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return <span className="text-danger fw-bold">Overdue by {Math.abs(diffDays)} days</span>;
    if (diffDays === 0) return <span className="text-warning fw-bold">Due today</span>;
    if (diffDays === 1) return <span className="text-warning">Due tomorrow</span>;
    if (diffDays <= 3) return <span className="text-warning">Due in {diffDays} days</span>;
    return <span className="text-muted">Due in {diffDays} days</span>;
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
          <Link href="/student/dashboard" className="btn btn-outline-secondary me-3">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="h3 mb-0">My Assignments</h1>
            <p className="text-muted mb-0">View and submit your assignments</p>
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
                  placeholder="Search assignments..."
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
                <option value="not_started">Not Started</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="reviewed">Reviewed</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="resubmit">Resubmit Required</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="card">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">My Assignments</h5>
            <span className="badge bg-primary">{filteredAssignments.length} assignments</span>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Assignment Details</th>
                  <th>Type & Priority</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Grade</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.map(assignment => (
                  <tr key={assignment.id}>
                    <td>
                      <div className="d-flex align-items-start">
                        <div className="avatar-sm bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3">
                          <BookOpen size={20} className="text-primary" />
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-bold mb-1">{assignment.title}</div>
                          <p className="text-muted mb-2 small">{assignment.description}</p>
                          {assignment.tags && assignment.tags.length > 0 && (
                            <div className="d-flex flex-wrap gap-1">
                              {assignment.tags.map((tag, index) => (
                                <span key={index} className="badge bg-light text-dark border small">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="mb-2">
                        {getTypeBadge(assignment.type)}
                      </div>
                      <div>
                        {getPriorityBadge(assignment.priority)}
                      </div>
                    </td>
                    <td>
                      <div className="mb-2">
                        <Calendar size={14} className="me-1" />
                        {formatDate(assignment.dueDate)}
                      </div>
                      <div className="mb-2">
                        {getDaysUntilDue(assignment.dueDate)}
                      </div>
                      <div className="mt-2">
                        <small className="text-muted">Max: {assignment.maxScore} pts</small>
                      </div>
                    </td>
                    <td>
                      <div className="mb-2">
                        {getStatusBadge(assignment.submissionStatus || 'not_started')}
                      </div>
                      <div className="btn-group btn-group-sm" role="group">
                        {assignment.submissionStatus === 'not_started' && (
                          <button 
                            className="btn btn-outline-success btn-sm"
                            onClick={() => handleUpdateStatus(assignment.id, assignment.submissionId, 'draft')}
                            title="Start Working"
                          >
                            Start
                          </button>
                        )}
                        {(assignment.submissionStatus === 'draft' || assignment.submissionStatus === 'not_started') && (
                          <button 
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => handleStartSubmission(assignment)}
                            title="Submit Assignment"
                          >
                            Submit
                          </button>
                        )}
                        {assignment.submissionStatus === 'resubmit' && (
                          <button 
                            className="btn btn-outline-warning btn-sm"
                            onClick={() => handleStartSubmission(assignment)}
                            title="Resubmit Assignment"
                          >
                            Resubmit
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      {assignment.grade ? (
                        <div>
                          <div className="fw-bold">{assignment.grade} / {assignment.maxScore}</div>
                          <small className="text-muted">
                            {((assignment.grade / assignment.maxScore) * 100).toFixed(1)}%
                          </small>
                        </div>
                      ) : (
                        <span className="text-muted">Not graded</span>
                      )}
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm btn-outline-primary" 
                        title="View Details"
                        onClick={() => handleViewTask(assignment)}
                      >
                        <FileText size={14} className="me-1" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredAssignments.length === 0 && (
            <div className="text-center py-5">
              <div className="text-muted mb-3">
                <BookOpen size={48} />
              </div>
              <h5>No assignments found</h5>
              <p className="text-muted">You don't have any assignments yet or try adjusting your filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row g-4 mt-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="bg-primary bg-opacity-10 rounded-circle p-3 mx-auto mb-3" style={{width: '60px', height: '60px'}}>
                <BookOpen size={24} className="text-primary" />
              </div>
              <h4 className="mb-1">{assignments.length}</h4>
              <p className="text-muted mb-0">Total Assignments</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="bg-warning bg-opacity-10 rounded-circle p-3 mx-auto mb-3" style={{width: '60px', height: '60px'}}>
                <Clock size={24} className="text-warning" />
              </div>
              <h4 className="mb-1">{assignments.filter(a => a.submissionStatus === 'not_started' || a.submissionStatus === 'draft').length}</h4>
              <p className="text-muted mb-0">Pending</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="bg-info bg-opacity-10 rounded-circle p-3 mx-auto mb-3" style={{width: '60px', height: '60px'}}>
                <FileText size={24} className="text-info" />
              </div>
              <h4 className="mb-1">{assignments.filter(a => a.submissionStatus === 'submitted').length}</h4>
              <p className="text-muted mb-0">Submitted</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="bg-success bg-opacity-10 rounded-circle p-3 mx-auto mb-3" style={{width: '60px', height: '60px'}}>
                <CheckCircle size={24} className="text-success" />
              </div>
              <h4 className="mb-1">{assignments.filter(a => a.submissionStatus === 'approved').length}</h4>
              <p className="text-muted mb-0">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      {showViewModal && selectedTask && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <FileText size={20} className="me-2" />
                  Assignment Details
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowViewModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-4">
                  <div className="col-12">
                    <h4 className="text-primary">{selectedTask.title}</h4>
                    <div className="d-flex gap-2 mb-3">
                      {getTypeBadge(selectedTask.type)}
                      {getPriorityBadge(selectedTask.priority)}
                      {getStatusBadge(selectedTask.submissionStatus || 'not_started')}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="text-muted small">Description</label>
                    <p>{selectedTask.description}</p>
                  </div>

                  <div className="col-md-6">
                    <label className="text-muted small">Due Date</label>
                    <p><Calendar size={16} className="me-2" />{formatDate(selectedTask.dueDate)}</p>
                    <div>{getDaysUntilDue(selectedTask.dueDate)}</div>
                  </div>

                  <div className="col-md-6">
                    <label className="text-muted small">Max Score</label>
                    <p className="fw-bold">{selectedTask.maxScore} points</p>
                  </div>

                  {selectedTask.grade && (
                    <div className="col-md-6">
                      <label className="text-muted small">Your Grade</label>
                      <p className="fw-bold text-success">
                        {selectedTask.grade} / {selectedTask.maxScore} ({((selectedTask.grade / selectedTask.maxScore) * 100).toFixed(1)}%)
                      </p>
                    </div>
                  )}

                  {selectedTask.instructions && (
                    <div className="col-12">
                      <label className="text-muted small">Instructions</label>
                      <div className="p-3 bg-light rounded">
                        <p className="mb-0">{selectedTask.instructions}</p>
                      </div>
                    </div>
                  )}

                  {selectedTask.rubric && (
                    <div className="col-12">
                      <label className="text-muted small">Grading Rubric</label>
                      <div className="p-3 bg-light rounded">
                        <p className="mb-0">{selectedTask.rubric}</p>
                      </div>
                    </div>
                  )}

                  {selectedTask.feedback && (
                    <div className="col-12">
                      <label className="text-muted small">Teacher Feedback</label>
                      <div className="p-3 bg-info bg-opacity-10 rounded">
                        <p className="mb-0">{selectedTask.feedback}</p>
                      </div>
                    </div>
                  )}

                  {selectedTask.tags && selectedTask.tags.length > 0 && (
                    <div className="col-12">
                      <label className="text-muted small">Tags</label>
                      <div className="d-flex flex-wrap gap-2">
                        {selectedTask.tags.map((tag, index) => (
                          <span key={index} className="badge bg-secondary">{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowViewModal(false)}>Close</button>
                {(selectedTask.submissionStatus === 'not_started' || selectedTask.submissionStatus === 'draft' || selectedTask.submissionStatus === 'resubmit') && (
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={() => {
                      setShowViewModal(false);
                      handleStartSubmission(selectedTask);
                    }}
                  >
                    Submit Assignment
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Assignment Modal */}
      {showSubmitModal && selectedTask && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">
                  <FileText size={20} className="me-2" />
                  Submit Assignment: {selectedTask.title}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowSubmitModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Your Submission</label>
                  <textarea
                    className="form-control"
                    rows={10}
                    value={submissionContent}
                    onChange={(e) => setSubmissionContent(e.target.value)}
                    placeholder="Enter your assignment content here..."
                  />
                  <small className="text-muted">Write your answer or paste your content here</small>
                </div>

                {/* File Upload Section */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    <i className="fas fa-paperclip me-2"></i>
                    Attach Files (Optional)
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                  <small className="text-muted">
                    You can upload images, PDFs, Word or Excel files (Max 10MB per file, up to 5 files)
                  </small>
                  
                  {isUploading && (
                    <div className="mt-2">
                      <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                      <span>Uploading files...</span>
                    </div>
                  )}

                  {/* Display uploaded files */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-3">
                      <strong className="d-block mb-2">Uploaded Files:</strong>
                      <div className="list-group">
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                              <i className={`fas ${
                                file.mimetype.includes('image') ? 'fa-image' : 
                                file.mimetype.includes('pdf') ? 'fa-file-pdf' : 
                                'fa-file'
                              } me-2`}></i>
                              <span>{file.originalName}</span>
                              <small className="text-muted ms-2">({(file.size / 1024).toFixed(2)} KB)</small>
                            </div>
                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={() => handleRemoveFile(index)}
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {selectedTask.feedback && selectedTask.submissionStatus === 'resubmit' && (
                  <div className="alert alert-warning">
                    <strong>Previous Feedback:</strong>
                    <p className="mb-0 mt-2">{selectedTask.feedback}</p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowSubmitModal(false)}>Cancel</button>
                <button type="button" className="btn btn-success" onClick={handleSubmitAssignment}>
                  <CheckCircle size={16} className="me-2" />
                  Submit Assignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

