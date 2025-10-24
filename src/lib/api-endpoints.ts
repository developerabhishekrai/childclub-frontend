/**
 * API Endpoints
 * Centralized endpoint definitions for the ChildClub application
 */

import { apiGet, apiPost, apiPut, apiPatch, apiDelete, getStoredToken } from './api';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
  School,
  Teacher,
  Student,
  Class,
} from '@/types/api';

// ==================== AUTH ENDPOINTS ====================

export const authApi = {
  /**
   * Login user
   */
  login: (data: LoginRequest) =>
    apiPost<LoginResponse>('/auth/login', data),

  /**
   * Register new user (with school for school_admin)
   */
  register: (data: RegisterRequest) =>
    apiPost<RegisterResponse>('/auth/register', data),

  /**
   * Refresh token
   */
  refreshToken: () =>
    apiPost<{ access_token: string }>('/auth/refresh', {}, { token: getStoredToken() || undefined }),

  /**
   * Generate OTP for password reset
   */
  generateOtp: (email: string) =>
    apiPost<{ message: string }>('/auth/generate-otp', { email }),

  /**
   * Verify OTP
   */
  verifyOtp: (email: string, otp: string) =>
    apiPost<{ message: string }>('/auth/verify-otp', { email, otp }),
};

// ==================== USERS ENDPOINTS ====================

export const usersApi = {
  /**
   * Get all users
   */
  getAll: (params?: { role?: string; status?: string; page?: number; limit?: number }) =>
    apiGet<{ data: User[]; total: number; page: number; limit: number }>('/users', { params, token: getStoredToken() || undefined }),

  /**
   * Get user by ID
   */
  getById: (id: number) =>
    apiGet<User>(`/users/${id}`, { token: getStoredToken() || undefined }),

  /**
   * Update user
   */
  update: (id: number, data: Partial<User>) =>
    apiPatch<User>(`/users/${id}`, data, { token: getStoredToken() || undefined }),

  /**
   * Delete user
   */
  delete: (id: number) =>
    apiDelete<{ message: string }>(`/users/${id}`, { token: getStoredToken() || undefined }),
};

// ==================== SCHOOLS ENDPOINTS ====================

export const schoolsApi = {
  /**
   * Get all schools
   */
  getAll: (params?: { status?: string; type?: string; search?: string; page?: number; limit?: number }) =>
    apiGet<{ data: School[]; total: number; page: number; limit: number }>('/schools', { params, token: getStoredToken() || undefined }),

  /**
   * Get school by ID
   */
  getById: (id: number) =>
    apiGet<School>(`/schools/${id}`, { token: getStoredToken() || undefined }),

  /**
   * Create school
   */
  create: (data: Partial<School>) =>
    apiPost<School>('/schools', data, { token: getStoredToken() || undefined }),

  /**
   * Update school
   */
  update: (id: number, data: Partial<School>) =>
    apiPatch<School>(`/schools/${id}`, data, { token: getStoredToken() || undefined }),

  /**
   * Approve school
   */
  approve: (id: number, comments?: string) =>
    apiPost<School>(`/schools/${id}/approve`, { comments }, { token: getStoredToken() || undefined }),

  /**
   * Reject school
   */
  reject: (id: number, reason: string) =>
    apiPost<School>(`/schools/${id}/reject`, { reason }, { token: getStoredToken() || undefined }),

  /**
   * Suspend school
   */
  suspend: (id: number, reason: string) =>
    apiPost<School>(`/schools/${id}/suspend`, { reason }, { token: getStoredToken() || undefined }),

  /**
   * Delete school
   */
  delete: (id: number) =>
    apiDelete<{ message: string; school: School }>(`/schools/${id}`, { token: getStoredToken() || undefined }),

  /**
   * Get pending schools count
   */
  getPendingCount: () =>
    apiGet<{ count: number }>('/schools/pending/count', { token: getStoredToken() || undefined }),

  /**
   * Get school statistics
   */
  getStats: () =>
    apiGet<{ total: number; pending: number; approved: number; rejected: number; suspended: number }>('/schools/stats', { token: getStoredToken() || undefined }),
};

