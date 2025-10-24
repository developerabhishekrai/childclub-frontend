'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar as CalendarIcon, Users, CheckCircle, XCircle, Clock, AlertCircle, Save, BarChart3 } from 'lucide-react';
import Swal from 'sweetalert2';

interface Class {
  id: number;
  name: string;
  grade: string;
  section: string;
}

interface Student {
  id: number;
  userId: number; // User table ka ID (for attendance)
  firstName: string;
  lastName: string;
  enrollmentNumber: string;
  studentId: number; // Student record ID
}

interface AttendanceRecord {
  studentId: number;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
  mood?: string;
}

export default function TeacherAttendancePage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Map<number, AttendanceRecord>>(new Map());
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTeacherClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchClassStudents(selectedClass);
      fetchExistingAttendance(selectedClass, attendanceDate);
    }
  }, [selectedClass, attendanceDate]);

  const fetchTeacherClasses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      // Fetch teacher's classes
      const response = await fetch(`http://localhost:3001/teachers/user/${userId}/classes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      } else {
        // Fallback to all classes if teacher-specific endpoint doesn't exist
        const allClassesResponse = await fetch('http://localhost:3001/classes', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (allClassesResponse.ok) {
          const allClasses = await allClassesResponse.json();
          setClasses(allClasses);
        }
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load classes',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClassStudents = async (classId: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Use correct endpoint: /students/class/${classId}
      const response = await fetch(`http://localhost:3001/students/class/${classId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched students for teacher class:', classId, 'Count:', data.length);
        setStudents(data);

        // Initialize attendance for all students as 'present' by default
        // Use userId (from users table) not student record id
        const initialAttendance = new Map<number, AttendanceRecord>();
        data.forEach((student: any) => {
          initialAttendance.set(student.userId, {
            studentId: student.userId, // Use userId for attendance
            status: 'present'
          });
        });
        setAttendance(initialAttendance);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingAttendance = async (classId: number, date: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3001/attendance/class/${classId}?date=${date}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          const existingAttendance = new Map<number, AttendanceRecord>();
          data.forEach((record: any) => {
            existingAttendance.set(record.studentId, {
              studentId: record.studentId,
              status: record.status,
              remarks: record.remarks,
              mood: record.mood,
            });
          });
          setAttendance(existingAttendance);
        }
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const updateAttendance = (studentId: number, field: keyof AttendanceRecord, value: any) => {
    setAttendance(prev => {
      const newMap = new Map(prev);
      const record = newMap.get(studentId) || { studentId, status: 'present' };
      newMap.set(studentId, { ...record, [field]: value });
      return newMap;
    });
  };

  const markAllAs = (status: 'present' | 'absent' | 'late' | 'excused') => {
    setAttendance(prev => {
      const newMap = new Map(prev);
      students.forEach((student: any) => {
        const userId = student.userId; // Use userId from users table
        const record = newMap.get(userId) || { studentId: userId, status: 'present' };
        newMap.set(userId, { ...record, status });
      });
      return newMap;
    });
  };

  const handleSubmit = async () => {
    if (!selectedClass) {
      Swal.fire({
        icon: 'warning',
        title: 'Warning',
        text: 'Please select a class',
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Submit Attendance?',
      text: `Marking attendance for ${students.length} students on ${attendanceDate}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, submit',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const attendanceData = Array.from(attendance.values());

      const payload = {
        classId: selectedClass,
        date: attendanceDate,
        attendance: attendanceData,
      };

      console.log('Teacher submitting attendance:', payload);

      const response = await fetch('http://localhost:3001/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      console.log('Attendance response:', responseData);

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Attendance marked successfully',
          timer: 2000,
          showConfirmButton: false,
        });
        fetchExistingAttendance(selectedClass, attendanceDate);
      } else {
        throw new Error(responseData.message || 'Failed to mark attendance');
      }
    } catch (error: any) {
      console.error('Error marking attendance:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to mark attendance. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusCounts = () => {
    const counts = {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
    };

    attendance.forEach(record => {
      counts[record.status]++;
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh' }}>
      <div className="container-fluid p-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-lg bg-primary">
              <div className="card-body text-white p-4">
                <Link href="/teacher/dashboard" className="btn btn-light btn-sm mb-3">
                  <ArrowLeft size={16} className="me-2" />
                  Back to Dashboard
                </Link>
                <h1 className="display-5 fw-bold mb-2">
                  <CalendarIcon size={50} className="me-3" />
                  Mark Attendance
                </h1>
                <p className="mb-0 opacity-75">Record daily attendance for your class</p>
              </div>
            </div>
          </div>
        </div>

        {/* Class and Date Selection */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow">
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold">Select Class</label>
                    <select
                      value={selectedClass || ''}
                      onChange={(e) => setSelectedClass(Number(e.target.value))}
                      className="form-select form-select-lg"
                    >
                      <option value="">Choose a class...</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold">Date</label>
                    <input
                      type="date"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      className="form-control form-control-lg"
                    />
                  </div>
                </div>

                {selectedClass && students.length > 0 && (
                  <div className="mt-4">
                    <label className="form-label fw-semibold">Quick Actions</label>
                    <div className="btn-group w-100" role="group">
                      <button
                        type="button"
                        className="btn btn-outline-success"
                        onClick={() => markAllAs('present')}
                      >
                        <CheckCircle size={18} className="me-2" />
                        Mark All Present
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => markAllAs('absent')}
                      >
                        <XCircle size={18} className="me-2" />
                        Mark All Absent
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-warning"
                        onClick={() => markAllAs('late')}
                      >
                        <Clock size={18} className="me-2" />
                        Mark All Late
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        {selectedClass && students.length > 0 && (
          <div className="row g-3 mb-4">
            <div className="col-6 col-md-3">
              <div className="card border-0 shadow h-100 bg-success text-white">
                <div className="card-body text-center">
                  <CheckCircle size={30} className="mb-2" />
                  <h3 className="mb-0">{statusCounts.present}</h3>
                  <small>Present</small>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card border-0 shadow h-100 bg-danger text-white">
                <div className="card-body text-center">
                  <XCircle size={30} className="mb-2" />
                  <h3 className="mb-0">{statusCounts.absent}</h3>
                  <small>Absent</small>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card border-0 shadow h-100 bg-warning text-white">
                <div className="card-body text-center">
                  <Clock size={30} className="mb-2" />
                  <h3 className="mb-0">{statusCounts.late}</h3>
                  <small>Late</small>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card border-0 shadow h-100 bg-info text-white">
                <div className="card-body text-center">
                  <AlertCircle size={30} className="mb-2" />
                  <h3 className="mb-0">{statusCounts.excused}</h3>
                  <small>Excused</small>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Table */}
        {selectedClass && students.length > 0 && (
          <div className="row">
            <div className="col-12">
              <div className="card border-0 shadow">
                <div className="card-header bg-white border-0 py-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold">
                      <Users size={20} className="me-2" />
                      Student List ({students.length} students)
                    </h5>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="btn btn-primary"
                    >
                      <Save size={18} className="me-2" />
                      {submitting ? 'Saving...' : 'Save Attendance'}
                    </button>
                  </div>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th className="border-0 py-3">Roll No</th>
                          <th className="border-0 py-3">Student Name</th>
                          <th className="border-0 py-3">Status</th>
                          <th className="border-0 py-3">Mood</th>
                          <th className="border-0 py-3">Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((student: any) => {
                          const userId = student.userId; // Use userId from users table
                          const record = attendance.get(userId) || { studentId: userId, status: 'present' };
                          return (
                            <tr key={student.id}>
                              <td className="py-3 align-middle">
                                <span className="badge bg-secondary">
                                  {student.enrollmentNumber || 'N/A'}
                                </span>
                              </td>
                              <td className="py-3 align-middle">
                                <div className="fw-semibold">
                                  {student.firstName} {student.lastName}
                                </div>
                              </td>
                              <td className="py-3 align-middle">
                                <select
                                  value={record.status}
                                  onChange={(e) => updateAttendance(userId, 'status', e.target.value)}
                                  className={`form-select form-select-sm w-auto bg-${
                                    record.status === 'present' ? 'success' :
                                    record.status === 'absent' ? 'danger' :
                                    record.status === 'late' ? 'warning' : 'info'
                                  } text-white border-0`}
                                  style={{ minWidth: '120px' }}
                                >
                                  <option value="present">✓ Present</option>
                                  <option value="absent">✗ Absent</option>
                                  <option value="late">⏰ Late</option>
                                  <option value="excused">📋 Excused</option>
                                </select>
                              </td>
                              <td className="py-3 align-middle">
                                <select
                                  value={record.mood || ''}
                                  onChange={(e) => updateAttendance(userId, 'mood', e.target.value)}
                                  className="form-select form-select-sm w-auto"
                                  style={{ minWidth: '140px' }}
                                >
                                  <option value="">Select mood...</option>
                                  <option value="happy">😊 Happy</option>
                                  <option value="sad">😢 Sad</option>
                                  <option value="sick">🤒 Sick</option>
                                  <option value="energetic">⚡ Energetic</option>
                                  <option value="tired">😴 Tired</option>
                                </select>
                              </td>
                              <td className="py-3 align-middle">
                                <input
                                  type="text"
                                  value={record.remarks || ''}
                                  onChange={(e) => updateAttendance(userId, 'remarks', e.target.value)}
                                  className="form-control form-control-sm"
                                  placeholder="Add remarks..."
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="card-footer bg-white border-0 py-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="text-muted">
                      <small>Total: {students.length} students</small>
                    </div>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="btn btn-primary btn-lg"
                    >
                      <Save size={20} className="me-2" />
                      {submitting ? 'Saving...' : 'Save Attendance'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedClass && students.length === 0 && !loading && (
          <div className="row">
            <div className="col-12">
              <div className="card border-0 shadow">
                <div className="card-body text-center py-5">
                  <Users size={60} style={{ opacity: 0.3 }} className="text-muted mb-3" />
                  <h5 className="text-muted">No students found in this class</h5>
                  <p className="text-muted">Please select a different class or add students first.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!selectedClass && (
          <div className="row">
            <div className="col-12">
              <div className="card border-0 shadow">
                <div className="card-body text-center py-5">
                  <CalendarIcon size={60} style={{ opacity: 0.3 }} className="text-muted mb-3" />
                  <h5 className="text-muted">Select a class to mark attendance</h5>
                  <p className="text-muted">Choose a class from the dropdown above to get started.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .table tbody tr {
          transition: background-color 0.2s ease;
        }
        .table tbody tr:hover {
          background-color: #f8f9fa;
        }
      `}</style>
    </div>
  );
}
