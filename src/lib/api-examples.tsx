/**
 * API Helper Examples
 * Practical examples of using API helpers in React components
 */

'use client'

import { useState, useEffect } from 'react'
import { authApi, schoolsApi, teachersApi, studentsApi } from '@/lib/api-endpoints'
import { ApiError, storeToken, storeUser, clearAuthData } from '@/lib/api'
import type { School, Teacher, Student } from '@/types/api'

// ==================== EXAMPLE 1: Login Component ====================

export function LoginExample() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await authApi.login({
        email,
        password,
        role: 'school_admin'
      })

      // Store token and user
      storeToken(response.access_token)
      storeUser(response.user)

      // Redirect to dashboard
      window.location.href = '/dashboard'
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Login failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}

// ==================== EXAMPLE 2: Schools List ====================

export function SchoolsListExample() {
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    loadSchools()
  }, [page])

  const loadSchools = async () => {
    try {
      const response = await schoolsApi.getAll({
        status: 'approved',
        page,
        limit: 10
      })

      setSchools(response.data)
      setTotal(response.total)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (schoolId: number) => {
    try {
      await schoolsApi.approve(schoolId, 'Approved by admin')
      loadSchools() // Reload list
      alert('School approved successfully!')
    } catch (err) {
      if (err instanceof ApiError) {
        alert(err.message)
      }
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h2>Schools ({total})</h2>
      {schools.map(school => (
        <div key={school.id}>
          <h3>{school.name}</h3>
          <p>{school.city}, {school.state}</p>
          <button onClick={() => handleApprove(school.id)}>
            Approve
          </button>
        </div>
      ))}
      
      <div>
        <button 
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <span>Page {page}</span>
        <button 
          onClick={() => setPage(p => p + 1)}
          disabled={page * 10 >= total}
        >
          Next
        </button>
      </div>
    </div>
  )
}

// ==================== EXAMPLE 3: Create Teacher ====================

export function CreateTeacherExample() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    department: '',
    designation: '',
    qualification: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setSubmitting(true)

    try {
      // First register user
      const userResponse = await authApi.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        mobile: formData.mobile,
        password: 'temp123456', // Generate or ask for password
        confirmPassword: 'temp123456',
        role: 'teacher'
      })

      // Then create teacher record
      await teachersApi.create({
        userId: userResponse.user.id,
        schoolId: 1, // Get from logged-in admin
        department: formData.department,
        designation: formData.designation,
        qualification: formData.qualification,
        status: 'active'
      })

      setSuccess(true)
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        mobile: '',
        department: '',
        designation: '',
        qualification: ''
      })
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to create teacher')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="First Name"
        value={formData.firstName}
        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
        required
      />
      <input
        type="text"
        placeholder="Last Name"
        value={formData.lastName}
        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        required
      />
      <input
        type="tel"
        placeholder="Mobile"
        value={formData.mobile}
        onChange={(e) => setFormData({...formData, mobile: e.target.value})}
      />
      <input
        type="text"
        placeholder="Department"
        value={formData.department}
        onChange={(e) => setFormData({...formData, department: e.target.value})}
      />
      <input
        type="text"
        placeholder="Designation"
        value={formData.designation}
        onChange={(e) => setFormData({...formData, designation: e.target.value})}
      />
      <input
        type="text"
        placeholder="Qualification"
        value={formData.qualification}
        onChange={(e) => setFormData({...formData, qualification: e.target.value})}
      />
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">Teacher created successfully!</div>}
      
      <button type="submit" disabled={submitting}>
        {submitting ? 'Creating...' : 'Create Teacher'}
      </button>
    </form>
  )
}

// ==================== EXAMPLE 4: Update Student Status ====================

export function StudentStatusExample({ studentId }: { studentId: number }) {
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStudent()
  }, [studentId])

  const loadStudent = async () => {
    try {
      const data = await studentsApi.getById(studentId)
      setStudent(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (status: string) => {
    if (!student) return

    try {
      const updated = await studentsApi.updateStatus(student.id, status)
      setStudent(updated)
      alert('Status updated successfully!')
    } catch (err) {
      if (err instanceof ApiError) {
        alert(err.message)
      }
    }
  }

  if (loading) return <div>Loading...</div>
  if (!student) return <div>Student not found</div>

  return (
    <div>
      <h3>{student.user?.firstName} {student.user?.lastName}</h3>
      <p>Current Status: {student.status}</p>
      
      <div>
        <button onClick={() => updateStatus('active')}>
          Activate
        </button>
        <button onClick={() => updateStatus('inactive')}>
          Deactivate
        </button>
        <button onClick={() => updateStatus('transferred')}>
          Mark as Transferred
        </button>
      </div>
    </div>
  )
}

// ==================== EXAMPLE 5: Logout ====================

export function LogoutExample() {
  const handleLogout = () => {
    clearAuthData() // Clears all auth data: token, user, userRole, userEmail, userData
    window.location.href = '/login'
  }

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  )
}

// ==================== EXAMPLE 6: Search with Debounce ====================

export function SearchSchoolsExample() {
  const [searchTerm, setSearchTerm] = useState('')
  const [schools, setSchools] = useState<School[]>([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        searchSchools()
      } else {
        setSchools([])
      }
    }, 500) // Debounce 500ms

    return () => clearTimeout(timer)
  }, [searchTerm])

  const searchSchools = async () => {
    setSearching(true)
    try {
      const response = await schoolsApi.getAll({
        search: searchTerm,
        page: 1,
        limit: 10
      })
      setSchools(response.data)
    } catch (err) {
      console.error(err)
    } finally {
      setSearching(false)
    }
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Search schools..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {searching && <span>Searching...</span>}
      
      <ul>
        {schools.map(school => (
          <li key={school.id}>
            {school.name} - {school.city}
          </li>
        ))}
      </ul>
    </div>
  )
}

