'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Public pages that don't need navigation
  const publicPages = ['/teacher/login', '/teacher/register'];
  const isPublicPage = publicPages.includes(pathname);

  const navigation = [
    { name: 'Dashboard', href: '/teacher/dashboard', icon: 'bi-house-door-fill' },
    { name: 'Students', href: '/teacher/students', icon: 'bi-people-fill' },
    { name: 'Tasks & Assignments', href: '/teacher/tasks', icon: 'bi-list-check' },
    { name: 'Attendance', href: '/teacher/attendance', icon: 'bi-calendar-check-fill' },
    { name: 'Submissions', href: '/teacher/submissions', icon: 'bi-inbox-fill' },
  ];

  const handleLogout = () => {
    localStorage.clear();
    router.push('/teacher/login');
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
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow">
        <div className="container-fluid">
          <a className="navbar-brand d-flex align-items-center" href="/teacher/dashboard">
            <span className="fs-3 me-2">👨‍🏫</span>
            <span className="fw-bold">Teacher Portal</span>
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
                        ? 'bg-primary bg-opacity-10 text-primary fw-semibold'
                        : 'text-dark'
                    }`}
                    style={{ padding: '12px 16px' }}
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
          background-color: rgba(13, 110, 253, 0.1) !important;
          transform: translateX(4px);
        }
      `}</style>
    </div>
  );
}
