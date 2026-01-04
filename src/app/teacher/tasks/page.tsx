'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Plus, Edit, Trash2, Eye, Calendar, Clock, Users, BookOpen, AlertCircle, CheckCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '@/lib/api';

interface Task {
  id: number;
  title: string;
  description: string;
  type: string;
  priority: string;
  status: string;
  dueDate: string;
  maxScore: number;
  instructions: string;
  rubric: string;
  tags: string[];
  isRecurring: boolean;
  recurringPattern: string;
  assignedClasses: number[];
  assignedStudents: number[];
  assignedTeachers: number[];
  createdBy: number;
  createdAt: string;
  creatorName?: string;
}

interface Class {
  id: number;
  name: string;
  grade: string;
  section: string;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  name?: string;
}

export default function TeacherTasksPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [creatorFilter, setCreatorFilter] = useState('all'); // all, admin, me
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
    fetchTasks();
    fetchClasses();
    fetchStudents();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Fetch assignments relevant to this teacher only
      const response = await fetch(`${API_BASE_URL}/assignments/my-teacher-assignments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched teacher assignments:', data);
        
        // Add creator information
        const tasksWithCreator = data.map((assignment: any) => ({
          ...assignment,
          creatorName: assignment.createdBy === user.id ? 'You' : 'School Admin',
          status: assignment.status || calculateStatus(assignment) // Use database status or calculate if not present
        }));
        
        setTasks(tasksWithCreator);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      Swal.fire('Error', 'Failed to fetch tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/classes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/students`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const calculateStatus = (assignment: any): string => {
    const dueDate = new Date(assignment.dueDate);
    const now = new Date();
    
    if (dueDate < now) {
      return 'overdue';
    }
    return 'pending';
  };

  const getClassName = (classId: number): string => {
    const classObj = classes.find(c => c.id === classId);
    return classObj?.name || `Class ${classObj?.grade}-${classObj?.section}` || `Class ${classId}`;
  };

  const getStudentName = (studentId: number): string => {
    const student = students.find(s => s.id === studentId);
    if (!student) return `Student ${studentId}`;
    if (student.name) return student.name;
    return `${student.firstName} ${student.lastName}`;
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || task.type.toLowerCase() === typeFilter.toLowerCase();
    const matchesPriority = priorityFilter === 'all' || task.priority.toLowerCase() === priorityFilter.toLowerCase();
    
    const matchesCreator = 
      creatorFilter === 'all' || 
      (creatorFilter === 'me' && task.createdBy === currentUser?.id) ||
      (creatorFilter === 'admin' && task.createdBy !== currentUser?.id);
    
    return matchesSearch && matchesType && matchesPriority && matchesCreator;
  });

  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
    setShowViewModal(true);
  };

  const handleDeleteTask = async (taskId: number, task: Task) => {
    // Only allow deletion of own tasks
    if (task.createdBy !== currentUser?.id) {
      Swal.fire('Not Allowed', 'You can only delete tasks created by you', 'warning');
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this task?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/assignments/${taskId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          Swal.fire('Deleted!', 'Task has been deleted successfully', 'success');
          fetchTasks();
        } else {
          Swal.fire('Error', 'Failed to delete task', 'error');
        }
      } catch (error) {
        console.error('Error deleting task:', error);
        Swal.fire('Error', 'Failed to delete task', 'error');
      }
    }
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

  const getStatusBadge = (status: string) => {
    const statusClasses: any = {
      pending: 'badge bg-warning',
      'in-progress': 'badge bg-info',
      completed: 'badge bg-success',
      overdue: 'badge bg-danger'
    };
    return <span className={statusClasses[status] || 'badge bg-secondary'}>{status}</span>;
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
          <Link href="/teacher/dashboard" className="btn btn-outline-secondary me-3">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="h3 mb-0">My Tasks & Assignments</h1>
            <p className="text-muted mb-0">View and manage assignments for your students</p>
          </div>
        </div>
        <div className="d-flex gap-2">
          <Link href="/teacher/tasks/create" className="btn btn-primary">
            <Plus size={16} className="me-2" />
            Create Assignment
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <div className="input-group">
                <span className="input-group-text">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="assignment">Assignment</option>
                <option value="homework">Homework</option>
                <option value="project">Project</option>
                <option value="quiz">Quiz</option>
                <option value="exam">Exam</option>
              </select>
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={creatorFilter}
                onChange={(e) => setCreatorFilter(e.target.value)}
              >
                <option value="all">All Assignments</option>
                <option value="me">Created by Me</option>
                <option value="admin">Created by School Admin</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="card">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Assignments List</h5>
            <span className="badge bg-primary">{filteredTasks.length} tasks</span>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Task Details</th>
                  <th>Type & Priority</th>
                  <th>Due Date</th>
                  <th>Assigned To</th>
                  <th>Created By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map(task => (
                  <tr key={task.id}>
                    <td>
                      <div className="d-flex align-items-start">
                        <div className="avatar-sm bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3">
                          <BookOpen size={20} className="text-primary" />
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-bold mb-1">{task.title}</div>
                          <p className="text-muted mb-2 small">{task.description}</p>
                          {task.tags && task.tags.length > 0 && (
                            <div className="d-flex flex-wrap gap-1">
                              {task.tags.map((tag, index) => (
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
                        {getTypeBadge(task.type)}
                      </div>
                      <div className="mb-2">
                        {getPriorityBadge(task.priority)}
                      </div>
                      <div>
                        {getStatusBadge(task.status || 'pending')}
                      </div>
                    </td>
                    <td>
                      <div className="mb-2">
                        <Calendar size={14} className="me-1" />
                        {formatDate(task.dueDate)}
                      </div>
                      <div>
                        {getDaysUntilDue(task.dueDate)}
                      </div>
                      <div className="mt-2">
                        <small className="text-muted">Max: {task.maxScore} pts</small>
                      </div>
                    </td>
                    <td>
                      <div className="mb-2">
                        <strong>Classes:</strong>
                        <div className="d-flex flex-wrap gap-1 mt-1">
                          {task.assignedClasses && task.assignedClasses.length > 0 ? (
                            task.assignedClasses.map((classId, index) => (
                              <span key={index} className="badge bg-info small">{getClassName(classId)}</span>
                            ))
                          ) : (
                            <span className="text-muted small">None</span>
                          )}
                        </div>
                      </div>
                      {task.assignedStudents && task.assignedStudents.length > 0 && (
                        <div>
                          <strong>Students:</strong>
                          <div className="d-flex flex-wrap gap-1 mt-1">
                            {task.assignedStudents.slice(0, 3).map((studentId, index) => (
                              <span key={index} className="badge bg-warning small">{getStudentName(studentId)}</span>
                            ))}
                            {task.assignedStudents.length > 3 && (
                              <span className="badge bg-warning small">+{task.assignedStudents.length - 3} more</span>
                            )}
                          </div>
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="mb-2">
                        <span className={`badge ${task.createdBy === currentUser?.id ? 'bg-success' : 'bg-secondary'}`}>
                          {task.creatorName}
                        </span>
                      </div>
                      <small className="text-muted">
                        {formatDate(task.createdAt)}
                      </small>
                    </td>
                    <td>
                      <div className="btn-group" role="group">
                        <button 
                          className="btn btn-sm btn-outline-primary" 
                          title="View Details"
                          onClick={() => handleViewTask(task)}
                        >
                          <Eye size={14} />
                        </button>
                        <Link
                          href={`/teacher/tasks/edit/${task.id}`}
                          className="btn btn-sm btn-outline-warning"
                          title="Edit Task"
                        >
                          <Edit size={14} />
                        </Link>
                        {task.createdBy === currentUser?.id && (
                          <button 
                            className="btn btn-sm btn-outline-danger" 
                            title="Delete Task"
                            onClick={() => handleDeleteTask(task.id, task)}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredTasks.length === 0 && (
            <div className="text-center py-5">
              <div className="text-muted mb-3">
                <Search size={48} />
              </div>
              <h5>No tasks found</h5>
              <p className="text-muted">Try adjusting your filters or create a new assignment.</p>
              <Link href="/teacher/tasks/create" className="btn btn-primary">
                <Plus size={16} className="me-2" />
                Create New Assignment
              </Link>
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
              <h4 className="mb-1">{tasks.length}</h4>
              <p className="text-muted mb-0">Total Tasks</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="bg-success bg-opacity-10 rounded-circle p-3 mx-auto mb-3" style={{width: '60px', height: '60px'}}>
                <CheckCircle size={24} className="text-success" />
              </div>
              <h4 className="mb-1">{tasks.filter(t => t.createdBy === currentUser?.id).length}</h4>
              <p className="text-muted mb-0">Created by Me</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="bg-secondary bg-opacity-10 rounded-circle p-3 mx-auto mb-3" style={{width: '60px', height: '60px'}}>
                <Users size={24} className="text-secondary" />
              </div>
              <h4 className="mb-1">{tasks.filter(t => t.createdBy !== currentUser?.id).length}</h4>
              <p className="text-muted mb-0">From School Admin</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="bg-danger bg-opacity-10 rounded-circle p-3 mx-auto mb-3" style={{width: '60px', height: '60px'}}>
                <AlertCircle size={24} className="text-danger" />
              </div>
              <h4 className="mb-1">{filteredTasks.filter(t => t.status === 'overdue').length}</h4>
              <p className="text-muted mb-0">Overdue</p>
            </div>
          </div>
        </div>
      </div>

      {/* View Task Modal */}
      {showViewModal && selectedTask && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <Eye size={20} className="me-2" />
                  Task Details
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
                      {getStatusBadge(selectedTask.status || 'pending')}
                      <span className={`badge ${selectedTask.createdBy === currentUser?.id ? 'bg-success' : 'bg-secondary'}`}>
                        {selectedTask.creatorName}
                      </span>
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

                  <div className="col-md-6">
                    <label className="text-muted small">Created Date</label>
                    <p>{formatDate(selectedTask.createdAt)}</p>
                  </div>

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

                  <div className="col-12">
                    <label className="text-muted small">Assigned To</label>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <strong>Classes:</strong>
                        <div className="d-flex flex-wrap gap-1 mt-2">
                          {selectedTask.assignedClasses && selectedTask.assignedClasses.length > 0 ? (
                            selectedTask.assignedClasses.map((classId, index) => (
                              <span key={index} className="badge bg-info">{getClassName(classId)}</span>
                            ))
                          ) : (
                            <span className="text-muted small">None</span>
                          )}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <strong>Students:</strong>
                        <div className="d-flex flex-wrap gap-1 mt-2">
                          {selectedTask.assignedStudents && selectedTask.assignedStudents.length > 0 ? (
                            selectedTask.assignedStudents.map((studentId, index) => (
                              <span key={index} className="badge bg-warning">{getStudentName(studentId)}</span>
                            ))
                          ) : (
                            <span className="text-muted small">None</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

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
                <Link
                  href={`/teacher/tasks/edit/${selectedTask.id}`}
                  className="btn btn-warning"
                >
                  <Edit size={16} className="me-2" />
                  Edit Task
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

