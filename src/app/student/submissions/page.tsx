'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Download, Eye, Edit, CheckCircle, Clock, XCircle, FileText, Image as ImageIcon, File } from 'lucide-react';
import Swal from 'sweetalert2';

interface Submission {
  id: number;
  taskId: number;
  studentId: number;
  status: string;
  content: string;
  attachments: any[];
  submittedAt: string;
  reviewedAt: string | null;
  reviewedById: number | null;
  grade: number | null;
  feedback: string | null;
  teacherNotes: string | null;
  attempts: number;
  isLate: number;
  lateReason: string | null;
  createdAt: string;
  updatedAt: string;
  task?: {
    id: number;
    title: string;
    description: string;
    type: string;
    priority: string;
    dueDate: string;
    maxScore: number;
    subject?: {
      name: string;
    };
  };
  reviewer?: {
    firstName: string;
    lastName: string;
  };
}

export default function StudentSubmissionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('token');
      let userId = localStorage.getItem('userId');
      const userStr = localStorage.getItem('user');
      
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
      
      console.log('Fetching submissions for student userId:', userId);
      
      // Fetch submissions for this student
      const response = await fetch(`http://localhost:3001/submissions/student/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched submissions:', data);
        setSubmissions(data);
      } else {
        throw new Error('Failed to fetch submissions');
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      Swal.fire('Error', 'Failed to fetch submissions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = 
      submission.task?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.task?.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      submission.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleViewSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    setShowViewModal(true);
  };

  const handleEditSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    setEditContent(submission.content || '');
    setUploadedFiles(submission.attachments || []);
    setShowEditModal(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (uploadedFiles.length + files.length > 5) {
      Swal.fire('Error', 'Maximum 5 files allowed', 'error');
      return;
    }

    setIsUploading(true);

    try {
      const token = localStorage.getItem('token');
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`File ${file.name} exceeds 10MB limit`);
        }

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
    } catch (error: any) {
      console.error('Error uploading files:', error);
      Swal.fire('Error', error.message || 'Failed to upload files', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateSubmission = async () => {
    if (!selectedSubmission) return;

    try {
      const token = localStorage.getItem('token');

      const updateData = {
        content: editContent,
        attachments: uploadedFiles,
        status: 'submitted',
        submittedAt: new Date().toISOString(),
      };

      const response = await fetch(`http://localhost:3001/submissions/${selectedSubmission.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        Swal.fire('Success', 'Submission updated successfully!', 'success');
        setShowEditModal(false);
        fetchSubmissions();
      } else {
        throw new Error('Failed to update submission');
      }
    } catch (error) {
      console.error('Error updating submission:', error);
      Swal.fire('Error', 'Failed to update submission', 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { color: string; text: string; icon: any } } = {
      'draft': { color: 'bg-warning', text: 'Draft', icon: Clock },
      'submitted': { color: 'bg-info', text: 'Submitted', icon: FileText },
      'reviewed': { color: 'bg-primary', text: 'Reviewed', icon: Eye },
      'approved': { color: 'bg-success', text: 'Approved', icon: CheckCircle },
      'rejected': { color: 'bg-danger', text: 'Rejected', icon: XCircle },
      'resubmit': { color: 'bg-warning', text: 'Resubmit', icon: Edit },
    };
    
    const config = statusConfig[status] || statusConfig['draft'];
    const Icon = config.icon;
    
    return (
      <span className={`badge ${config.color} d-inline-flex align-items-center gap-1`}>
        <Icon size={14} />
        {config.text}
      </span>
    );
  };

  const getFileIcon = (filename: string) => {
    if (!filename) return <File size={20} />;
    
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return <ImageIcon size={20} />;
    }
    return <File size={20} />;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDaysFromDue = (dueDate: string, submittedAt: string) => {
    if (!dueDate || !submittedAt) return null;
    const due = new Date(dueDate).getTime();
    const submitted = new Date(submittedAt).getTime();
    const diffDays = Math.ceil((submitted - due) / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="container-fluid vh-100 d-flex justify-content-center align-items-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="text-center">
          <div className="spinner-border text-light" role="status" style={{ width: '4rem', height: '4rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4 className="text-white mt-3">Loading Submissions...</h4>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh' }}>
      <div className="container-fluid p-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-lg" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <div className="card-body text-white p-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <Link href="/student/dashboard" className="btn btn-light btn-sm mb-3">
                      <ArrowLeft size={16} className="me-2" />
                      Back to Dashboard
                    </Link>
                    <h1 className="display-5 fw-bold mb-2">📤 My Submissions</h1>
                    <p className="mb-0 opacity-75">View and manage all your submitted work</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Total</h6>
                    <h3 className="mb-0 fw-bold">{submissions.length}</h3>
                  </div>
                  <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                    <FileText className="text-primary" size={24} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Submitted</h6>
                    <h3 className="mb-0 fw-bold">
                      {submissions.filter(s => s.status === 'submitted').length}
                    </h3>
                  </div>
                  <div className="bg-info bg-opacity-10 rounded-circle p-3">
                    <Clock className="text-info" size={24} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Approved</h6>
                    <h3 className="mb-0 fw-bold">
                      {submissions.filter(s => s.status === 'approved').length}
                    </h3>
                  </div>
                  <div className="bg-success bg-opacity-10 rounded-circle p-3">
                    <CheckCircle className="text-success" size={24} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Avg Score</h6>
                    <h3 className="mb-0 fw-bold">
                      {submissions.filter(s => s.grade).length > 0
                        ? (submissions.reduce((acc, s) => acc + (s.grade || 0), 0) / 
                           submissions.filter(s => s.grade).length).toFixed(1)
                        : 'N/A'}
                    </h3>
                  </div>
                  <div className="bg-warning bg-opacity-10 rounded-circle p-3">
                    <FileText className="text-warning" size={24} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <Search size={20} />
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search by assignment title or content..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
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
                      <option value="draft">Draft</option>
                      <option value="submitted">Submitted</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="resubmit">Resubmit Required</option>
                    </select>
                  </div>
                  <div className="col-md-3 text-end">
                    <button 
                      className="btn btn-primary"
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('all');
                      }}
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                {filteredSubmissions.length === 0 ? (
                  <div className="text-center py-5">
                    <FileText size={64} className="text-muted mb-3" />
                    <h5 className="text-muted">No submissions found</h5>
                    <p className="text-muted">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'Try adjusting your filters' 
                        : 'You haven\'t submitted any assignments yet'}
                    </p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Assignment</th>
                          <th>Subject</th>
                          <th>Status</th>
                          <th>Submitted At</th>
                          <th>Grade</th>
                          <th>Attachments</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSubmissions.map((submission) => {
                          const daysFromDue = getDaysFromDue(submission.task?.dueDate || '', submission.submittedAt);
                          return (
                            <tr key={submission.id}>
                              <td>
                                <div>
                                  <h6 className="mb-1">{submission.task?.title || 'Untitled'}</h6>
                                  <small className="text-muted">
                                    Due: {formatDate(submission.task?.dueDate || '')}
                                  </small>
                                  {daysFromDue !== null && daysFromDue > 0 && (
                                    <span className="badge bg-danger ms-2">
                                      {daysFromDue} day{daysFromDue > 1 ? 's' : ''} late
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td>
                                <span className="badge bg-secondary">
                                  {submission.task?.subject?.name || submission.task?.type || 'General'}
                                </span>
                              </td>
                              <td>{getStatusBadge(submission.status)}</td>
                              <td>
                                <small>{formatDate(submission.submittedAt)}</small>
                              </td>
                              <td>
                                {submission.grade !== null ? (
                                  <strong className="text-success">
                                    {submission.grade}/{submission.task?.maxScore || 20}
                                  </strong>
                                ) : (
                                  <span className="text-muted">Not graded</span>
                                )}
                              </td>
                              <td>
                                {submission.attachments && submission.attachments.length > 0 ? (
                                  <span className="badge bg-info">
                                    {submission.attachments.length} file{submission.attachments.length > 1 ? 's' : ''}
                                  </span>
                                ) : (
                                  <span className="text-muted">None</span>
                                )}
                              </td>
                              <td>
                                <div className="btn-group" role="group">
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => handleViewSubmission(submission)}
                                    title="View Details"
                                  >
                                    <Eye size={16} />
                                  </button>
                                  {(submission.status === 'draft' || submission.status === 'resubmit') && (
                                    <button
                                      className="btn btn-sm btn-outline-warning"
                                      onClick={() => handleEditSubmission(submission)}
                                      title="Edit Submission"
                                    >
                                      <Edit size={16} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Modal */}
      {showViewModal && selectedSubmission && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Submission Details</h5>
                <button type="button" className="btn-close" onClick={() => setShowViewModal(false)}></button>
              </div>
              <div className="modal-body">
                {/* Assignment Info */}
                <div className="card mb-3">
                  <div className="card-body">
                    <h6 className="text-primary mb-3">📝 Assignment Information</h6>
                    <div className="row">
                      <div className="col-md-6 mb-2">
                        <strong>Title:</strong> {selectedSubmission.task?.title}
                      </div>
                      <div className="col-md-6 mb-2">
                        <strong>Type:</strong> {selectedSubmission.task?.type}
                      </div>
                      <div className="col-md-6 mb-2">
                        <strong>Due Date:</strong> {formatDate(selectedSubmission.task?.dueDate || '')}
                      </div>
                      <div className="col-md-6 mb-2">
                        <strong>Max Score:</strong> {selectedSubmission.task?.maxScore || 20}
                      </div>
                    </div>
                    {selectedSubmission.task?.description && (
                      <div className="mt-2">
                        <strong>Description:</strong>
                        <p className="mb-0 mt-1">{selectedSubmission.task.description}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submission Info */}
                <div className="card mb-3">
                  <div className="card-body">
                    <h6 className="text-success mb-3">📤 Your Submission</h6>
                    <div className="row mb-3">
                      <div className="col-md-4 mb-2">
                        <strong>Status:</strong> {getStatusBadge(selectedSubmission.status)}
                      </div>
                      <div className="col-md-4 mb-2">
                        <strong>Submitted:</strong> {formatDate(selectedSubmission.submittedAt)}
                      </div>
                      <div className="col-md-4 mb-2">
                        <strong>Attempts:</strong> {selectedSubmission.attempts}
                      </div>
                    </div>
                    {selectedSubmission.content && (
                      <div className="mb-3">
                        <strong>Content:</strong>
                        <div className="p-3 bg-light rounded mt-2">
                          {selectedSubmission.content}
                        </div>
                      </div>
                    )}
                    {selectedSubmission.attachments && selectedSubmission.attachments.length > 0 && (
                      <div>
                        <strong>Attachments:</strong>
                        <div className="list-group mt-2">
                          {selectedSubmission.attachments.map((file: any, index: number) => (
                            <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                              <div className="d-flex align-items-center">
                                {getFileIcon(file.filename)}
                                <span className="ms-2">{file.filename}</span>
                              </div>
                              <a
                                href={`http://localhost:3001${file.path}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-outline-primary"
                              >
                                <Download size={16} />
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Feedback */}
                {(selectedSubmission.grade !== null || selectedSubmission.feedback) && (
                  <div className="card mb-3">
                    <div className="card-body">
                      <h6 className="text-info mb-3">📊 Teacher's Feedback</h6>
                      <div className="row">
                        {selectedSubmission.grade !== null && (
                          <div className="col-md-6 mb-2">
                            <strong>Grade:</strong>{' '}
                            <span className="fs-4 text-success">
                              {selectedSubmission.grade}/{selectedSubmission.task?.maxScore || 20}
                            </span>
                          </div>
                        )}
                        {selectedSubmission.reviewedAt && (
                          <div className="col-md-6 mb-2">
                            <strong>Reviewed At:</strong> {formatDate(selectedSubmission.reviewedAt)}
                          </div>
                        )}
                      </div>
                      {selectedSubmission.feedback && (
                        <div className="mt-2">
                          <strong>Feedback:</strong>
                          <div className="p-3 bg-light rounded mt-2">
                            {selectedSubmission.feedback}
                          </div>
                        </div>
                      )}
                      {selectedSubmission.reviewer && (
                        <div className="mt-2">
                          <small className="text-muted">
                            Reviewed by: {selectedSubmission.reviewer.firstName} {selectedSubmission.reviewer.lastName}
                          </small>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowViewModal(false)}>
                  Close
                </button>
                {(selectedSubmission.status === 'draft' || selectedSubmission.status === 'resubmit') && (
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={() => {
                      setShowViewModal(false);
                      handleEditSubmission(selectedSubmission);
                    }}
                  >
                    <Edit size={16} className="me-2" />
                    Edit Submission
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedSubmission && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Submission - {selectedSubmission.task?.title}</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body">
                {/* Content */}
                <div className="mb-3">
                  <label className="form-label"><strong>Content:</strong></label>
                  <textarea
                    className="form-control"
                    rows={6}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="Enter your submission content here..."
                  />
                </div>

                {/* File Upload */}
                <div className="mb-3">
                  <label className="form-label"><strong>Attachments:</strong></label>
                  <input
                    type="file"
                    className="form-control"
                    multiple
                    accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx"
                    onChange={handleFileUpload}
                    disabled={isUploading || uploadedFiles.length >= 5}
                  />
                  <small className="text-muted">
                    Max 5 files, 10MB each. Supported: Images, PDF, Word, Excel
                  </small>
                </div>

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="mb-3">
                    <strong>Uploaded Files:</strong>
                    <div className="list-group mt-2">
                      {uploadedFiles.map((file: any, index: number) => (
                        <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center">
                            {getFileIcon(file.filename)}
                            <span className="ms-2">{file.filename}</span>
                          </div>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleRemoveFile(index)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isUploading && (
                  <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Uploading...</span>
                    </div>
                    <p className="mt-2">Uploading files...</p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleUpdateSubmission}
                  disabled={isUploading}
                >
                  <CheckCircle size={16} className="me-2" />
                  Update & Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .modal {
          display: block;
          overflow-y: auto;
        }
        .table th {
          background-color: #f8f9fa;
          font-weight: 600;
        }
        .card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>
    </div>
  );
}

