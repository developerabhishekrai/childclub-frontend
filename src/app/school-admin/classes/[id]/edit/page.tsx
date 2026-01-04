'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { apiGet, getStoredToken, API_BASE_URL } from '@/lib/api';

interface Class {
  id: number;
  name: string;
  grade: string;
  section: string;
  academicYear: string;
  maxStudents: number;
  description?: string;
  subjects?: any;
  syllabus?: string;
  rules?: string;
  classTeacherId?: number;
  startDate?: string;
  endDate?: string;
  status: string;
}

interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
  teacherId: number;
}

export default function EditClassPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    section: '',
    academicYear: '',
    maxStudents: 30,
    description: '',
    subjects: '',
    syllabus: '',
    rules: '',
    classTeacherId: '',
    startDate: '',
    endDate: '',
    status: 'ACTIVE'
  });

  // Fetch teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const token = getStoredToken();
        if (!token) return;

        const response = await apiGet<Teacher[]>('/teachers', { token });
        setTeachers(response);
      } catch (error) {
        console.error('Error fetching teachers:', error);
      } finally {
        setLoadingTeachers(false);
      }
    };

    fetchTeachers();
  }, []);

  // Fetch class details
  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        setLoading(true);
        const token = getStoredToken();
        
        if (!token) {
          throw new Error('Authentication required');
        }

        const response = await apiGet<Class>(`/classes/${classId}`, { token });
        
        // Populate form with existing data
        // Convert subjects to comma-separated string for better display
        let subjectsString = '';
        if (response.subjects) {
          if (Array.isArray(response.subjects)) {
            subjectsString = response.subjects.join(', ');
          } else if (typeof response.subjects === 'object') {
            subjectsString = Object.values(response.subjects).join(', ');
          } else {
            subjectsString = response.subjects;
          }
        }
        
        setFormData({
          name: response.name || '',
          grade: response.grade || '',
          section: response.section || '',
          academicYear: response.academicYear || '',
          maxStudents: response.maxStudents || 30,
          description: response.description || '',
          subjects: subjectsString,
          syllabus: response.syllabus || '',
          rules: response.rules || '',
          classTeacherId: response.classTeacherId ? response.classTeacherId.toString() : '',
          startDate: response.startDate ? response.startDate.split('T')[0] : '',
          endDate: response.endDate ? response.endDate.split('T')[0] : '',
          status: response.status || 'ACTIVE'
        });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      const token = getStoredToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      // Prepare payload
      const payload: any = {
        name: formData.name,
        grade: formData.grade,
        section: formData.section,
        academicYear: formData.academicYear,
        maxStudents: parseInt(formData.maxStudents.toString()),
        description: formData.description,
        syllabus: formData.syllabus,
        rules: formData.rules,
        status: formData.status
      };

      // Parse subjects if provided
      if (formData.subjects) {
        try {
          payload.subjects = JSON.parse(formData.subjects);
        } catch {
          payload.subjects = formData.subjects.split(',').map(s => s.trim());
        }
      }

      if (formData.startDate) {
        payload.startDate = new Date(formData.startDate);
      }

      if (formData.endDate) {
        payload.endDate = new Date(formData.endDate);
      }

      if (formData.classTeacherId) {
        payload.classTeacherId = parseInt(formData.classTeacherId);
      }

      const response = await fetch(`${API_BASE_URL}/classes/${classId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update class');
      }

      alert('Class updated successfully!');
      router.push('/school-admin/classes');
    } catch (error: any) {
      console.error('Error updating class:', error);
      alert(error?.message || 'Failed to update class');
    } finally {
      setSubmitting(false);
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

  if (error) {
    return (
      <div className="container-fluid">
        <div className="alert alert-danger" role="alert">
          <h5 className="alert-heading">Error</h5>
          <p>{error}</p>
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
            <h1 className="h3 mb-0">Edit Class</h1>
            <p className="text-muted mb-0">Update class information</p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card">
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="row g-4">
                  {/* Basic Information */}
                  <div className="col-12">
                    <h5 className="border-bottom pb-2 mb-3">Basic Information</h5>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Class Name <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Grade <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.grade}
                      onChange={(e) => setFormData({...formData, grade: e.target.value})}
                      required
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Section <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.section}
                      onChange={(e) => setFormData({...formData, section: e.target.value})}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Academic Year</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g., 2024-2025"
                      value={formData.academicYear}
                      onChange={(e) => setFormData({...formData, academicYear: e.target.value})}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Max Students <span className="text-danger">*</span></label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.maxStudents}
                      onChange={(e) => setFormData({...formData, maxStudents: parseInt(e.target.value)})}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>

                  {/* Academic Details */}
                  <div className="col-12 mt-4">
                    <h5 className="border-bottom pb-2 mb-3">Academic Details</h5>
                  </div>

                  <div className="col-12">
                    <label className="form-label">Subjects (comma-separated or JSON)</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      placeholder="e.g., Math, Science, English"
                      value={formData.subjects}
                      onChange={(e) => setFormData({...formData, subjects: e.target.value})}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Syllabus</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={formData.syllabus}
                      onChange={(e) => setFormData({...formData, syllabus: e.target.value})}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Rules</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={formData.rules}
                      onChange={(e) => setFormData({...formData, rules: e.target.value})}
                    />
                  </div>

                  {/* Class Teacher & Schedule */}
                  <div className="col-12 mt-4">
                    <h5 className="border-bottom pb-2 mb-3">Teacher & Schedule</h5>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Class Teacher</label>
                    <select
                      className="form-select"
                      value={formData.classTeacherId}
                      onChange={(e) => setFormData({...formData, classTeacherId: e.target.value})}
                      disabled={loadingTeachers}
                    >
                      <option value="">
                        {loadingTeachers ? 'Loading teachers...' : 'Select Class Teacher (Optional)'}
                      </option>
                      {teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.firstName} {teacher.lastName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">End Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    />
                  </div>

                  {/* Actions */}
                  <div className="col-12 mt-4">
                    <div className="d-flex gap-3 justify-content-end">
                      <Link 
                        href="/school-admin/classes" 
                        className="btn btn-secondary"
                      >
                        Cancel
                      </Link>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Updating...
                          </>
                        ) : (
                          <>
                            <Save size={16} className="me-2" />
                            Update Class
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

