'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, User, Mail, Phone, MapPin, Calendar, Users, Heart } from 'lucide-react';
import Link from 'next/link';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import { API_BASE_URL } from '@/lib/api';

export default function CreateStudentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [teacherData, setTeacherData] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    password: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    postalCode: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    emergencyContact: '',
    previousSchool: '',
    enrollNumber: '',
  });

  const genderOptions = ['Male', 'Female', 'Other'];
  const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Fetch teacher data on component mount
  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        if (!token || !userId) {
          router.push('/teacher/login');
          return;
        }

        const teacherResponse = await fetch(`${API_BASE_URL}/teachers/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!teacherResponse.ok) {
          throw new Error('Failed to fetch teacher data');
        }

        const data = await teacherResponse.json();
        setTeacherData(data);
      } catch (error) {
        console.error('Error fetching teacher data:', error);
        Swal.fire('Error', 'Failed to load teacher data', 'error');
      }
    };

    fetchTeacherData();
  }, [router]);

  const validateForm = () => {
    if (!teacherData) {
      Swal.fire('Error', 'Please wait for teacher data to load', 'error');
      return false;
    }
    
    if (!formData.firstName.trim()) {
      Swal.fire('Error', 'First name is required', 'error');
      return false;
    }
    if (!formData.lastName.trim()) {
      Swal.fire('Error', 'Last name is required', 'error');
      return false;
    }
    if (!formData.email.trim()) {
      Swal.fire('Error', 'Email is required', 'error');
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      Swal.fire('Error', 'Password must be at least 6 characters', 'error');
      return false;
    }
    if (!formData.enrollNumber.trim()) {
      Swal.fire('Error', 'Enrollment number is required', 'error');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId) {
        throw new Error('Authentication required');
      }

      if (!teacherData) {
        throw new Error('Teacher data not loaded');
      }

      if (!teacherData.schoolId) {
        throw new Error('School information not found');
      }

      if (!teacherData.classId) {
        throw new Error('You must be assigned to a class to add students');
      }

      // Create student
      const studentData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        mobile: formData.mobile || undefined,
        password: formData.password,
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: formData.gender || undefined,
        bloodGroup: formData.bloodGroup || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        country: formData.country,
        postalCode: formData.postalCode || undefined,
        parentName: formData.parentName || undefined,
        parentPhone: formData.parentPhone || undefined,
        parentEmail: formData.parentEmail || undefined,
        emergencyContact: formData.emergencyContact || undefined,
        previousSchool: formData.previousSchool || undefined,
        enrollNumber: formData.enrollNumber,
        schoolId: parseInt(teacherData.schoolId),
        classId: teacherData.classId,
      };

      console.log('Creating student:', studentData);

      const response = await fetch(`${API_BASE_URL}/students`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create student');
      }

      const result = await response.json();
      console.log('Student created:', result);

      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Student added successfully',
        confirmButtonText: 'OK'
      });

      router.push('/teacher/students');
    } catch (error: any) {
      console.error('Error creating student:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to create student. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <div className="bg-white shadow-sm border-bottom">
        <div className="container-fluid py-3">
          <div className="d-flex align-items-center gap-3">
            <Link href="/teacher/students" className="btn btn-outline-secondary">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="h3 mb-0 fw-bold text-dark">
                <i className="fas fa-user-plus me-2 text-primary"></i>
                Add New Student
              </h1>
              <p className="text-muted mb-0">Fill in the student details below</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-lg-10 col-xl-8">
            <form onSubmit={handleSubmit}>
              <div className="card border-0 shadow">
                <div className="card-body p-4 p-lg-5">
                  {/* Personal Information */}
                  <div className="mb-5">
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <div className="bg-primary bg-opacity-10 p-3 rounded-circle">
                        <User size={24} className="text-primary" />
                      </div>
                      <h3 className="mb-0 fw-bold text-dark">Personal Information</h3>
                    </div>
                    <div className="row g-4">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          First Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="form-control form-control-lg"
                          placeholder="Enter first name"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          Last Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="form-control form-control-lg"
                          placeholder="Enter last name"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          Email Address <span className="text-danger">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="form-control form-control-lg"
                          placeholder="Enter email address"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          Password <span className="text-danger">*</span>
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="form-control form-control-lg"
                          placeholder="Enter password (min 6 characters)"
                          required
                          minLength={6}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Mobile Number</label>
                        <input
                          type="tel"
                          name="mobile"
                          value={formData.mobile}
                          onChange={handleInputChange}
                          className="form-control form-control-lg"
                          placeholder="Enter mobile number"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          Enrollment Number <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          name="enrollNumber"
                          value={formData.enrollNumber}
                          onChange={handleInputChange}
                          className="form-control form-control-lg"
                          placeholder="Enter enrollment number"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          Assigned Class <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          value={teacherData?.className || 'Loading...'}
                          className="form-control form-control-lg"
                          disabled
                        />
                        <small className="text-muted">Students will be assigned to your assigned class</small>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">Date of Birth</label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          className="form-control form-control-lg"
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">Gender</label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className="form-select form-select-lg"
                        >
                          <option value="">Select Gender</option>
                          {genderOptions.map(gender => (
                            <option key={gender} value={gender}>{gender}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">Blood Group</label>
                        <select
                          name="bloodGroup"
                          value={formData.bloodGroup}
                          onChange={handleInputChange}
                          className="form-select form-select-lg"
                        >
                          <option value="">Select Blood Group</option>
                          {bloodGroupOptions.map(group => (
                            <option key={group} value={group}>{group}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="mb-5">
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <div className="bg-info bg-opacity-10 p-3 rounded-circle">
                        <MapPin size={24} className="text-info" />
                      </div>
                      <h3 className="mb-0 fw-bold text-dark">Address Information</h3>
                    </div>
                    <div className="row g-4">
                      <div className="col-12">
                        <label className="form-label fw-semibold">Address</label>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="form-control form-control-lg"
                          rows={3}
                          placeholder="Enter complete address"
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">City</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="form-control form-control-lg"
                          placeholder="Enter city"
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">State</label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className="form-control form-control-lg"
                          placeholder="Enter state"
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">Country</label>
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          className="form-control form-control-lg"
                          placeholder="Enter country"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Postal Code</label>
                        <input
                          type="text"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          className="form-control form-control-lg"
                          placeholder="Enter postal code"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Parent/Guardian Information */}
                  <div className="mb-5">
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <div className="bg-success bg-opacity-10 p-3 rounded-circle">
                        <Users size={24} className="text-success" />
                      </div>
                      <h3 className="mb-0 fw-bold text-dark">Parent/Guardian Information</h3>
                    </div>
                    <div className="row g-4">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Parent Name</label>
                        <input
                          type="text"
                          name="parentName"
                          value={formData.parentName}
                          onChange={handleInputChange}
                          className="form-control form-control-lg"
                          placeholder="Enter parent/guardian name"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Parent Phone</label>
                        <input
                          type="tel"
                          name="parentPhone"
                          value={formData.parentPhone}
                          onChange={handleInputChange}
                          className="form-control form-control-lg"
                          placeholder="Enter parent phone number"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Parent Email</label>
                        <input
                          type="email"
                          name="parentEmail"
                          value={formData.parentEmail}
                          onChange={handleInputChange}
                          className="form-control form-control-lg"
                          placeholder="Enter parent email"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Emergency Contact</label>
                        <input
                          type="tel"
                          name="emergencyContact"
                          value={formData.emergencyContact}
                          onChange={handleInputChange}
                          className="form-control form-control-lg"
                          placeholder="Enter emergency contact number"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="mb-4">
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <div className="bg-warning bg-opacity-10 p-3 rounded-circle">
                        <Heart size={24} className="text-warning" />
                      </div>
                      <h3 className="mb-0 fw-bold text-dark">Additional Information</h3>
                    </div>
                    <div className="row g-4">
                      <div className="col-12">
                        <label className="form-label fw-semibold">Previous School</label>
                        <input
                          type="text"
                          name="previousSchool"
                          value={formData.previousSchool}
                          onChange={handleInputChange}
                          className="form-control form-control-lg"
                          placeholder="Enter previous school name"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="d-flex gap-3 justify-content-end pt-4 border-top">
                    <Link href="/teacher/students" className="btn btn-secondary btn-lg px-5">
                      <i className="fas fa-times me-2"></i>
                      Cancel
                    </Link>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary btn-lg px-5"
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Creating...
                        </>
                      ) : (
                        <>
                          <Save size={18} className="me-2" />
                          Add Student
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

