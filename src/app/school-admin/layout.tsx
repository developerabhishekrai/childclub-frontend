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
  User,
  ChevronDown,
  ChevronRight,
  FileText,
  PieChart,
  TrendingUp,
  Cog,
  Shield,
  Bell
} from 'lucide-react';
import Link from 'next/link';
import { clearAuthData } from '@/lib/api';
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
    icon: BookOpen
  },
  {
    name: 'Calendar',
    href: '/school-admin/calendar',
    icon: Calendar
  },
  {
    name: 'Tasks',
    href: '/school-admin/tasks',
    icon: Calendar
  },
  {
    name: 'Attendance',
    href: '/school-admin/attendance',
    icon: Calendar
  }
];

const reportsItems = [
  {
    name: 'Student Reports',
    href: '/school-admin/reports/students',
    icon: FileText
  },
  {
    name: 'Teacher Reports',
    href: '/school-admin/reports/teachers',
    icon: PieChart
  },
  {
    name: 'Attendance Reports',
    href: '/school-admin/reports/attendance',
    icon: TrendingUp
  },
  {
    name: 'Performance',
    href: '/school-admin/reports/performance',
    icon: BarChart3
  }
];

const settingsItems = [
  {
    name: 'General Settings',
    href: '/school-admin/settings/general',
    icon: Cog
  },
  {
    name: 'School Profile',
    href: '/school-admin/settings/profile',
    icon: Shield
  },
  {
    name: 'Notifications',
    href: '/school-admin/settings/notifications',
    icon: Bell
  }
];

