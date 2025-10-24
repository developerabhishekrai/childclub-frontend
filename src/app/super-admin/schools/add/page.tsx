'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface SchoolFormData {
  name: string
  description: string
  type: string
  address: string
  city: string
  state: string
  country: string
  postalCode: string
  phone: string
  email: string
  website: string
  establishedYear: string
  totalStudents: string
  totalTeachers: string
  totalClasses: string
  facilities: string
  achievements: string
  vision: string
  mission: string
}

export default function SuperAdminSchoolAdd() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState<SchoolFormData>({
    name: '',
    description: '',
    type: 'primary',
    address: '',
    city: '',
    state: '',
    country: 'India',
    postalCode: '',
    phone: '',
    email: '',
    website: '',
    establishedYear: '',
    totalStudents: '',
    totalTeachers: '',
    totalClasses: '',
    facilities: '',
    achievements: '',
    vision: '',
    mission: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('School name is required')
      return false
    }
    if (!formData.address.trim()) {
      setError('Address is required')
      return false
    }
    if (!formData.city.trim()) {
      setError('City is required')
      return false
    }
    if (!formData.state.trim()) {
      setError('State is required')
      return false
    }
    if (!formData.postalCode.trim()) {
      setError('Postal code is required')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Please login first')
        return
      }

      const schoolData = {
        name: formData.name,
        description: formData.description || undefined,
        type: formData.type,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        postalCode: formData.postalCode,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        website: formData.website || undefined,
        establishedYear: formData.establishedYear ? parseInt(formData.establishedYear) : undefined,
        totalStudents: formData.totalStudents ? parseInt(formData.totalStudents) : undefined,
        totalTeachers: formData.totalTeachers ? parseInt(formData.totalTeachers) : undefined,
        totalClasses: formData.totalClasses ? parseInt(formData.totalClasses) : undefined,
        facilities: formData.facilities || undefined,
        achievements: formData.achievements || undefined,
        vision: formData.vision || undefined,
        mission: formData.mission || undefined,
      }

      console.log('Creating school with data:', schoolData)

      const response = await fetch('http://localhost:3001/schools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(schoolData),
      })

      console.log('School API Response Status:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('School creation error:', errorData)
        setError(`Failed to create school: ${errorData.message || 'Unknown error'}`)
        return
      }

      const result = await response.json()
      console.log('School created successfully:', result)

      setSuccess('✅ School created successfully!')
      setTimeout(() => {
        router.push('/super-admin/schools/list')
      }, 2000)

    } catch (err) {
      console.error('Error creating school:', err)
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-vh-100 bg-light py-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            {/* Header */}
            <div className="d-flex align-items-center mb-4">
              <Link href="/super-admin/schools/list" className="btn btn-outline-secondary me-3">
                ← Back to Schools
              </Link>
              <div>
                <h1 className="h2 fw-bold text-dark mb-0">Add New School</h1>
                <p className="text-muted mb-0">Create a new school in the system</p>
              </div>
            </div>

            {/* School Form */}
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                {error && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError('')}></button>
                  </div>
                )}

                {success && (
                  <div className="alert alert-success alert-dismissible fade show" role="alert">
                    {success}
                    <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Basic Information */}
                  <div className="row mb-4">
                    <div className="col-12">
                      <h5 className="text-primary mb-3">🏫 Basic Information</h5>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="name" className="form-label fw-semibold">
                        School Name *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="type" className="form-label fw-semibold">
                        School Type *
                      </label>
                      <select
                        className="form-select"
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        required
                      >
                        <option value="primary">Primary School</option>
                        <option value="secondary">Secondary School</option>
                        <option value="higher_secondary">Higher Secondary School</option>
                        <option value="international">International School</option>
                        <option value="special_needs">Special Needs School</option>
                      </select>
                    </div>
                    <div className="col-12 mb-3">
                      <label htmlFor="description" className="form-label fw-semibold">
                        Description
                      </label>
                      <textarea
                        className="form-control"
                        id="description"
                        name="description"
                        rows={3}
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Brief description of the school..."
                      />
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="row mb-4">
                    <div className="col-12">
                      <h5 className="text-primary mb-3">📍 Address Information</h5>
                    </div>
                    <div className="col-12 mb-3">
                      <label htmlFor="address" className="form-label fw-semibold">
                        Full Address *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label htmlFor="city" className="form-label fw-semibold">
                        City *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label htmlFor="state" className="form-label fw-semibold">
                        State *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label htmlFor="postalCode" className="form-label fw-semibold">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-12 mb-3">
                      <label htmlFor="country" className="form-label fw-semibold">
                        Country *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="row mb-4">
                    <div className="col-12">
                      <h5 className="text-primary mb-3">📞 Contact Information</h5>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="phone" className="form-label fw-semibold">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 9876543210"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="email" className="form-label fw-semibold">
                        Email Address
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="info@school.com"
                      />
                    </div>
                    <div className="col-12 mb-3">
                      <label htmlFor="website" className="form-label fw-semibold">
                        Website
                      </label>
                      <input
                        type="url"
                        className="form-control"
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="https://www.school.com"
                      />
                    </div>
                  </div>

                  {/* School Statistics */}
                  <div className="row mb-4">
                    <div className="col-12">
                      <h5 className="text-primary mb-3">📊 School Statistics</h5>
                    </div>
                    <div className="col-md-3 mb-3">
                      <label htmlFor="establishedYear" className="form-label fw-semibold">
                        Established Year
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="establishedYear"
                        name="establishedYear"
                        value={formData.establishedYear}
                        onChange={handleChange}
                        min="1800"
                        max={new Date().getFullYear()}
                        placeholder="2020"
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label htmlFor="totalStudents" className="form-label fw-semibold">
                        Total Students
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="totalStudents"
                        name="totalStudents"
                        value={formData.totalStudents}
                        onChange={handleChange}
                        min="0"
                        placeholder="500"
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label htmlFor="totalTeachers" className="form-label fw-semibold">
                        Total Teachers
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="totalTeachers"
                        name="totalTeachers"
                        value={formData.totalTeachers}
                        onChange={handleChange}
                        min="0"
                        placeholder="30"
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label htmlFor="totalClasses" className="form-label fw-semibold">
                        Total Classes
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="totalClasses"
                        name="totalClasses"
                        value={formData.totalClasses}
                        onChange={handleChange}
                        min="0"
                        placeholder="20"
                      />
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="row mb-4">
                    <div className="col-12">
                      <h5 className="text-primary mb-3">ℹ️ Additional Information</h5>
                    </div>
                    <div className="col-12 mb-3">
                      <label htmlFor="facilities" className="form-label fw-semibold">
                        Facilities
                      </label>
                      <textarea
                        className="form-control"
                        id="facilities"
                        name="facilities"
                        rows={2}
                        value={formData.facilities}
                        onChange={handleChange}
                        placeholder="Library, Playground, Computer Lab, etc."
                      />
                    </div>
                    <div className="col-12 mb-3">
                      <label htmlFor="achievements" className="form-label fw-semibold">
                        Achievements
                      </label>
                      <textarea
                        className="form-control"
                        id="achievements"
                        name="achievements"
                        rows={2}
                        value={formData.achievements}
                        onChange={handleChange}
                        placeholder="Best School Award 2023, etc."
                      />
                    </div>
                    <div className="col-12 mb-3">
                      <label htmlFor="vision" className="form-label fw-semibold">
                        Vision Statement
                      </label>
                      <textarea
                        className="form-control"
                        id="vision"
                        name="vision"
                        rows={2}
                        value={formData.vision}
                        onChange={handleChange}
                        placeholder="To foster a love for learning..."
                      />
                    </div>
                    <div className="col-12 mb-3">
                      <label htmlFor="mission" className="form-label fw-semibold">
                        Mission Statement
                      </label>
                      <textarea
                        className="form-control"
                        id="mission"
                        name="mission"
                        rows={2}
                        value={formData.mission}
                        onChange={handleChange}
                        placeholder="Empowering students for future challenges..."
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="row">
                    <div className="col-12">
                      <div className="d-flex gap-3">
                        <button
                          type="submit"
                          className="btn btn-primary btn-lg px-5"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Creating School...
                            </>
                          ) : (
                            <>
                              <span className="me-2">🏫</span>
                              Create School
                            </>
                          )}
                        </button>
                        <Link href="/super-admin/schools/list" className="btn btn-outline-secondary btn-lg px-4">
                          Cancel
                        </Link>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

