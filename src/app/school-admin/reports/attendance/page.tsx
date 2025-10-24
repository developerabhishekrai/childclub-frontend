'use client';

import { TrendingUp, Calendar } from 'lucide-react';

export default function AttendanceReportsPage() {
  return (
    <div style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh' }}>
      <div className="container-fluid p-4">
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-lg" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <div className="card-body text-white p-4">
                <h1 className="display-5 fw-bold mb-2">
                  <TrendingUp size={50} className="me-3" />
                  Attendance Reports
                </h1>
                <p className="mb-0 opacity-75">Analyze attendance trends and patterns</p>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow">
              <div className="card-body text-center py-5">
                <Calendar size={80} className="text-muted mb-3" style={{ opacity: 0.3 }} />
                <h4 className="text-muted">Attendance Reports Module</h4>
                <p className="text-muted">This feature is under development</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