export default function SchoolAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [userEmail, setUserEmail] = useState('Admin');
  const [reportsOpen, setReportsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    // Get user email from localStorage only on client side
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('userEmail');
      if (email) {
        setUserEmail(email);
      }
    }
    
    // Auto-open dropdowns if on their pages
    if (pathname.startsWith('/school-admin/reports')) {
      setReportsOpen(true);
    }
    if (pathname.startsWith('/school-admin/settings')) {
      setSettingsOpen(true);
    }
  }, [pathname]);

  // Public pages that don't need navigation
  const publicPages = ['/school-admin/login', '/school-admin/register'];
  const isPublicPage = publicPages.includes(pathname);

  const handleLogout = () => {
    clearAuthData(); // Clears all auth data: token, user, userRole, userEmail, userData
    window.location.href = '/';
  };

  const isActive = (href: string) => {
    return pathname === href;
  };

  const isDropdownActive = (items: typeof reportsItems) => {
    return items.some(item => pathname === item.href);
  };

  // If it's a public page (login/register), just render the children without navigation
  if (isPublicPage) {
    return (
      <div className="min-h-screen">
        {children}
      </div>
    );
  }

  // For authenticated pages, show full layout with navigation
  return (
    <div className="d-flex min-vh-100">
      {/* Mobile menu button */}
      <div className="d-lg-none position-fixed top-0 start-0 p-3" style={{zIndex: 1001}}>
        <button
          type="button"
          className="btn btn-light shadow-sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'show' : ''} d-lg-block`}>
        <div className="sidebar-content">
          {/* Logo */}
          <div className="sidebar-header text-center py-4">
            <Link 
              href="/school-admin/dashboard" 
              style={{ textDecoration: 'none', cursor: 'pointer' }}
              onClick={() => setSidebarOpen(false)}
            >
              <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center logo-icon" 
                   style={{width: '60px', height: '60px'}}>
                <BookOpen size={30} className="text-white" />
              </div>
            </Link>
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

              {/* Reports Dropdown */}
              <li className="nav-item">
                <button
                  className={`nav-link d-flex align-items-center justify-content-between w-100 border-0 bg-transparent py-3 ${
                    isDropdownActive(reportsItems) ? 'active' : ''
                  }`}
                  onClick={() => setReportsOpen(!reportsOpen)}
                >
                  <div className="d-flex align-items-center gap-3">
                    <BarChart3 size={20} />
                    <span>Reports</span>
                  </div>
                  {reportsOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>
                <div className={`dropdown-menu-custom ${reportsOpen ? 'show' : ''}`}>
                  <ul className="nav flex-column">
                    {reportsItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <li key={item.name} className="nav-item">
                          <Link
                            href={item.href}
                            className={`nav-link d-flex align-items-center gap-3 py-2 ps-5 ${
                              isActive(item.href) ? 'active' : ''
                            }`}
                            onClick={() => setSidebarOpen(false)}
                          >
                            <Icon size={18} />
                            <span className="small">{item.name}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </li>

              {/* Settings Dropdown */}
              <li className="nav-item">
                <button
                  className={`nav-link d-flex align-items-center justify-content-between w-100 border-0 bg-transparent py-3 ${
                    isDropdownActive(settingsItems) ? 'active' : ''
                  }`}
                  onClick={() => setSettingsOpen(!settingsOpen)}
                >
                  <div className="d-flex align-items-center gap-3">
                    <Settings size={20} />
                    <span>Settings</span>
                  </div>
                  {settingsOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>
                <div className={`dropdown-menu-custom ${settingsOpen ? 'show' : ''}`}>
                  <ul className="nav flex-column">
                    {settingsItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <li key={item.name} className="nav-item">
                          <Link
                            href={item.href}
                            className={`nav-link d-flex align-items-center gap-3 py-2 ps-5 ${
                              isActive(item.href) ? 'active' : ''
                            }`}
                            onClick={() => setSidebarOpen(false)}
                          >
                            <Icon size={18} />
                            <span className="small">{item.name}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </li>
            </ul>
          </nav>

          {/* User Info & Logout */}
          <div className="sidebar-footer mt-auto p-3">
            <div className="d-flex align-items-center gap-2 mb-3 p-2 bg-light rounded">
              <div className="bg-primary rounded-circle p-2">
                <User size={18} className="text-white" />
              </div>
              <div className="flex-grow-1" style={{minWidth: 0}}>
                <small className="fw-semibold d-block text-truncate">
                  {userEmail}
                </small>
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

      {/* Main Content */}
      <div className="flex-grow-1" style={{marginLeft: '280px'}}>
        {children}
      </div>

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
          box-shadow: 2px 0 10px rgba(0,0,0,0.1);
          overflow-y: auto;
          overflow-x: hidden;
          scrollbar-gutter: stable;
        }

        .sidebar::-webkit-scrollbar {
          width: 6px;
        }

        .sidebar::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 3px;
        }

        .sidebar::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }

        .logo-icon {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .logo-icon:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);
        }

        .sidebar.show {
          transform: translateX(0);
        }

        .sidebar-content {
          height: 100%;
          display: flex;
          flex-direction: column;
          overflow-x: hidden;
        }

        .sidebar-nav {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .sidebar .nav-link {
          color: #6c757d;
          border-radius: 0.5rem;
          margin: 0 0.5rem;
          transition: all 0.3s ease;
          text-decoration: none;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sidebar .nav-link:hover {
          background-color: #f8f9fa;
          color: #495057;
          transform: translateX(5px);
        }

        .sidebar .nav-link.active {
          background-color: #e7f3ff;
          color: #0d6efd;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(13, 110, 253, 0.15);
        }

        .dropdown-menu-custom {
          max-height: 0;
          overflow: hidden;
          overflow-x: hidden;
          transition: max-height 0.3s ease, opacity 0.3s ease;
          opacity: 0;
        }

        .dropdown-menu-custom.show {
          max-height: 500px;
          opacity: 1;
        }

        .dropdown-menu-custom .nav-link {
          font-size: 0.9rem;
          padding-left: 3rem !important;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dropdown-menu-custom .nav-link:hover {
          background-color: #f8f9fa;
          transform: translateX(3px);
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

        @media (max-width: 991px) {
          .flex-grow-1 {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
