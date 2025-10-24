/**
 * API Type Definitions
 * TypeScript types for API requests and responses
 */

// ==================== AUTH TYPES ====================

export interface LoginRequest {
  email: string;
  password: string;
  role?: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface RegisterRequest {
  // User fields
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  password: string;
  confirmPassword: string;
  role: 'super_admin' | 'school_admin' | 'teacher' | 'student';
  
  // Admin specific fields
  adminPosition?: string;
  yearsOfExperience?: string;
  educationLevel?: string;
  certifications?: string;
  
  // School information (for school_admin)
  schoolName?: string;
  schoolType?: string;
  schoolAddress?: string;
  schoolCity?: string;
  schoolState?: string;
  schoolCountry?: string;
  schoolPostalCode?: string;
  schoolPhone?: string;
  schoolEmail?: string;
  schoolWebsite?: string;
  
  // Optional user fields
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface RegisterResponse {
  user: User;
  school?: School;
}

// ==================== USER TYPES ====================

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  role: 'super_admin' | 'school_admin' | 'teacher' | 'student';
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  profilePicture?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  dateOfBirth?: Date;
  address?: string;
  adminPosition?: string;
  yearsOfExperience?: string;
  educationLevel?: string;
  certifications?: string;
  emailVerified: boolean;
  mobileVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== SCHOOL TYPES ====================

export interface School {
  id: number;
  name: string;
  description?: string;
  type: 'primary' | 'secondary' | 'higher_secondary' | 'international' | 'special_needs';
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  logo?: string;
  banner?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone?: string;
  email?: string;
  website?: string;
  establishedYear?: number;
  totalStudents?: number;
  totalTeachers?: number;
  totalClasses?: number;
  facilities?: string;
  vision?: string;
  mission?: string;
  isActive: number;
  userId: number;
  approvedBy?: number;
  approvedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
}

// ==================== TEACHER TYPES ====================

export interface Teacher {
  id: number;
  userId: number;
  schoolId: number;
  employeeId?: string;
  department?: string;
  designation?: string;
  qualification?: string;
  experience?: number;
  specialization?: string;
  joiningDate?: Date;
  status: 'active' | 'inactive' | 'on_leave' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  school?: School;
}

// ==================== STUDENT TYPES ====================

export interface Student {
  id: number;
  userId: number;
  schoolId: number;
  classId?: number;
  rollNumber?: string;
  admissionNumber?: string;
  admissionDate?: Date;
  bloodGroup?: string;
  parentName?: string;
  parentEmail?: string;
  parentMobile?: string;
  emergencyContact?: string;
  medicalInfo?: string;
  status: 'active' | 'inactive' | 'graduated' | 'transferred';
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  school?: School;
  class?: Class;
}

// ==================== CLASS TYPES ====================

export interface Class {
  id: number;
  schoolId: number;
  teacherId?: number;
  name: string;
  section?: string;
  grade?: string;
  subject?: string;
  room?: string;
  schedule?: string;
  capacity?: number;
  description?: string;
  isActive: number;
  createdAt: Date;
  updatedAt: Date;
  school?: School;
  teacher?: Teacher;
}

// ==================== PAGINATION TYPES ====================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ==================== ERROR TYPES ====================

export interface ApiErrorResponse {
  message: string;
  error?: string;
  statusCode?: number;
}

