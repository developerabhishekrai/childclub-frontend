'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Users, Calendar, MapPin, Clock, Edit, Trash2, Download } from 'lucide-react';
import { apiGet, apiDelete, getStoredToken } from '@/lib/api';

interface Class {
  id: number;
  name: string;
  grade: string;
  section: string;
  academicYear: string;
  maxStudents: number;
  currentStudents: number;
  description?: string;
  subjects?: any;
  syllabus?: string;
  rules?: string;
  classTeacherId?: number;
  classTeacher?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  startDate?: string;
  endDate?: string;
  schedule?: any;
  status: string;
  schoolId: number;
  createdAt: string;
  updatedAt: string;
}

export default function ClassDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.id as string;
  
  const [classData, setClassData] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        setLoading(true);
        const token = getStoredToken();
        
        if (!token) {
          throw new Error('Authentication required');
        }

        const response = await apiGet<Class>(`/classes/${classId}`, { token });
        setClassData(response);
      } catch (error: any) {
        console.error('Error fetching class details:', error);
        setError(error?.message || 'Failed to fetch class details');
      } finally {
        setLoading(false);
      }
    };

    if (classId) {
      fetchClassDetails();
    }
  }, [classId]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this class?')) return;

    try {
      const token = getStoredToken();
      await apiDelete(`/classes/${classId}`, { token });
      alert('Class deleted successfully!');
      router.push('/school-admin/classes');
    } catch (error: any) {
      console.error('Error deleting class:', error);
      alert(error?.message || 'Failed to delete class');
    }
  };

  if (loading) {
    return (
      <div className="container-fluid">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading class details...</p>
        </div>
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="container-fluid">
        <div className="alert alert-danger" role="alert">
          <h5 className="alert-heading">Error</h5>
          <p>{error || 'Class not found'}</p>
          <hr />
          <Link href="/school-admin/classes" className="btn btn-outline-danger">
            Back to Classes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <Link href="/school-admin/classes" className="btn btn-outline-secondary me-3">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="h3 mb-0">{classData.name}</h1>
            <p className="text-muted mb-0">Grade {classData.grade} - Section {classData.section}</p>
          </div>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary">
            <Download size={16} className="me-2" />
            Export
          </button>
          <Link href={`/school-admin/classes/${classId}/edit`} className="btn btn-warning">
            <Edit size={16} className="me-2" />
            Edit
          </Link>
          <button className="btn btn-danger" onClick={handleDelete}>
            <Trash2 size={16} className="me-2" />
            Delete
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="bg-primary bg-opacity-10 rounded-circle p-3 mx-auto mb-3" style={{width: '60px'}}>
                <Users size={24} className="text-primary" />
              </div>
              <h4 className="mb-1">{classData.currentStudents}</h4>
              <p className="text-muted mb-0">Current Students</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="bg-success bg-opacity-10 rounded-circle p-3 mx-auto mb-3" style={{width: '60px'}}>
                <BookOpen size={24} className="text-success" />
              </div>
              <h4 className="mb-1">{classData.maxStudents}</h4>
              <p className="text-muted mb-0">Max Capacity</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="bg-info bg-opacity-10 rounded-circle p-3 mx-auto mb-3" style={{width: '60px'}}>
                <Calendar size={24} className="text-info" />
              </div>
              <h4 className="mb-1">{classData.academicYear || 'N/A'}</h4>
              <p className="text-muted mb-0">Academic Year</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="bg-warning bg-opacity-10 rounded-circle p-3 mx-auto mb-3" style={{width: '60px'}}>
                <Clock size={24} className="text-warning" />
              </div>
              <h4 className="mb-1">
                <span className={`badge ${classData.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'}`}>
                  {classData.status}
                </span>
              </h4>
              <p className="text-muted mb-0">Status</p>
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="row g-4">
        <div className="col-lg-8">
          {/* Basic Information */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Basic Information</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="text-muted small">Class Name</label>
                  <p className="fw-semibold mb-0">{classData.name}</p>
                </div>
                <div className="col-md-3">
                  <label className="text-muted small">Grade</label>
                  <p className="fw-semibold mb-0">{classData.grade}</p>
                </div>
                <div className="col-md-3">
                  <label className="text-muted small">Section</label>
                  <p className="fw-semibold mb-0">{classData.section}</p>
                </div>
                <div className="col-12">
                  <label className="text-muted small">Description</label>
                  <p className="mb-0">{classData.description || 'No description provided'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Subjects */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Subjects</h5>
            </div>
            <div className="card-body">
              {classData.subjects ? (
                <p className="mb-0">
                  {Array.isArray(classData.subjects) 
                    ? classData.subjects.join(', ')
                    : typeof classData.subjects === 'object'
                    ? Object.values(classData.subjects).join(', ')
                    : classData.subjects}
                </p>
              ) : (
                <p className="text-muted mb-0">No subjects assigned</p>
              )}
            </div>
          </div>

          {/* Syllabus & Rules */}
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Syllabus & Rules</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="text-muted small">Syllabus</label>
                <p className="mb-0">{classData.syllabus || 'No syllabus information'}</p>
              </div>
              <div>
                <label className="text-muted small">Rules</label>
                <p className="mb-0">{classData.rules || 'No rules specified'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          {/* Class Teacher */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Class Teacher</h5>
            </div>
            <div className="card-body">
              {classData.classTeacher ? (
                <div className="text-center">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-3 mx-auto mb-3" style={{width: '60px'}}>
                    <Users size={24} className="text-primary" />
                  </div>
                  <h6 className="mb-0">
                    {classData.classTeacher.firstName} {classData.classTeacher.lastName}
                  </h6>
                  <small className="text-muted">Class Teacher</small>
                </div>
              ) : (
                <p className="text-muted text-center mb-0">No teacher assigned</p>
              )}
            </div>
          </div>

          {/* Schedule */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Schedule</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <div className="d-flex align-items-center mb-2">
                  <Calendar size={16} className="text-muted me-2" />
                  <small className="text-muted">Start Date</small>
                </div>
                <p className="mb-0">
                  {classData.startDate ? new Date(classData.startDate).toLocaleDateString() : 'Not set'}
                </p>
              </div>
              <div>
                <div className="d-flex align-items-center mb-2">
                  <Calendar size={16} className="text-muted me-2" />
                  <small className="text-muted">End Date</small>
                </div>
                <p className="mb-0">
                  {classData.endDate ? new Date(classData.endDate).toLocaleDateString() : 'Not set'}
                </p>
              </div>
            </div>
          </div>

          {/* Capacity */}
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Capacity</h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span>Current Students</span>
                <span className="fw-bold">{classData.currentStudents}</span>
              </div>
              <div className="progress mb-2" style={{height: '10px'}}>
                <div 
                  className="progress-bar" 
                  style={{width: `${(classData.currentStudents / classData.maxStudents) * 100}%`}}
                ></div>
              </div>
              <small className="text-muted">
                {((classData.currentStudents / classData.maxStudents) * 100).toFixed(0)}% filled
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

