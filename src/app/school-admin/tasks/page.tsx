'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Plus, Edit, Trash2, Eye, Filter, Download, Calendar, Clock, Users, BookOpen, AlertCircle, CheckCircle, Clock3 } from 'lucide-react';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '@/lib/api';

interface Task {
  id: number;
  title: string;
  description: string;
  type: 'assignment' | 'homework' | 'project' | 'quiz' | 'exam';
  priority: 'low' | 'medium' | 'high' | 'urgent';
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
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  submissionCount: number;
  averageScore: number;
  createdAt: string;
  createdBy: number;
}

interface Class {
  id: number;
  name: string;
  grade?: string;
  section?: string;
}

interface User {
  id: number;
  name?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  currentClassId?: number;
  classId?: number;
  status?: string;
}

export default function TasksPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number>(0);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUserId(user.id);
    fetchTasks();
    fetchClasses();
    fetchTeachers();
    fetchStudents();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch all assignments for the school (including those created by teachers)
      const response = await fetch(`${API_BASE_URL}/assignments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Transform the data to match our Task interface
        const transformedTasks = data.map((assignment: any) => ({
          ...assignment,
          status: assignment.status || calculateStatus(assignment), // Use database status or calculate if not present
          submissionCount: 0, // TODO: fetch from submissions
          averageScore: 0, // TODO: calculate from submissions
        }));
        
        setTasks(transformedTasks);
      } else {
        Swal.fire('Error', `Failed to fetch tasks: ${response.status}`, 'error');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      Swal.fire('Error', 'Failed to fetch tasks. Check console for details.', 'error');
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

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/teachers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTeachers(data);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
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

  const calculateStatus = (assignment: any): 'pending' | 'in-progress' | 'completed' | 'overdue' => {
    const dueDate = new Date(assignment.dueDate);
    const now = new Date();
    
    if (dueDate < now) {
      return 'overdue';
    }
    return 'pending';
  };

  const getClassName = (classId: number): string => {
    const classObj = classes.find(c => c.id === classId);
    return classObj?.name || `Class ${classId}`;
  };

  const getTeacherName = (teacherId: number): string => {
    const teacher = teachers.find(t => t.id === teacherId);
    if (!teacher) return `Teacher ${teacherId}`;
    
    // Try different name formats
    if (teacher.name) return teacher.name;
    if (teacher.firstName && teacher.lastName) return `${teacher.firstName} ${teacher.lastName}`;
    if (teacher.firstName) return teacher.firstName;
    if (teacher.username) return teacher.username;
    return `Teacher ${teacherId}`;
  };

  const getStudentName = (studentId: number): string => {
    const student = students.find(s => s.id === studentId);
    if (!student) return `Student ${studentId}`;
    
    // Try different name formats
    if (student.name) return student.name;
    if (student.firstName && student.lastName) return `${student.firstName} ${student.lastName}`;
    if (student.firstName) return student.firstName;
    if (student.username) return student.username;
    return `Student ${studentId}`;
  };

  const getCreatorName = (creatorId: number): string => {
    // Check if it's the current user
    if (creatorId === currentUserId) return 'You';
    
    // Check in teachers list
    const teacher = teachers.find(t => t.id === creatorId);
    if (teacher) {
      if (teacher.firstName && teacher.lastName) return `${teacher.firstName} ${teacher.lastName}`;
      if (teacher.name) return teacher.name;
      if (teacher.username) return teacher.username;
      return `Teacher ${creatorId}`;
    }
    
    return `User ${creatorId}`;
  };

  const [taskTypes] = useState([
    { id: 'assignment', name: 'Assignment' },
    { id: 'homework', name: 'Homework' },
    { id: 'project', name: 'Project' },
    { id: 'quiz', name: 'Quiz' },
    { id: 'exam', name: 'Exam' }
  ]);

  const [priorities] = useState([
    { id: 'low', name: 'Low' },
    { id: 'medium', name: 'Medium' },
    { id: 'high', name: 'High' },
    { id: 'urgent', name: 'Urgent' }
  ]);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesType = typeFilter === 'all' || task.type === typeFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      pending: 'badge bg-warning',
      'in-progress': 'badge bg-info',
      completed: 'badge bg-success',
      overdue: 'badge bg-danger'
    };
    return <span className={statusClasses[status as keyof typeof statusClasses]}>{status}</span>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityClasses = {
      low: 'badge bg-secondary',
      medium: 'badge bg-info',
      high: 'badge bg-warning',
      urgent: 'badge bg-danger'
    };
    return <span className={priorityClasses[priority as keyof typeof priorityClasses]}>{priority}</span>;
  };

  const getTypeBadge = (type: string) => {
    const typeColors = {
      assignment: 'bg-primary',
      homework: 'bg-success',
      project: 'bg-info',
      quiz: 'bg-warning',
      exam: 'bg-danger'
    };
    return <span className={`badge ${typeColors[type as keyof typeof typeColors] || 'bg-secondary'}`}>{type}</span>;
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

  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
    setShowViewModal(true);
  };


  const handleDeleteTask = async (taskId: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this task?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
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
          fetchTasks(); // Refresh the list
        } else {
          Swal.fire('Error', 'Failed to delete task', 'error');
        }
      } catch (error) {
        console.error('Error deleting task:', error);
        Swal.fire('Error', 'Failed to delete task', 'error');
      }
    }
  };

  const handleExportTasks = () => {
    // Handle export logic here
    console.log('Exporting tasks...');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
            <h1 className="h3 mb-0">My Assignments / Tasks</h1>
            <p className="text-muted mb-0">View and manage assignments created by you</p>
          </div>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary" onClick={handleExportTasks}>
            <Download size={16} className="me-2" />
            Export
          </button>
          <Link href="/school-admin/create-assignment" className="btn btn-primary">
            <Plus size={16} className="me-2" />
            Create New Task
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
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                {taskTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="all">All Priorities</option>
                {priorities.map(priority => (
                  <option key={priority.id} value={priority.id}>{priority.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <button className="btn btn-outline-secondary w-100">
                <Filter size={16} className="me-2" />
                Advanced Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="card">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Tasks List</h5>
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
                  <th>Due Date & Status</th>
                  <th>Assignments</th>
                  <th>Created By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map(task => (
                  <tr key={task.id}>
                    <td>
                      <div className="d-flex align-items-start">
                        <div className="avatar-sm bg-warning bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3">
                          <BookOpen size={20} className="text-warning" />
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-bold mb-1">{task.title}</div>
                          <p className="text-muted mb-2 small">{task.description}</p>
                          <div className="d-flex flex-wrap gap-1">
                            {task.tags && Array.isArray(task.tags) && task.tags.map((tag, index) => (
                              <span key={index} className="badge bg-light text-dark border small">
                                {tag}
                              </span>
                            ))}
                          </div>
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
                      {task.isRecurring && (
                        <small className="text-muted">
                          <Clock3 size={12} className="me-1" />
                          {task.recurringPattern}
                        </small>
                      )}
                    </td>
                    <td>
                      <div className="mb-2">
                        <strong>Due:</strong> {formatDate(task.dueDate)}
                      </div>
                      <div className="mb-2">
                        {getDaysUntilDue(task.dueDate)}
                      </div>
                      <div>
                        {getStatusBadge(task.status)}
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
                            <span className="text-muted small">No classes</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <strong>Teachers:</strong>
                        <div className="d-flex flex-wrap gap-1 mt-1">
                          {task.assignedTeachers && task.assignedTeachers.length > 0 ? (
                            task.assignedTeachers.map((teacherId, index) => (
                              <span key={index} className="badge bg-success small">{getTeacherName(teacherId)}</span>
                            ))
                          ) : (
                            <span className="text-muted small">No teachers</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="mb-2">
                        <small className="text-muted">
                          <Calendar size={12} className="me-1" />
                          {formatDate(task.createdAt)}
                        </small>
                      </div>
                      <div>
                        <small className="text-muted">
                          <Users size={12} className="me-1" />
                          {getCreatorName(task.createdBy)}
                        </small>
                      </div>
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
                          href={`/school-admin/tasks/edit/${task.id}`}
                          className="btn btn-sm btn-outline-warning" 
                          title="Edit Task"
                        >
                          <Edit size={14} />
                        </Link>
                        <button 
                          className="btn btn-sm btn-outline-danger" 
                          title="Delete Task"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          <Trash2 size={14} />
                        </button>
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
              <p className="text-muted">Try adjusting your search criteria or create a new task.</p>
              <Link href="/school-admin/create-assignment" className="btn btn-primary">
                <Plus size={16} className="me-2" />
                Create New Task
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
              <div className="bg-warning bg-opacity-10 rounded-circle p-3 mx-auto mb-3" style={{width: '60px', height: '60px'}}>
                <Clock size={24} className="text-warning" />
              </div>
              <h4 className="mb-1">{tasks.filter(t => t.status === 'pending').length}</h4>
              <p className="text-muted mb-0">Pending Tasks</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="bg-info bg-opacity-10 rounded-circle p-3 mx-auto mb-3" style={{width: '60px', height: '60px'}}>
                <BookOpen size={24} className="text-info" />
              </div>
              <h4 className="mb-1">{tasks.filter(t => t.status === 'in-progress').length}</h4>
              <p className="text-muted mb-0">In Progress</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="bg-success bg-opacity-10 rounded-circle p-3 mx-auto mb-3" style={{width: '60px', height: '60px'}}>
                <CheckCircle size={24} className="text-success" />
              </div>
              <h4 className="mb-1">{tasks.filter(t => t.status === 'completed').length}</h4>
              <p className="text-muted mb-0">Completed</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="bg-danger bg-opacity-10 rounded-circle p-3 mx-auto mb-3" style={{width: '60px', height: '60px'}}>
                <AlertCircle size={24} className="text-danger" />
              </div>
              <h4 className="mb-1">{tasks.filter(t => t.status === 'overdue').length}</h4>
              <p className="text-muted mb-0">Overdue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {filteredTasks.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <div className="text-muted">
            Showing {filteredTasks.length} of {tasks.length} tasks
          </div>
          <nav aria-label="Tasks pagination">
            <ul className="pagination pagination-sm mb-0">
              <li className="page-item disabled">
                <span className="page-link">Previous</span>
              </li>
              <li className="page-item active">
                <span className="page-link">1</span>
              </li>
              <li className="page-item">
                <span className="page-link">2</span>
              </li>
              <li className="page-item">
                <span className="page-link">3</span>
              </li>
              <li className="page-item">
                <span className="page-link">Next</span>
              </li>
            </ul>
          </nav>
        </div>
      )}

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
                      {getStatusBadge(selectedTask.status)}
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
                      <div className="col-md-4">
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
                      <div className="col-md-4">
                        <strong>Teachers:</strong>
                        <div className="d-flex flex-wrap gap-1 mt-2">
                          {selectedTask.assignedTeachers && selectedTask.assignedTeachers.length > 0 ? (
                            selectedTask.assignedTeachers.map((teacherId, index) => (
                              <span key={index} className="badge bg-success">{getTeacherName(teacherId)}</span>
                            ))
                          ) : (
                            <span className="text-muted small">None</span>
                          )}
                        </div>
                      </div>
                      <div className="col-md-4">
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
                  href={`/school-admin/tasks/edit/${selectedTask.id}`}
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

