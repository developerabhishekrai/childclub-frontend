'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, TrendingUp, TrendingDown, Award, BookOpen, Target, BarChart3, Download } from 'lucide-react';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '@/lib/api';

interface GradedSubmission {
  id: number;
  taskId: number;
  studentId: number;
  status: string;
  content: string;
  submittedAt: string;
  reviewedAt: string | null;
  grade: number | null;
  feedback: string | null;
  teacherNotes: string | null;
  task?: {
    id: number;
    title: string;
    description: string;
    type: string;
    maxScore: number;
    dueDate: string;
    subject?: {
      id: number;
      name: string;
    };
  };
  reviewer?: {
    firstName: string;
    lastName: string;
  };
}

interface GradeStats {
  totalGraded: number;
  averageGrade: number;
  highestGrade: number;
  lowestGrade: number;
  totalPossible: number;
  totalEarned: number;
  percentageScore: number;
  gradeBySubject: { [key: string]: { total: number; count: number; average: number } };
}

export default function StudentGradesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent'); // recent, highest, lowest
  const [gradedSubmissions, setGradedSubmissions] = useState<GradedSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<GradeStats>({
    totalGraded: 0,
    averageGrade: 0,
    highestGrade: 0,
    lowestGrade: 0,
    totalPossible: 0,
    totalEarned: 0,
    percentageScore: 0,
    gradeBySubject: {},
  });
  const [subjects, setSubjects] = useState<string[]>([]);

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
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
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Please login again',
        });
        setLoading(false);
        return;
      }
      
      console.log('Fetching grades for student userId:', userId);
      
      // Fetch submissions for this student
      const response = await fetch(`${API_BASE_URL}/submissions/student/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched submissions:', data);
        
        // Filter only graded submissions (those with a grade/score)
        const graded = data.filter((sub: GradedSubmission) => 
          sub.grade !== null && sub.grade !== undefined && sub.status === 'approved'
        );
        
        setGradedSubmissions(graded);
        calculateStats(graded);
        
        // Extract unique subjects
        const uniqueSubjects = Array.from(
          new Set(
            graded
              .filter((sub: GradedSubmission) => sub.task?.subject?.name)
              .map((sub: GradedSubmission) => sub.task!.subject!.name)
          )
        ) as string[];
        setSubjects(uniqueSubjects);
      } else {
        throw new Error('Failed to fetch grades');
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load grades. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (submissions: GradedSubmission[]) => {
    if (submissions.length === 0) {
      setStats({
        totalGraded: 0,
        averageGrade: 0,
        highestGrade: 0,
        lowestGrade: 0,
        totalPossible: 0,
        totalEarned: 0,
        percentageScore: 0,
        gradeBySubject: {},
      });
      return;
    }

    const grades = submissions.map(sub => sub.grade || 0);
    const totalEarned = grades.reduce((sum, grade) => sum + grade, 0);
    const totalPossible = submissions.reduce((sum, sub) => sum + (sub.task?.maxScore || 20), 0);
    
    const gradeBySubject: { [key: string]: { total: number; count: number; average: number } } = {};
    
    submissions.forEach(sub => {
      const subjectName = sub.task?.subject?.name || 'General';
      if (!gradeBySubject[subjectName]) {
        gradeBySubject[subjectName] = { total: 0, count: 0, average: 0 };
      }
      gradeBySubject[subjectName].total += sub.grade || 0;
      gradeBySubject[subjectName].count += 1;
    });

    // Calculate averages for each subject
    Object.keys(gradeBySubject).forEach(subject => {
      gradeBySubject[subject].average = 
        gradeBySubject[subject].total / gradeBySubject[subject].count;
    });

    setStats({
      totalGraded: submissions.length,
      averageGrade: totalEarned / submissions.length,
      highestGrade: Math.max(...grades),
      lowestGrade: Math.min(...grades),
      totalPossible,
      totalEarned,
      percentageScore: (totalEarned / totalPossible) * 100,
      gradeBySubject,
    });
  };

  const getFilteredAndSortedSubmissions = () => {
    let filtered = gradedSubmissions;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(sub =>
        sub.task?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.task?.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by subject
    if (subjectFilter !== 'all') {
      filtered = filtered.filter(sub => sub.task?.subject?.name === subjectFilter);
    }

    // Sort
    switch (sortBy) {
      case 'highest':
        filtered.sort((a, b) => (b.grade || 0) - (a.grade || 0));
        break;
      case 'lowest':
        filtered.sort((a, b) => (a.grade || 0) - (b.grade || 0));
        break;
      case 'recent':
      default:
        filtered.sort((a, b) => 
          new Date(b.reviewedAt || b.submittedAt).getTime() - 
          new Date(a.reviewedAt || a.submittedAt).getTime()
        );
        break;
    }

    return filtered;
  };

  const getGradeColor = (grade: number, maxScore: number = 20) => {
    const percentage = (grade / maxScore) * 100;
    if (percentage >= 90) return 'success';
    if (percentage >= 75) return 'info';
    if (percentage >= 60) return 'warning';
    return 'danger';
  };

  const getGradeLetter = (grade: number, maxScore: number = 20) => {
    const percentage = (grade / maxScore) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  const exportGrades = () => {
    const csv = [
      ['Assignment', 'Subject', 'Grade', 'Max Score', 'Percentage', 'Date', 'Feedback'],
      ...gradedSubmissions.map(sub => [
        sub.task?.title || 'N/A',
        sub.task?.subject?.name || 'General',
        sub.grade || 0,
        sub.task?.maxScore || 20,
        `${((sub.grade || 0) / (sub.task?.maxScore || 20) * 100).toFixed(1)}%`,
        new Date(sub.reviewedAt || sub.submittedAt).toLocaleDateString('en-IN'),
        sub.feedback || 'No feedback'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grades-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    Swal.fire({
      icon: 'success',
      title: 'Exported!',
      text: 'Your grades have been exported successfully.',
      timer: 2000,
      showConfirmButton: false,
    });
  };

  if (loading) {
    return (
      <div className="container-fluid vh-100 d-flex justify-content-center align-items-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="text-center">
          <div className="spinner-border text-light" role="status" style={{ width: '4rem', height: '4rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4 className="text-white mt-3">Loading Grades...</h4>
        </div>
      </div>
    );
  }

  const filteredSubmissions = getFilteredAndSortedSubmissions();

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
                    <h1 className="display-5 fw-bold mb-2">
                      🎯 My Grades
                    </h1>
                    <p className="mb-0 opacity-75">View all your grades and performance</p>
                  </div>
                  <div>
                    <button 
                      className="btn btn-light"
                      onClick={exportGrades}
                      disabled={gradedSubmissions.length === 0}
                    >
                      <Download size={18} className="me-2" />
                      Export
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-6 col-xl-3">
            <div className="card border-0 shadow h-100" style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>
              <div className="card-body text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-subtitle mb-2">Average Grade</h6>
                    <h2 className="card-title display-4 fw-bold">
                      {stats.averageGrade.toFixed(1)}
                    </h2>
                    <p className="card-text small">Out of 20</p>
                  </div>
                  <div>
                    <Award size={60} style={{ opacity: 0.7 }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-xl-3">
            <div className="card border-0 shadow h-100" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
              <div className="card-body text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-subtitle mb-2">Overall Score</h6>
                    <h2 className="card-title display-4 fw-bold">
                      {stats.percentageScore.toFixed(1)}%
                    </h2>
                    <p className="card-text small">{stats.totalEarned} / {stats.totalPossible} points</p>
                  </div>
                  <div>
                    <Target size={60} style={{ opacity: 0.7 }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-xl-3">
            <div className="card border-0 shadow h-100" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
              <div className="card-body text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-subtitle mb-2">Highest Grade</h6>
                    <h2 className="card-title display-4 fw-bold">
                      {stats.highestGrade}
                    </h2>
                    <p className="card-text small">Best performance</p>
                  </div>
                  <div>
                    <TrendingUp size={60} style={{ opacity: 0.7 }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-xl-3">
            <div className="card border-0 shadow h-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <div className="card-body text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-subtitle mb-2">Total Graded</h6>
                    <h2 className="card-title display-4 fw-bold">
                      {stats.totalGraded}
                    </h2>
                    <p className="card-text small">Assignments</p>
                  </div>
                  <div>
                    <BookOpen size={60} style={{ opacity: 0.7 }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subject-wise Performance */}
        {Object.keys(stats.gradeBySubject).length > 0 && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="card border-0 shadow">
                <div className="card-header bg-white border-0 py-3">
                  <h5 className="mb-0 fw-bold">
                    <BarChart3 size={20} className="me-2" />
                    Subject-wise Performance
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    {Object.entries(stats.gradeBySubject).map(([subject, data]) => {
                      const percentage = (data.average / 20) * 100;
                      return (
                        <div key={subject} className="col-12 col-md-6 col-lg-4">
                          <div className="card bg-light border-0 h-100">
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <h6 className="mb-0 fw-bold">{subject}</h6>
                                <span className={`badge bg-${getGradeColor(data.average)}`}>
                                  {getGradeLetter(data.average)}
                                </span>
                              </div>
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="text-muted small">Average:</span>
                                <span className="fw-bold">{data.average.toFixed(1)} / 20</span>
                              </div>
                              <div className="progress" style={{ height: '10px' }}>
                                <div 
                                  className={`progress-bar bg-${getGradeColor(data.average)}`}
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <div className="text-muted small mt-1">
                                {data.count} assignment{data.count > 1 ? 's' : ''} graded
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow">
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-12 col-md-4">
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <Search size={18} />
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder="Search assignments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-12 col-md-4">
                    <select
                      className="form-select"
                      value={subjectFilter}
                      onChange={(e) => setSubjectFilter(e.target.value)}
                    >
                      <option value="all">All Subjects</option>
                      {subjects.map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12 col-md-4">
                    <select
                      className="form-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="recent">Most Recent</option>
                      <option value="highest">Highest First</option>
                      <option value="lowest">Lowest First</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grades Table */}
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="mb-0 fw-bold">
                  All Grades ({filteredSubmissions.length})
                </h5>
              </div>
              <div className="card-body p-0">
                {filteredSubmissions.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <Award size={60} style={{ opacity: 0.3 }} />
                    <p className="mt-3">
                      {gradedSubmissions.length === 0 
                        ? 'No graded assignments yet' 
                        : 'No results found'}
                    </p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th className="border-0 py-3">Assignment</th>
                          <th className="border-0 py-3">Subject</th>
                          <th className="border-0 py-3">Grade</th>
                          <th className="border-0 py-3">Percentage</th>
                          <th className="border-0 py-3">Letter Grade</th>
                          <th className="border-0 py-3">Date</th>
                          <th className="border-0 py-3">Feedback</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSubmissions.map((submission) => {
                          const maxScore = submission.task?.maxScore || 20;
                          const grade = submission.grade || 0;
                          const percentage = (grade / maxScore) * 100;
                          
                          return (
                            <tr key={submission.id}>
                              <td className="py-3">
                                <div className="fw-semibold">{submission.task?.title || 'N/A'}</div>
                                <small className="text-muted">{submission.task?.type || 'assignment'}</small>
                              </td>
                              <td className="py-3">
                                <span className="badge bg-primary">
                                  {submission.task?.subject?.name || 'General'}
                                </span>
                              </td>
                              <td className="py-3">
                                <span className={`badge bg-${getGradeColor(grade, maxScore)} fs-6`}>
                                  {grade} / {maxScore}
                                </span>
                              </td>
                              <td className="py-3">
                                <div className="d-flex align-items-center">
                                  <div className="progress flex-grow-1 me-2" style={{ height: '8px', width: '80px' }}>
                                    <div 
                                      className={`progress-bar bg-${getGradeColor(grade, maxScore)}`}
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                  <span className="small fw-semibold">{percentage.toFixed(0)}%</span>
                                </div>
                              </td>
                              <td className="py-3">
                                <span className={`badge bg-${getGradeColor(grade, maxScore)}`}>
                                  {getGradeLetter(grade, maxScore)}
                                </span>
                              </td>
                              <td className="py-3">
                                <small className="text-muted">
                                  {new Date(submission.reviewedAt || submission.submittedAt).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </small>
                              </td>
                              <td className="py-3">
                                {submission.feedback ? (
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => {
                                      Swal.fire({
                                        title: 'Teacher Feedback',
                                        html: `
                                          <div class="text-start">
                                            <p><strong>Assignment:</strong> ${submission.task?.title}</p>
                                            <p><strong>Reviewer:</strong> ${submission.reviewer?.firstName || ''} ${submission.reviewer?.lastName || ''}</p>
                                            <hr />
                                            <p>${submission.feedback}</p>
                                            ${submission.teacherNotes ? `<hr /><p><strong>Notes:</strong> ${submission.teacherNotes}</p>` : ''}
                                          </div>
                                        `,
                                        icon: 'info',
                                        confirmButtonText: 'Close',
                                        width: '600px',
                                      });
                                    }}
                                  >
                                    View
                                  </button>
                                ) : (
                                  <span className="text-muted small">No feedback</span>
                                )}
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

      <style jsx>{`
        .table tbody tr {
          transition: background-color 0.2s ease;
        }
        .table tbody tr:hover {
          background-color: #f8f9fa;
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