// ==================== TEACHERS ENDPOINTS ====================

export const teachersApi = {
  /**
   * Get all teachers
   */
  getAll: (params?: { schoolId?: number; status?: string; page?: number; limit?: number }) =>
    apiGet<{ data: Teacher[]; total: number; page: number; limit: number }>('/teachers', { params, token: getStoredToken() || undefined }),

  /**
   * Get teacher by ID
   */
  getById: (id: number) =>
    apiGet<Teacher>(`/teachers/${id}`, { token: getStoredToken() || undefined }),

  /**
   * Create teacher
   */
  create: (data: Partial<Teacher>) =>
    apiPost<Teacher>('/teachers', data, { token: getStoredToken() || undefined }),

  /**
   * Update teacher
   */
  update: (id: number, data: Partial<Teacher>) =>
    apiPatch<Teacher>(`/teachers/${id}`, data, { token: getStoredToken() || undefined }),

  /**
   * Update teacher status
   */
  updateStatus: (id: number, status: string) =>
    apiPatch<Teacher>(`/teachers/${id}/status`, { status }, { token: getStoredToken() || undefined }),

  /**
   * Delete teacher
   */
  delete: (id: number) =>
    apiDelete<{ message: string }>(`/teachers/${id}`, { token: getStoredToken() || undefined }),
};

// ==================== STUDENTS ENDPOINTS ====================

export const studentsApi = {
  /**
   * Get all students
   */
  getAll: (params?: { schoolId?: number; classId?: number; status?: string; page?: number; limit?: number }) =>
    apiGet<{ data: Student[]; total: number; page: number; limit: number }>('/students', { params, token: getStoredToken() || undefined }),

  /**
   * Get student by ID
   */
  getById: (id: number) =>
    apiGet<Student>(`/students/${id}`, { token: getStoredToken() || undefined }),

  /**
   * Create student
   */
  create: (data: Partial<Student>) =>
    apiPost<Student>('/students', data, { token: getStoredToken() || undefined }),

  /**
   * Update student
   */
  update: (id: number, data: Partial<Student>) =>
    apiPatch<Student>(`/students/${id}`, data, { token: getStoredToken() || undefined }),

  /**
   * Update student status
   */
  updateStatus: (id: number, status: string) =>
    apiPatch<Student>(`/students/${id}/status`, { status }, { token: getStoredToken() || undefined }),

  /**
   * Delete student
   */
  delete: (id: number) =>
    apiDelete<{ message: string }>(`/students/${id}`, { token: getStoredToken() || undefined }),
};

// ==================== CLASSES ENDPOINTS ====================

export const classesApi = {
  /**
   * Get all classes
   */
  getAll: (params?: { schoolId?: number; teacherId?: number; page?: number; limit?: number }) =>
    apiGet<{ data: Class[]; total: number; page: number; limit: number }>('/classes', { params, token: getStoredToken() || undefined }),

  /**
   * Get class by ID
   */
  getById: (id: number) =>
    apiGet<Class>(`/classes/${id}`, { token: getStoredToken() || undefined }),

  /**
   * Create class
   */
  create: (data: Partial<Class>) =>
    apiPost<Class>('/classes', data, { token: getStoredToken() || undefined }),

  /**
   * Update class
   */
  update: (id: number, data: Partial<Class>) =>
    apiPatch<Class>(`/classes/${id}`, data, { token: getStoredToken() || undefined }),

  /**
   * Delete class
   */
  delete: (id: number) =>
    apiDelete<{ message: string }>(`/classes/${id}`, { token: getStoredToken() || undefined }),
};

// ==================== DASHBOARD ENDPOINTS ====================

export const dashboardApi = {
  /**
   * Get dashboard statistics
   */
  getStats: (role: string) =>
    apiGet<any>('/dashboard/stats', { params: { role }, token: getStoredToken() || undefined }),

  /**
   * Get recent activities
   */
  getActivities: (params?: { limit?: number }) =>
    apiGet<any[]>('/dashboard/activities', { params, token: getStoredToken() || undefined }),
};

