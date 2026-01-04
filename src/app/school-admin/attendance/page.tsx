'use client';

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Users, TrendingUp, CheckCircle, XCircle, Clock, Download, Eye, Edit, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '@/lib/api';

interface Class {
  id: number;
  name: string;
  grade: string;
  section: string;
}

interface Student {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  enrollmentNumber: string;
  studentId: number;
}

interface AttendanceRecord {
  id: number;
  studentId: number;
  classId: number;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
  mood?: string;
  student?: Student;
}

interface AttendanceStats {
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendancePercentage: number;
}

export default function SchoolAdminAttendancePage() {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    totalDays: 0,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    attendancePercentage: 0,
  });
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchClassStudents();
      // Always fetch attendance records for students list display
      fetchDailyAttendance();
      if (viewMode === 'monthly') {
        fetchMonthlyStats();
      }
    }
  }, [selectedClass, selectedDate, viewMode, selectedMonth, selectedYear]);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/classes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassStudents = async () => {
    if (!selectedClass) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/students/class/${selectedClass}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched students for class:', selectedClass, 'Count:', data.length);
        setStudents(data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchDailyAttendance = async () => {
    if (!selectedClass) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}/attendance/class/${selectedClass}?date=${selectedDate}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched attendance records:', data);
        console.log('For class:', selectedClass, 'Date:', selectedDate);
        setAttendanceRecords(data);
      } else {
        console.error('Failed to fetch attendance:', response.status);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const fetchMonthlyStats = async () => {
    if (!selectedClass) return;

    try {
      const token = localStorage.getItem('token');
      const startDate = new Date(selectedYear, selectedMonth, 1).toISOString().split('T')[0];
      const endDate = new Date(selectedYear, selectedMonth + 1, 0).toISOString().split('T')[0];

      // Fetch all attendance records for the month
      const response = await fetch(
        `${API_BASE_URL}/attendance/class/${selectedClass}?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAttendanceRecords(data);
      }
    } catch (error) {
      console.error('Error fetching monthly attendance:', error);
    }
  };

  const handleMarkAttendance = async () => {
    if (!selectedClass || students.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Warning',
        text: 'Please select a class with students',
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Mark Attendance',
      html: `
        <div class="text-start">
          <p><strong>Class:</strong> ${classes.find(c => c.id === selectedClass)?.name}</p>
          <p><strong>Date:</strong> ${selectedDate}</p>
          <p><strong>Students:</strong> ${students.length}</p>
          <hr />
          <p class="text-muted small">Mark all students as present by default?</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Mark All Present',
      cancelButtonText: 'Custom Entry',
      showDenyButton: true,
      denyButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      // Confirm button clicked - Mark all as present
      const attendance = students.map(student => ({
        studentId: student.userId, // Use userId (from users table) not student record id
        status: 'present',
      }));

      await submitAttendance(attendance);
    } else if (result.dismiss === 'cancel') {
      // Cancel button (Custom Entry) clicked - Show custom form
      showCustomAttendanceForm();
    }
    // If result.isDenied (Cancel/Deny button), do nothing - just close
  };

  const showCustomAttendanceForm = () => {
    const studentsHtml = students.map(student => `
      <div class="d-flex align-items-center justify-content-between mb-3 p-2 border rounded">
        <div class="flex-grow-1">
          <strong>${student.firstName} ${student.lastName}</strong>
          <br />
          <small class="text-muted">Roll: ${student.enrollmentNumber || 'N/A'}</small>
        </div>
        <select class="form-select form-select-sm w-auto student-status" data-student-id="${student.userId}">
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="late">Late</option>
          <option value="excused">Excused</option>
        </select>
      </div>
    `).join('');

    Swal.fire({
      title: 'Mark Attendance',
      html: `
        <div class="text-start" style="max-height: 400px; overflow-y: auto;">
          ${studentsHtml}
        </div>
      `,
      width: '600px',
      showCancelButton: true,
      confirmButtonText: 'Submit',
      preConfirm: () => {
        const selects = document.querySelectorAll('.student-status');
        const attendance: any[] = [];
        
        selects.forEach((select: any) => {
          attendance.push({
            studentId: parseInt(select.dataset.studentId),
            status: select.value,
          });
        });
        
        return attendance;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        submitAttendance(result.value);
      }
    });
  };

  const submitAttendance = async (attendance: any[]) => {
    try {
      const token = localStorage.getItem('token');
      
      const payload = {
        classId: selectedClass,
        date: selectedDate,
        attendance,
      };
      
      console.log('Submitting attendance:', payload);
      
      const response = await fetch(`${API_BASE_URL}/attendance`, {
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
          title: 'Success',
          text: 'Attendance marked successfully!',
          timer: 2000,
          showConfirmButton: false,
        });
        fetchDailyAttendance();
      } else {
        throw new Error(responseData.message || 'Failed to mark attendance');
      }
    } catch (error: any) {
      console.error('Error submitting attendance:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to mark attendance',
      });
    }
  };

  const handleDeleteRecord = async (recordId: number) => {
    const result = await Swal.fire({
      title: 'Delete Record?',
      text: 'Are you sure you want to delete this attendance record?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it',
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/attendance/${recordId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Record deleted successfully',
            timer: 2000,
            showConfirmButton: false,
          });
          fetchDailyAttendance();
        }
      } catch (error) {
        console.error('Error deleting record:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete record',
        });
      }
    }
  };

  const exportAttendance = () => {
    if (attendanceRecords.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Data',
        text: 'No attendance records to export',
      });
      return;
    }

    const csv = [
      ['Date', 'Student Name', 'Roll Number', 'Status', 'Mood', 'Remarks'],
      ...attendanceRecords.map(record => [
        record.date,
        `${record.student?.firstName || ''} ${record.student?.lastName || ''}`,
        record.student?.enrollmentNumber || 'N/A',
        record.status,
        record.mood || '',
        record.remarks || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${selectedDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'success';
      case 'absent': return 'danger';
      case 'late': return 'warning';
      case 'excused': return 'info';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle size={18} />;
      case 'absent': return <XCircle size={18} />;
      case 'late': return <Clock size={18} />;
      case 'excused': return <CalendarIcon size={18} />;
      default: return null;
    }
  };

  // Calculate daily stats from attendance records
  const getDailyStats = () => {
    const counts = {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      total: attendanceRecords.length,
      attendancePercentage: 0,
    };

    attendanceRecords.forEach(record => {
      switch (record.status) {
        case 'present':
          counts.present++;
          break;
        case 'absent':
          counts.absent++;
          break;
        case 'late':
          counts.late++;
          break;
        case 'excused':
          counts.excused++;
          break;
      }
    });

    // Calculate attendance percentage (present + late = attended)
    if (counts.total > 0) {
      counts.attendancePercentage = Math.round(((counts.present + counts.late) / counts.total) * 100);
    }

    return counts;
  };

  const dailyStats = getDailyStats();

  const renderCalendarView = () => {
    if (viewMode === 'daily') {
      return (
        <div className="text-center py-4">
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-6 col-lg-3">
              <div className="card border-0 shadow h-100" style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>
                <div className="card-body text-white">
                  <h6 className="card-subtitle mb-2">Attendance Rate</h6>
                  <h2 className="card-title display-4 fw-bold">{dailyStats.attendancePercentage}%</h2>
                  <p className="card-text small">For {selectedDate}</p>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <div className="card border-0 shadow h-100" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                <div className="card-body text-white">
                  <h6 className="card-subtitle mb-2">Present</h6>
                  <h2 className="card-title display-4 fw-bold">{dailyStats.present}</h2>
                  <p className="card-text small">Out of {dailyStats.total} students</p>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <div className="card border-0 shadow h-100" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                <div className="card-body text-white">
                  <h6 className="card-subtitle mb-2">Absent</h6>
                  <h2 className="card-title display-4 fw-bold">{dailyStats.absent}</h2>
                  <p className="card-text small">Late: {dailyStats.late}</p>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <div className="card border-0 shadow h-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <div className="card-body text-white">
                  <h6 className="card-subtitle mb-2">Excused</h6>
                  <h2 className="card-title display-4 fw-bold">{dailyStats.excused}</h2>
                  <p className="card-text small">Medical/Leave</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Monthly calendar view
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-cell empty-cell"></div>);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayRecords = attendanceRecords.filter(r => r.date.startsWith(dateStr));
      const isToday = new Date().toDateString() === new Date(dateStr).toDateString();
      const isWeekend = new Date(selectedYear, selectedMonth, day).getDay() === 0; // Only Sunday is weekend

      let statusClass = '';
      let statusText = '';
      let statusCount = '';

      if (dayRecords.length > 0) {
        const presentCount = dayRecords.filter(r => r.status === 'present').length;
        const absentCount = dayRecords.filter(r => r.status === 'absent').length;
        const lateCount = dayRecords.filter(r => r.status === 'late').length;
        const excusedCount = dayRecords.filter(r => r.status === 'excused').length;
        const totalStudents = students.length;

        if (presentCount === totalStudents) {
          statusClass = 'bg-success text-white';
          statusText = 'All Present';
        } else if (absentCount === totalStudents) {
          statusClass = 'bg-danger text-white';
          statusText = 'All Absent';
        } else if (presentCount > absentCount) {
          statusClass = 'bg-success bg-opacity-75 text-white';
          statusText = `${presentCount}/${totalStudents}`;
        } else {
          statusClass = 'bg-warning bg-opacity-75 text-dark';
          statusText = `${presentCount}/${totalStudents}`;
        }
      } else if (isWeekend) {
        statusClass = 'bg-light text-muted';
        statusText = 'Sunday';
      } else {
        statusClass = 'bg-light text-muted';
        statusText = 'No Data';
      }

      days.push(
        <div
          key={day}
          className={`calendar-cell ${statusClass} ${isToday ? 'border border-primary border-3' : ''}`}
          style={{
            minHeight: '80px',
            padding: '8px',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onClick={() => {
            if (!isWeekend) {
              setSelectedDate(dateStr);
              setViewMode('daily');
            }
          }}
        >
          <div className="d-flex flex-column h-100">
            <div className="fw-bold mb-1">{day}</div>
            <div className="small text-center flex-grow-1 d-flex align-items-center justify-content-center">
              {statusText}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div>
        {/* Calendar Navigation */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <button
            className="btn btn-outline-primary"
            onClick={() => {
              if (selectedMonth === 0) {
                setSelectedMonth(11);
                setSelectedYear(selectedYear - 1);
              } else {
                setSelectedMonth(selectedMonth - 1);
              }
            }}
          >
            ← Previous
          </button>
          <h4 className="mb-0 fw-bold">
            {months[selectedMonth]} {selectedYear}
          </h4>
          <button
            className="btn btn-outline-primary"
            onClick={() => {
              if (selectedMonth === 11) {
                setSelectedMonth(0);
                setSelectedYear(selectedYear + 1);
              } else {
                setSelectedMonth(selectedMonth + 1);
              }
            }}
          >
            Next →
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="calendar-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '8px',
          marginBottom: '20px'
        }}>
          {/* Day Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center fw-bold text-muted py-2">
              {day}
            </div>
          ))}
          {days}
        </div>

        {/* Legend */}
        <div className="d-flex flex-wrap gap-3 justify-content-center">
          <div className="d-flex align-items-center gap-2">
            <div className="bg-success rounded" style={{ width: '20px', height: '20px' }}></div>
            <small>All Present</small>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div className="bg-success bg-opacity-75 rounded" style={{ width: '20px', height: '20px' }}></div>
            <small>Mostly Present</small>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div className="bg-warning bg-opacity-75 rounded" style={{ width: '20px', height: '20px' }}></div>
            <small>Low Attendance</small>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div className="bg-danger rounded" style={{ width: '20px', height: '20px' }}></div>
            <small>All Absent</small>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div className="bg-light rounded" style={{ width: '20px', height: '20px' }}></div>
            <small>No Data</small>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div className="bg-light text-muted rounded" style={{ width: '20px', height: '20px' }}></div>
            <small>Sunday (Holiday)</small>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container-fluid vh-100 d-flex justify-content-center align-items-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: '4rem', height: '4rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4 className="mt-3">Loading Attendance...</h4>
        </div>
      </div>
    );
  }

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh' }}>
      <div className="container-fluid p-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-lg" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <div className="card-body text-white p-4">
                <h1 className="display-5 fw-bold mb-2">
                  <CalendarIcon size={50} className="me-3" />
                  Attendance Management
                </h1>
                <p className="mb-0 opacity-75">Manage and track student attendance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow">
              <div className="card-body">
                <div className="row g-3 align-items-end">
                  <div className="col-12 col-md-3">
                    <label className="form-label fw-semibold">Select Class</label>
                    <select
                      className="form-select"
                      value={selectedClass || ''}
                      onChange={(e) => setSelectedClass(Number(e.target.value))}
                    >
                      <option value="">Choose a class...</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {viewMode === 'daily' ? (
                    <div className="col-12 col-md-3">
                      <label className="form-label fw-semibold">Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                      />
                    </div>
                  ) : (
                    <>
                      <div className="col-12 col-md-2">
                        <label className="form-label fw-semibold">Month</label>
                        <select
                          className="form-select"
                          value={selectedMonth}
                          onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        >
                          {months.map((month, index) => (
                            <option key={index} value={index}>{month}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-12 col-md-2">
                        <label className="form-label fw-semibold">Year</label>
                        <select
                          className="form-select"
                          value={selectedYear}
                          onChange={(e) => setSelectedYear(Number(e.target.value))}
                        >
                          {[2023, 2024, 2025, 2026].map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  <div className="col-12 col-md-2">
                    <label className="form-label fw-semibold">View</label>
                    <div className="btn-group w-100">
                      <button
                        className={`btn ${viewMode === 'daily' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setViewMode('daily')}
                      >
                        Daily
                      </button>
                      <button
                        className={`btn ${viewMode === 'monthly' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setViewMode('monthly')}
                      >
                        Stats
                      </button>
                    </div>
                  </div>

                  <div className="col-12 col-md-4">
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-success flex-grow-1"
                        onClick={handleMarkAttendance}
                        disabled={!selectedClass}
                      >
                        <CheckCircle size={18} className="me-2" />
                        Mark Attendance
                      </button>
                      <button
                        className="btn btn-outline-primary"
                        onClick={exportAttendance}
                        disabled={!selectedClass || attendanceRecords.length === 0}
                      >
                        <Download size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Students List */}
        {selectedClass && students.length > 0 && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="card border-0 shadow">
                <div className="card-header bg-white border-0 py-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold">
                      <Users size={24} className="me-2" />
                      Students - {classes.find(c => c.id === selectedClass)?.name}
                    </h5>
                    <span className="badge bg-primary fs-6">
                      {students.length} Students
                    </span>
                  </div>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th className="border-0 py-3">S.No</th>
                          <th className="border-0 py-3">Student Name</th>
                          <th className="border-0 py-3">Enrollment Number</th>
                          <th className="border-0 py-3">Attendance Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((student, index) => {
                          // Find attendance record for this student
                          const attendanceRecord = attendanceRecords.find(
                            record => record.studentId === student.userId
                          );
                          
                          // Debug logging
                          if (index === 0) {
                            console.log('Debug - Students:', students.map(s => ({ id: s.id, userId: s.userId, name: s.firstName })));
                            console.log('Debug - Attendance Records:', attendanceRecords.map(r => ({ studentId: r.studentId, status: r.status })));
                            console.log('Debug - Looking for student userId:', student.userId);
                            console.log('Debug - Found record:', attendanceRecord);
                          }
                          
                          return (
                            <tr key={student.id}>
                              <td className="py-3">{index + 1}</td>
                              <td className="py-3">
                                <div className="fw-semibold">
                                  {student.firstName} {student.lastName}
                                </div>
                              </td>
                              <td className="py-3">
                                <span className="badge bg-light text-dark">
                                  {student.enrollmentNumber || 'N/A'}
                                </span>
                              </td>
                              <td className="py-3">
                                {attendanceRecord ? (
                                  <span className={`badge bg-${getStatusColor(attendanceRecord.status)} d-flex align-items-center gap-1`} style={{ width: 'fit-content' }}>
                                    {getStatusIcon(attendanceRecord.status)}
                                    {attendanceRecord.status.toUpperCase()}
                                  </span>
                                ) : (
                                  <span className="badge bg-secondary">
                                    Not Marked
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Calendar View */}
        {selectedClass && (
          <div className="card border-0 shadow mb-4">
            <div className="card-header bg-white border-0 py-3">
              <div className="d-flex align-items-center justify-content-between">
                <h5 className="mb-0 fw-bold">
                  <CalendarIcon className="me-2 text-primary" size={20} />
                  Attendance Calendar
                </h5>
                <div className="d-flex gap-2">
                  <button
                    className={`btn btn-sm ${viewMode === 'daily' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setViewMode('daily')}
                  >
                    Daily View
                  </button>
                  <button
                    className={`btn btn-sm ${viewMode === 'monthly' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setViewMode('monthly')}
                  >
                    Monthly View
                  </button>
                </div>
              </div>
            </div>
            <div className="card-body">
              {renderCalendarView()}
            </div>
          </div>
        )}

        {/* Attendance Records Table (Daily View) */}
        {viewMode === 'daily' && (
          <div className="row">
            <div className="col-12">
              <div className="card border-0 shadow">
                <div className="card-header bg-white border-0 py-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold">
                      Attendance for {selectedDate}
                      {selectedClass && ` - ${classes.find(c => c.id === selectedClass)?.name}`}
                    </h5>
                    <span className="badge bg-primary">
                      {attendanceRecords.length} / {students.length} students
                    </span>
                  </div>
                </div>
                <div className="card-body p-0">
                  {!selectedClass ? (
                    <div className="text-center py-5 text-muted">
                      <Users size={60} style={{ opacity: 0.3 }} />
                      <p className="mt-3">Please select a class to view attendance</p>
                    </div>
                  ) : attendanceRecords.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <CalendarIcon size={60} style={{ opacity: 0.3 }} />
                      <p className="mt-3">No attendance records for this date</p>
                      <button className="btn btn-primary mt-2" onClick={handleMarkAttendance}>
                        Mark Attendance Now
                      </button>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="bg-light">
                          <tr>
                            <th className="border-0 py-3">Student Name</th>
                            <th className="border-0 py-3">Roll Number</th>
                            <th className="border-0 py-3">Status</th>
                            <th className="border-0 py-3">Mood</th>
                            <th className="border-0 py-3">Remarks</th>
                            <th className="border-0 py-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attendanceRecords.map((record) => (
                            <tr key={record.id}>
                              <td className="py-3">
                                <div className="fw-semibold">
                                  {record.student?.firstName} {record.student?.lastName}
                                </div>
                              </td>
                              <td className="py-3">
                                {record.student?.enrollmentNumber || 'N/A'}
                              </td>
                              <td className="py-3">
                                <span className={`badge bg-${getStatusColor(record.status)} d-flex align-items-center gap-1`} style={{ width: 'fit-content' }}>
                                  {getStatusIcon(record.status)}
                                  {record.status.toUpperCase()}
                                </span>
                              </td>
                              <td className="py-3">
                                {record.mood && (
                                  <span className="badge bg-light text-dark">
                                    {record.mood}
                                  </span>
                                )}
                              </td>
                              <td className="py-3">
                                <span className="text-muted small">
                                  {record.remarks || '-'}
                                </span>
                              </td>
                              <td className="py-3">
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDeleteRecord(record.id)}
                                >
                                  <Trash2 size={16} />
                                </button>
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
          </div>
        )}
      </div>

      <style jsx>{`
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

