'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar as CalendarIcon, TrendingUp, Award, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';

interface AttendanceRecord {
  id: number;
  studentId: number;
  classId: number;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
  mood?: string;
  markedById: number;
  createdAt: string;
  updatedAt: string;
}

interface AttendanceStats {
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendancePercentage: number;
}

export default function StudentAttendancePage() {
  const [loading, setLoading] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    totalDays: 0,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    attendancePercentage: 0,
  });
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  useEffect(() => {
    fetchAttendance();
  }, [selectedMonth, selectedYear]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
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
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Please login again',
        });
        setLoading(false);
        return;
      }

      // Calculate date range for selected month
      const startDate = new Date(selectedYear, selectedMonth, 1).toISOString().split('T')[0];
      const endDate = new Date(selectedYear, selectedMonth + 1, 0).toISOString().split('T')[0];

      // Fetch attendance records
      const recordsResponse = await fetch(
        `http://localhost:3001/attendance/student/${userId}?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (recordsResponse.ok) {
        const records = await recordsResponse.json();
        setAttendanceRecords(records);
      }

      // Fetch attendance stats
      const statsResponse = await fetch(
        `http://localhost:3001/attendance/stats/student/${userId}?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

    } catch (error) {
      console.error('Error fetching attendance:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load attendance data',
      });
    } finally {
      setLoading(false);
    }
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
      case 'present': return <CheckCircle size={20} />;
      case 'absent': return <XCircle size={20} />;
      case 'late': return <Clock size={20} />;
      case 'excused': return <AlertCircle size={20} />;
      default: return null;
    }
  };

  const getMoodEmoji = (mood?: string) => {
    switch (mood) {
      case 'happy': return '😊';
      case 'sad': return '😢';
      case 'sick': return '🤒';
      case 'energetic': return '⚡';
      default: return '';
    }
  };

  const renderCalendarView = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();
    const days = [];

    console.log('Calendar Debug:', {
      selectedYear,
      selectedMonth,
      daysInMonth,
      firstDayOfMonth,
      attendanceRecords: attendanceRecords.length
    });

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-cell empty-cell"></div>);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const record = attendanceRecords.find(r => r.date.startsWith(dateStr));
      const isToday = new Date().toDateString() === new Date(dateStr).toDateString();
      const isWeekend = new Date(selectedYear, selectedMonth, day).getDay() === 0 || new Date(selectedYear, selectedMonth, day).getDay() === 6;

      days.push(
        <div
          key={day}
          className={`calendar-cell ${record ? 'has-attendance' : 'no-attendance'} ${isToday ? 'today-cell' : ''} ${isWeekend ? 'weekend-cell' : ''}`}
          title={record ? `${record.status.toUpperCase()} - ${record.mood || 'No mood recorded'}` : 'No attendance recorded'}
        >
          <div className="cell-header">
            <span className="day-number">{day}</span>
            {isToday && <span className="today-indicator">●</span>}
          </div>
          
          <div className="cell-content">
            {record ? (
              <div className="attendance-info">
                <div className={`status-indicator ${record.status}`}>
                  {getStatusIcon(record.status)}
                </div>
                <div className="status-text">{record.status.toUpperCase()}</div>
                {record.mood && (
                  <div className="mood-indicator">
                    {getMoodEmoji(record.mood)}
                  </div>
                )}
                {record.remarks && (
                  <div className="remarks-indicator" title={record.remarks}>
                    📝
                  </div>
                )}
              </div>
            ) : (
              <div className="no-attendance">
                <span className="no-data">—</span>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="attendance-calendar">
        <div className="calendar-header-row">
          <div className="header-cell">Sunday</div>
          <div className="header-cell">Monday</div>
          <div className="header-cell">Tuesday</div>
          <div className="header-cell">Wednesday</div>
          <div className="header-cell">Thursday</div>
          <div className="header-cell">Friday</div>
          <div className="header-cell">Saturday</div>
        </div>
        <div className="calendar-grid-container">
          {days}
        </div>
      </div>
    );
  };

  const renderListView = () => {
    const sortedRecords = [...attendanceRecords].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return (
      <div className="table-responsive">
        <table className="table table-hover">
          <thead className="bg-light">
            <tr>
              <th>Date</th>
              <th>Day</th>
              <th>Status</th>
              <th>Mood</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {sortedRecords.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-muted py-5">
                  No attendance records for this month
                </td>
              </tr>
            ) : (
              sortedRecords.map((record) => (
                <tr key={record.id}>
                  <td>
                    {new Date(record.date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                  <td>
                    {new Date(record.date).toLocaleDateString('en-IN', { weekday: 'long' })}
                  </td>
                  <td>
                    <span className={`badge bg-${getStatusColor(record.status)} d-flex align-items-center gap-1`} style={{ width: 'fit-content' }}>
                      {getStatusIcon(record.status)}
                      {record.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {record.mood && (
                      <span className="badge bg-light text-dark">
                        {getMoodEmoji(record.mood)} {record.mood}
                      </span>
                    )}
                  </td>
                  <td className="text-muted small">
                    {record.remarks || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container-fluid vh-100 d-flex justify-content-center align-items-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="text-center">
          <div className="spinner-border text-light" role="status" style={{ width: '4rem', height: '4rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4 className="text-white mt-3">Loading Attendance...</h4>
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
                <Link href="/student/dashboard" className="btn btn-light btn-sm mb-3">
                  <ArrowLeft size={16} className="me-2" />
                  Back to Dashboard
                </Link>
                <h1 className="display-5 fw-bold mb-2">
                  <CalendarIcon size={50} className="me-3" />
                  My Attendance
                </h1>
                <p className="mb-0 opacity-75">Track your attendance and view records</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-6 col-lg-3">
            <div className="card border-0 shadow h-100" style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>
              <div className="card-body text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-subtitle mb-2">Attendance Rate</h6>
                    <h2 className="card-title display-4 fw-bold">
                      {stats.attendancePercentage.toFixed(1)}%
                    </h2>
                    <p className="card-text small">This month</p>
                  </div>
                  <div>
                    <TrendingUp size={50} style={{ opacity: 0.7 }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <div className="card border-0 shadow h-100" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
              <div className="card-body text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-subtitle mb-2">Present Days</h6>
                    <h2 className="card-title display-4 fw-bold">{stats.present}</h2>
                    <p className="card-text small">Out of {stats.totalDays} days</p>
                  </div>
                  <div>
                    <CheckCircle size={50} style={{ opacity: 0.7 }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <div className="card border-0 shadow h-100" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
              <div className="card-body text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-subtitle mb-2">Absent Days</h6>
                    <h2 className="card-title display-4 fw-bold">{stats.absent}</h2>
                    <p className="card-text small">Late: {stats.late}</p>
                  </div>
                  <div>
                    <XCircle size={50} style={{ opacity: 0.7 }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <div className="card border-0 shadow h-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <div className="card-body text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-subtitle mb-2">Excused</h6>
                    <h2 className="card-title display-4 fw-bold">{stats.excused}</h2>
                    <p className="card-text small">Medical/Leave</p>
                  </div>
                  <div>
                    <Award size={50} style={{ opacity: 0.7 }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow">
              <div className="card-body">
                <div className="row g-3 align-items-center">
                  <div className="col-12 col-md-4">
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
                  <div className="col-12 col-md-4">
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
                  <div className="col-12 col-md-4">
                    <label className="form-label fw-semibold">View Mode</label>
                    <div className="btn-group w-100" role="group">
                      <button
                        type="button"
                        className={`btn ${viewMode === 'calendar' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setViewMode('calendar')}
                      >
                        <CalendarIcon size={16} className="me-2" />
                        Calendar
                      </button>
                      <button
                        type="button"
                        className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setViewMode('list')}
                      >
                        List
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance View */}
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="mb-0 fw-bold">
                  {months[selectedMonth]} {selectedYear} Attendance
                </h5>
              </div>
              <div className="card-body">
                {viewMode === 'calendar' ? renderCalendarView() : renderListView()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* Calendar Container */
        .attendance-calendar {
          width: 100%;
          background: #fff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        /* Calendar Header */
        .calendar-header-row {
          display: grid !important;
          grid-template-columns: repeat(7, 1fr) !important;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .header-cell {
          padding: 16px 8px;
          text-align: center;
          font-weight: 600;
          font-size: 14px;
          border-right: 1px solid rgba(255, 255, 255, 0.1);
        }

        .header-cell:last-child {
          border-right: none;
        }

        /* Calendar Grid */
        .calendar-grid-container {
          display: grid !important;
          grid-template-columns: repeat(7, 1fr) !important;
          gap: 2px;
          background: #f8f9fa;
          padding: 2px;
        }

        /* Calendar Cells */
        .calendar-cell {
          aspect-ratio: 1;
          background: white;
          border-radius: 8px;
          padding: 8px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          min-height: 100px;
          border: 1px solid #e9ecef;
        }

        .calendar-cell.empty-cell {
          background: transparent;
          border: none;
        }

        .calendar-cell.today-cell {
          background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
          border: 2px solid #2196f3;
          box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
        }

        .calendar-cell.weekend-cell {
          background: #fafafa;
        }

        .calendar-cell.has-attendance {
          cursor: pointer;
          border: 2px solid transparent;
        }

        .calendar-cell.has-attendance:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          border-color: #667eea;
        }

        .calendar-cell.no-attendance {
          opacity: 0.6;
        }

        /* Cell Header */
        .cell-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .day-number {
          font-size: 16px;
          font-weight: 700;
          color: #333;
        }

        .today-indicator {
          color: #2196f3;
          font-size: 12px;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* Cell Content */
        .cell-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .attendance-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          width: 100%;
        }

        .status-indicator {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
        }

        .status-indicator.present {
          background: linear-gradient(135deg, #4caf50, #66bb6a);
          color: white;
        }

        .status-indicator.absent {
          background: linear-gradient(135deg, #f44336, #ef5350);
          color: white;
        }

        .status-indicator.late {
          background: linear-gradient(135deg, #ff9800, #ffb74d);
          color: white;
        }

        .status-indicator.excused {
          background: linear-gradient(135deg, #2196f3, #42a5f5);
          color: white;
        }

        .status-text {
          font-size: 10px;
          font-weight: 600;
          text-align: center;
          color: #555;
        }

        .mood-indicator {
          font-size: 16px;
          margin-top: 2px;
        }

        .remarks-indicator {
          font-size: 12px;
          margin-top: 2px;
          opacity: 0.7;
        }

        .no-attendance {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
        }

        .no-data {
          font-size: 24px;
          color: #ccc;
          font-weight: 300;
        }

        /* Card Hover Effects */
        .card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .calendar-grid-container {
            gap: 1px;
          }

          .calendar-cell {
            min-height: 80px;
            padding: 6px;
          }

          .header-cell {
            padding: 12px 4px;
            font-size: 12px;
          }

          .day-number {
            font-size: 14px;
          }

          .status-indicator {
            width: 24px;
            height: 24px;
          }

          .status-text {
            font-size: 8px;
          }

          .mood-indicator {
            font-size: 12px;
          }
        }

        @media (max-width: 480px) {
          .calendar-cell {
            min-height: 60px;
            padding: 4px;
          }

          .day-number {
            font-size: 12px;
          }

          .status-indicator {
            width: 20px;
            height: 20px;
          }

          .status-text {
            font-size: 7px;
          }
        }
      `}</style>
    </div>
  );
}

