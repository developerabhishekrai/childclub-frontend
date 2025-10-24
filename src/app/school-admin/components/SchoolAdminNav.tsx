'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell,
  User,
  GraduationCap,
  FileText
} from 'lucide-react';
import { clearAuthData } from '@/lib/api';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/school-admin/dashboard',
    icon: BarChart3
  },
  {
    name: 'Students',
    href: '/school-admin/students',
    icon: Users
  },
  {
    name: 'Teachers',
    href: '/school-admin/teachers',
    icon: Users
  },
  {
    name: 'Classes',
    href: '/school-admin/classes',
    icon: BookOpen
  },
  {
    name: 'Subjects',
    href: '/school-admin/subjects',
    icon: FileText
  },
  {
    name: 'Calendar',
    href: '/school-admin/calendar',
    icon: Calendar
  },
  {
    name: 'Tasks',
    href: '/school-admin/tasks',
    icon: GraduationCap
  },
  {
    name: 'Reports',
    href: '/school-admin/reports',
    icon: BarChart3
  },
  {
    name: 'Profile',
    href: '/school-admin/profile/edit',
    icon: User
  }
];

export default function SchoolAdminNav() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('School Admin');
  const pathname = usePathname();

  useEffect(() => {
    // Get user email from localStorage only on client side
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('userEmail');
      if (email) {
        setUserEmail(email);
      }
    }
  }, []);

  const handleLogout = () => {
    clearAuthData(); // Clears all auth data: token, user, userRole, userEmail, userData
    window.location.href = '/';
  };

  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="d-lg-none">
        <button
          type="button"
          className="btn btn-link text-dark p-0"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'show' : ''} d-lg-block`}>
        <div className="sidebar-content">
          {/* Logo */}
          <div className="sidebar-header text-center py-4">
            <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                 style={{width: '60px', height: '60px'}}>
              <BookOpen size={30} className="text-white" />
            </div>
            <h5 className="fw-bold text-dark mb-0">School Admin</h5>
            <small className="text-muted">Management Portal</small>
          </div>

          {/* Navigation */}
          <nav className="sidebar-nav">
            <ul className="nav flex-column">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.name} className="nav-item">
                    <Link
                      href={item.href}
                      className={`nav-link d-flex align-items-center gap-3 py-3 ${
                        isActive(item.href) ? 'active' : ''
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon size={20} />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Info & Logout */}
          <div className="sidebar-footer mt-auto p-3">
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="bg-light rounded-circle p-2">
                <User size={20} />
              </div>
              <div>
                <small className="fw-semibold d-block">
                  {userEmail}
                </small>
                <small className="text-muted">Administrator</small>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-outline-danger btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay d-lg-none"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <style jsx>{`
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          width: 280px;
          background: white;
          border-right: 1px solid #e9ecef;
          z-index: 1000;
          transform: translateX(-100%);
          transition: transform 0.3s ease;
        }

        .sidebar.show {
          transform: translateX(0);
        }

        .sidebar-content {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .sidebar-nav {
          flex: 1;
        }

        .sidebar .nav-link {
          color: #6c757d;
          border-radius: 0.5rem;
          margin: 0 0.5rem;
          transition: all 0.3s ease;
        }

        .sidebar .nav-link:hover {
          background-color: #f8f9fa;
          color: #495057;
        }

        .sidebar .nav-link.active {
          background-color: #e7f3ff;
          color: #0d6efd;
          font-weight: 600;
        }

        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999;
        }

        @media (min-width: 992px) {
          .sidebar {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}


