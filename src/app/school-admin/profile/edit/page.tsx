'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  Save,
  Camera,
  Edit,
  Globe,
  Award,
  Users,
  FileText
} from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Link from 'next/link';
import { getStoredUser, getStoredToken, API_BASE_URL } from '@/lib/api';
import Swal from 'sweetalert2';

const customStyles = `
  .profile-card {
    transition: all 0.3s ease;
    border: none;
    border-radius: 1rem;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  }
  
  .profile-card:hover {
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  }
  
  .profile-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 1rem 1rem 0 0;
    padding: 3rem 2rem;
    text-align: center;
    position: relative;
  }
  
  .profile-avatar {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    border: 5px solid white;
    margin: 0 auto 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    position: relative;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .profile-avatar:hover {
    transform: scale(1.05);
  }
  
  .profile-avatar-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .profile-avatar:hover .profile-avatar-overlay {
    opacity: 1;
  }
  
  .form-section {
    background: white;
    border-radius: 1rem;
    padding: 2rem;
    margin-bottom: 1.5rem;
    border: 1px solid #e9ecef;
  }
  
  .form-section-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #e9ecef;
  }
  
  .form-section-icon {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .save-btn {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    box-shadow: 0 0.5rem 1rem rgba(13, 110, 253, 0.3);
    transition: all 0.3s ease;
    z-index: 1000;
  }
  
  .save-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 0.75rem 1.5rem rgba(13, 110, 253, 0.4);
  }
  
  .info-badge {
    background: rgba(255, 255, 255, 0.2);
    padding: 0.5rem 1rem;
    border-radius: 2rem;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0.25rem;
  }
`;

