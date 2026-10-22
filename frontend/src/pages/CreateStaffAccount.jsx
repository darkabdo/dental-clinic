import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import PageMeta from '../components/PageMeta'
import '../styles/Auth.css'

const specialties = [
  'General Dentistry',
  'Orthodontics',
  'Cosmetic Dentistry',
  'Oral Surgery',
]

/**
 * Admin-only: create receptionist or admin (User collection).
 */
export default function CreateStaffAccount() {
  const { auth } = useAuth()
  const [searchParams] = useSearchParams()
  const authHeader = { headers: { Authorization: `Bearer ${auth.token}` } }
  const [mode, setMode] = useState('staff')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const [staffForm, setStaffForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: '',
    role: 'receptionist',
  })

  const [doctorForm, setDoctorForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    specialty: '',
    licenseNumber: '',
    experienceYears: '',
    currentFocus: '',
    education: '',
    achievements: '',
    about: '',
  })

  useEffect(() => {
    const tab = searchParams.get('tab')
    const staffRole = searchParams.get('staffRole')
    if (tab === 'doctor') setMode('doctor')
    else if (tab === 'staff') setMode('staff')
    if (staffRole === 'admin' || staffRole === 'receptionist') {
      setStaffForm((p) => ({ ...p, role: staffRole }))
    }
  }, [searchParams])

  const submitStaff = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })
    setLoading(true)
    try {
      await axios.post('/api/admin/staff', staffForm, authHeader)
      setMessage({ type: 'success', text: 'Staff account created.' })
      setStaffForm((p) => ({
        ...p,
        firstName: '',
        lastName: '',
        email: '',
        password: '',
      }))
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Request failed' })
    } finally {
      setLoading(false)
    }
  }

  const submitDoctor = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })
    setLoading(true)
    try {
      await axios.post('/api/admin/doctors', doctorForm, authHeader)
      setMessage({ type: 'success', text: 'Doctor account created.' })
      setDoctorForm((p) => ({
        ...p,
        fullName: '',
        email: '',
        password: '',
        licenseNumber: '',
      }))
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Request failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <PageMeta title="Provision accounts" description="Admin — create staff or doctor accounts." />
      <div className="auth-box" style={{ maxWidth: '480px' }}>
        <h1>Provision accounts</h1>
        <p className="auth-subtitle">
          Fill out a form below and click the button — that creates the account. New users then use{' '}
          <Link to="/login">Login</Link> (pick Reception, Doctor, or Admin to match what you created).
        </p>

        <div className="auth-role-toggle">
          <button type="button" className={`role-btn ${mode === 'staff' ? 'active' : ''}`} onClick={() => setMode('staff')}>
            Staff (User)
          </button>
          <button
            type="button"
            className={`role-btn ${mode === 'doctor' ? 'active' : ''}`}
            onClick={() => setMode('doctor')}
          >
            Doctor
          </button>
        </div>

        {message.text ? (
          <div className={message.type === 'error' ? 'alert alert-error' : 'alert alert-success'}>{message.text}</div>
        ) : null}

        {mode === 'staff' ? (
          <form onSubmit={submitStaff} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label>First name</label>
                <input
                  value={staffForm.firstName}
                  onChange={(e) => setStaffForm((p) => ({ ...p, firstName: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last name</label>
                <input
                  value={staffForm.lastName}
                  onChange={(e) => setStaffForm((p) => ({ ...p, lastName: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Work email</label>
              <input
                type="email"
                value={staffForm.email}
                onChange={(e) => setStaffForm((p) => ({ ...p, email: e.target.value }))}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input
                  value={staffForm.phone}
                  onChange={(e) => setStaffForm((p) => ({ ...p, phone: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Date of birth</label>
                <input
                  type="date"
                  value={staffForm.dateOfBirth}
                  onChange={(e) => setStaffForm((p) => ({ ...p, dateOfBirth: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Role</label>
              <select value={staffForm.role} onChange={(e) => setStaffForm((p) => ({ ...p, role: e.target.value }))}>
                <option value="receptionist">Receptionist</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <div className="form-group">
              <label>Initial password</label>
              <input
                type="password"
                value={staffForm.password}
                onChange={(e) => setStaffForm((p) => ({ ...p, password: e.target.value }))}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Saving…' : 'Create staff account'}
            </button>
          </form>
        ) : (
          <form onSubmit={submitDoctor} className="auth-form">
            <div className="form-group">
              <label>Full name</label>
              <input
                value={doctorForm.fullName}
                onChange={(e) => setDoctorForm((p) => ({ ...p, fullName: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={doctorForm.email}
                onChange={(e) => setDoctorForm((p) => ({ ...p, email: e.target.value }))}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input
                  value={doctorForm.phone}
                  onChange={(e) => setDoctorForm((p) => ({ ...p, phone: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={doctorForm.password}
                  onChange={(e) => setDoctorForm((p) => ({ ...p, password: e.target.value }))}
                  required
                  minLength={8}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Specialty</label>
                <select
                  value={doctorForm.specialty}
                  onChange={(e) => setDoctorForm((p) => ({ ...p, specialty: e.target.value }))}
                  required
                >
                  <option value="">Select</option>
                  {specialties.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>License #</label>
                <input
                  value={doctorForm.licenseNumber}
                  onChange={(e) => setDoctorForm((p) => ({ ...p, licenseNumber: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Experience (years)</label>
              <input
                type="number"
                min="0"
                value={doctorForm.experienceYears}
                onChange={(e) => setDoctorForm((p) => ({ ...p, experienceYears: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Current focus (optional)</label>
              <input
                value={doctorForm.currentFocus}
                onChange={(e) => setDoctorForm((p) => ({ ...p, currentFocus: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Education (comma-separated, optional)</label>
              <input
                value={doctorForm.education}
                onChange={(e) => setDoctorForm((p) => ({ ...p, education: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Achievements (optional)</label>
              <input
                value={doctorForm.achievements}
                onChange={(e) => setDoctorForm((p) => ({ ...p, achievements: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>About (optional)</label>
              <textarea
                rows={2}
                value={doctorForm.about}
                onChange={(e) => setDoctorForm((p) => ({ ...p, about: e.target.value }))}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Saving…' : 'Create doctor account'}
            </button>
          </form>
        )}

        <p className="auth-footer">
          <Link to="/admin-dashboard">← Admin home</Link>
        </p>
      </div>
    </div>
  )
}
