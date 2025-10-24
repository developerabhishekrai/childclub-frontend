'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Public pages that don't need navigation
  const publicPages = ['/student/login', '/student/register'];
  const isPublicPage = publicPages.includes(pathname);

  const navigation = [
    { name: 'Dashboard', href: '/student/dashboard', icon: 'bi-house-door-fill' },
    { name: 'My Tasks', href: '/student/tasks', icon: 'bi-list-check' },
    { name: 'Submissions', href: '/student/submissions', icon: 'bi-upload' },
    { name: 'Attendance', href: '/student/attendance', icon: 'bi-calendar-check-fill' },
    { name: 'Grades', href: '/student/grades', icon: 'bi-bar-chart-fill' },
  ];

  const handleLogout = () => {
    localStorage.clear();
    router.push('/student/login');
  };

  // If it's a public page (login/register), just render the children without navigation
  if (isPublicPage) {
    return (
      <div style={{ minHeight: '100vh' }}>
        {children}
      </div>
    );
  }

  // For authenticated pages, show full layout with navigation
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Top Navigation */}
      <nav className="navbar navbar-expand-lg navbar-dark shadow" style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>
        <div className="container-fluid">
          <a className="navbar-brand d-flex align-items-center" href="/student/dashboard">
            <span className="fs-3 me-2">🎓</span>
            <span className="fw-bold">Student Portal</span>
          </a>
          <button
            onClick={handleLogout}
            className="btn btn-light"
          >
            <i className="bi bi-box-arrow-right me-2"></i>
            Logout
          </button>
        </div>
      </nav>

      {/* Sidebar + Content */}
      <div className="d-flex">
        {/* Sidebar */}
        <aside className="bg-white shadow-sm" style={{ width: '250px', minHeight: 'calc(100vh - 56px)' }}>
          <nav className="p-3">
            <ul className="nav flex-column">
              {navigation.map((item) => (
                <li className="nav-item mb-2" key={item.href}>
                  <a
                    href={item.href}
                    className={`nav-link d-flex align-items-center rounded ${
                      pathname === item.href
                        ? 'text-white fw-semibold'
                        : 'text-dark'
                    }`}
                    style={{ 
                      padding: '12px 16px',
                      background: pathname === item.href ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' : 'transparent'
                    }}
                  >
                    <i className={`bi ${item.icon} me-3 fs-5`}></i>
                    <span>{item.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-grow-1" style={{ backgroundColor: '#f8f9fa' }}>
          {children}
        </main>
      </div>

      <style jsx>{`
        .nav-link {
          transition: all 0.2s ease;
        }
        .nav-link:hover {
          background: rgba(17, 153, 142, 0.1) !important;
          transform: translateX(4px);
        }
        .nav-link.text-white:hover {
          background: linear-gradient(135deg, #0d8a7e 0%, #2dd36f 100%) !important;
        }
      `}</style>
    </div>
  );
}