export default function EditProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [schoolData, setSchoolData] = useState<any>(null);
  
  // Personal Info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  
  // School Info
  const [schoolName, setSchoolName] = useState('');
  const [schoolAddress, setSchoolAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('India');
  const [establishedYear, setEstablishedYear] = useState('');
  const [schoolType, setSchoolType] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  
  // Contact Info
  const [schoolEmail, setSchoolEmail] = useState('');
  const [schoolPhone, setSchoolPhone] = useState('');
  const [totalStudents, setTotalStudents] = useState('');
  const [totalTeachers, setTotalTeachers] = useState('');

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const token = getStoredToken();
      const user = getStoredUser();
      
      if (!token) {
        await Swal.fire({
          icon: 'error',
          title: 'Authentication Required',
          text: 'Please login to continue',
          confirmButtonColor: '#dc3545'
        });
        window.location.href = '/school-admin/login';
        return;
      }
      
      setUserData(user);
      
      // Fetch user profile
      const profileResponse = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setFirstName(profileData.firstName || '');
        setLastName(profileData.lastName || '');
        setEmail(profileData.email || '');
        setMobile(profileData.mobile || '');
      }
      
      // Fetch school data
      const schoolResponse = await fetch(`${API_BASE_URL}/schools/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (schoolResponse.ok) {
        const school = await schoolResponse.json();
        setSchoolData(school);
        setSchoolName(school.name || '');
        setSchoolAddress(school.address || '');
        setCity(school.city || '');
        setState(school.state || '');
        setPostalCode(school.postalCode || '');
        setCountry(school.country || 'India');
        setEstablishedYear(school.establishedYear || '');
        setSchoolType(school.type || '');
        setWebsite(school.website || '');
        setDescription(school.description || '');
        setSchoolEmail(school.email || '');
        setSchoolPhone(school.phone || '');
        setTotalStudents(school.totalStudents || '');
        setTotalTeachers(school.totalTeachers || '');
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load profile data',
        confirmButtonColor: '#dc3545'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    
    try {
      const token = getStoredToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      // Update user personal info
      const userUpdateResponse = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName,
          lastName,
          mobile
        })
      });
      
      if (!userUpdateResponse.ok) {
        const errorData = await userUpdateResponse.json();
        throw new Error(errorData.message || 'Failed to update personal information');
      }
      
      // Update school info
      if (schoolData && schoolData.id) {
        const schoolUpdateResponse = await fetch(`${API_BASE_URL}/schools/${schoolData.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: schoolName,
            address: schoolAddress,
            city,
            state,
            postalCode,
            country,
            establishedYear: parseInt(establishedYear) || null,
            type: schoolType,
            website,
            description,
            email: schoolEmail,
            phone: schoolPhone,
            totalStudents: parseInt(totalStudents) || null,
            totalTeachers: parseInt(totalTeachers) || null
          })
        });
        
        if (!schoolUpdateResponse.ok) {
          const errorData = await schoolUpdateResponse.json();
          throw new Error(errorData.message || 'Failed to update school information');
        }
      }
      
      await Swal.fire({
        icon: 'success',
        title: 'Profile Updated!',
        text: 'Your profile has been updated successfully.',
        confirmButtonColor: '#0d6efd',
        confirmButtonText: 'Great!'
      });
      
      // Refresh data
      fetchProfileData();
    } catch (error: any) {
      console.error('Error saving profile:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error?.message || 'Failed to update profile. Please try again.',
        confirmButtonColor: '#dc3545'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{customStyles}</style>
      
      <div className="min-vh-100 bg-light">
        {/* Header */}
        <div className="bg-white shadow-sm border-bottom">
          <div className="container-fluid py-4">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h3 className="fw-bold text-dark mb-1">
                  <Edit className="me-2 text-primary" size={28} style={{display: 'inline'}} />
                  Edit Profile
                </h3>
                <p className="text-muted mb-0">Update your school and personal information</p>
              </div>
              <Link href="/school-admin/dashboard" className="btn btn-outline-primary">
                <i className="fas fa-arrow-left me-2"></i>
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container-fluid py-5">
          <div className="row">
            <div className="col-lg-10 mx-auto">
              
              {/* Profile Header Card */}
              <div className="profile-card mb-4">
                <div className="profile-header">
                  <div className="profile-avatar">
                    <div className="text-primary" style={{fontSize: '4rem'}}>
                      {schoolName ? schoolName.charAt(0).toUpperCase() : 'S'}
                    </div>
                    <div className="profile-avatar-overlay">
                      <Camera size={30} className="text-white" />
                    </div>
                  </div>
                  <h3 className="fw-bold mb-2">{schoolName || 'School Name'}</h3>
                  <p className="mb-3">
                    <MapPin size={18} className="me-2" style={{display: 'inline'}} />
                    {city && state ? `${city}, ${state}` : 'Location not set'}
                  </p>
                  <div className="d-flex flex-wrap justify-content-center gap-2">
                    <span className="info-badge">
                      <Calendar size={16} />
                      Est. {establishedYear || 'N/A'}
                    </span>
                    <span className="info-badge">
                      <Building size={16} />
                      {schoolType ? schoolType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="form-section">
                <div className="form-section-header">
                  <div className="form-section-icon bg-primary bg-opacity-10 text-primary">
                    <User size={24} />
                  </div>
                  <div>
                    <h5 className="fw-bold mb-0">Personal Information</h5>
                    <p className="text-muted mb-0 small">Your personal details</p>
                  </div>
                </div>
                
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">First Name</label>
                    <input 
                      type="text"
                      className="form-control"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter first name"
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Last Name</label>
                    <input 
                      type="text"
                      className="form-control"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter last name"
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      <Mail size={16} className="me-2" />
                      Email Address
                    </label>
                    <input 
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email"
                      disabled
                    />
                    <small className="text-muted">Email cannot be changed</small>
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      <Phone size={16} className="me-2" />
                      Mobile Number
                    </label>
                    <input 
                      type="tel"
                      className="form-control"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="Enter mobile number"
                    />
                  </div>
                </div>
              </div>

              {/* School Basic Information */}
              <div className="form-section">
                <div className="form-section-header">
                  <div className="form-section-icon bg-success bg-opacity-10 text-success">
                    <Building size={24} />
                  </div>
                  <div>
                    <h5 className="fw-bold mb-0">School Information</h5>
                    <p className="text-muted mb-0 small">Basic school details</p>
                  </div>
                </div>
                
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label fw-semibold">School Name</label>
                    <input 
                      type="text"
                      className="form-control"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      placeholder="Enter school name"
                    />
                  </div>
                  
                  <div className="col-12">
                    <label className="form-label fw-semibold">School Address</label>
                    <textarea 
                      className="form-control"
                      rows={2}
                      value={schoolAddress}
                      onChange={(e) => setSchoolAddress(e.target.value)}
                      placeholder="Enter complete address"
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">City</label>
                    <input 
                      type="text"
                      className="form-control"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Enter city"
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">State</label>
                    <input 
                      type="text"
                      className="form-control"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Enter state"
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Postal Code</label>
                    <input 
                      type="text"
                      className="form-control"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="Enter postal code"
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Country</label>
                    <select 
                      className="form-select"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                    >
                      <option value="India">India</option>
                      <option value="USA">USA</option>
                      <option value="UK">UK</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                    </select>
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Established Year</label>
                    <input 
                      type="number"
                      className="form-control"
                      value={establishedYear}
                      onChange={(e) => setEstablishedYear(e.target.value)}
                      placeholder="YYYY"
                      min="1800"
                      max={new Date().getFullYear()}
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">School Type</label>
                    <select 
                      className="form-select"
                      value={schoolType}
                      onChange={(e) => setSchoolType(e.target.value)}
                    >
                      <option value="">Select Type</option>
                      <option value="primary">Primary School</option>
                      <option value="secondary">Secondary School</option>
                      <option value="higher_secondary">Higher Secondary</option>
                      <option value="international">International</option>
                      <option value="special_needs">Special Needs</option>
                    </select>
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      <Globe size={16} className="me-2" />
                      Website
                    </label>
                    <input 
                      type="url"
                      className="form-control"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://www.example.com"
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      <Mail size={16} className="me-2" />
                      School Email
                    </label>
                    <input 
                      type="email"
                      className="form-control"
                      value={schoolEmail}
                      onChange={(e) => setSchoolEmail(e.target.value)}
                      placeholder="school@example.com"
                    />
                  </div>
                  
                  <div className="col-12">
                    <label className="form-label fw-semibold">
                      <FileText size={16} className="me-2" />
                      School Description
                    </label>
                    <textarea 
                      className="form-control"
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief description about your school..."
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="form-section">
                <div className="form-section-header">
                  <div className="form-section-icon bg-info bg-opacity-10 text-info">
                    <Users size={24} />
                  </div>
                  <div>
                    <h5 className="fw-bold mb-0">Additional Details</h5>
                    <p className="text-muted mb-0 small">Contact and administrative information</p>
                  </div>
                </div>
                
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">
                      <Phone size={16} className="me-2" />
                      School Phone
                    </label>
                    <input 
                      type="tel"
                      className="form-control"
                      value={schoolPhone}
                      onChange={(e) => setSchoolPhone(e.target.value)}
                      placeholder="School contact number"
                    />
                  </div>
                  
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Total Students (Capacity)</label>
                    <input 
                      type="number"
                      className="form-control"
                      value={totalStudents}
                      onChange={(e) => setTotalStudents(e.target.value)}
                      placeholder="Maximum student capacity"
                    />
                  </div>
                  
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Total Teachers (Staff)</label>
                    <input 
                      type="number"
                      className="form-control"
                      value={totalTeachers}
                      onChange={(e) => setTotalTeachers(e.target.value)}
                      placeholder="Total teaching staff"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Floating Save Button */}
        <button 
          className="btn btn-primary btn-lg save-btn"
          onClick={handleSaveProfile}
          disabled={saving}
        >
          <Save size={20} className="me-2" />
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </>
  );
}

