import React, { useMemo, useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import AppointmentCard from '../components/AppointmentCard'
import PageMeta from '../components/PageMeta'
import EmptyState from '../components/EmptyState'
import { SkeletonText, SkeletonCard } from '../components/Skeleton'
import '../styles/Profile.css'
import { formatDisplayDate } from '../utils/date'

const Profile = () => {
  const { auth } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [summary, setSummary] = useState(null)
  const [medicalProfile, setMedicalProfile] = useState({
    bloodType: '',
    allergies: '',
    chronicConditions: '',
    medications: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    notes: '',
  })
  const [showMedicalProfile, setShowMedicalProfile] = useState(false)
  const [timelineFilter, setTimelineFilter] = useState('all')

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const [appointmentsRes, historyRes] = await Promise.all([
        axios.get('/api/appointments/my', {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }),
        axios.get('/api/appointments/history-summary', {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }),
      ])
      setAppointments(appointmentsRes.data)
      setSummary(historyRes.data.summary)
      const profile = historyRes.data.patient?.medicalProfile || {}
      setMedicalProfile({
        bloodType: profile.bloodType || '',
        allergies: (profile.allergies || []).join(', '),
        chronicConditions: (profile.chronicConditions || []).join(', '),
        medications: (profile.medications || []).join(', '),
        emergencyContactName: profile.emergencyContactName || '',
        emergencyContactPhone: profile.emergencyContactPhone || '',
        notes: profile.notes || '',
      })
      setLoading(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch appointments')
      setLoading(false)
    }
  }

  const handleMedicalProfileChange = (e) => {
    const { name, value } = e.target
    setMedicalProfile((prev) => ({ ...prev, [name]: value }))
  }

  const handleMedicalProfileSave = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await axios.put(
        '/api/appointments/medical-profile',
        {
          medicalProfile: {
            bloodType: medicalProfile.bloodType,
            allergies: medicalProfile.allergies
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean),
            chronicConditions: medicalProfile.chronicConditions
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean),
            medications: medicalProfile.medications
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean),
            emergencyContactName: medicalProfile.emergencyContactName,
            emergencyContactPhone: medicalProfile.emergencyContactPhone,
            notes: medicalProfile.notes,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      )
      setSuccessMessage('Medical profile updated successfully')
      await fetchAppointments()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update medical profile')
    }
  }

  const handleDeleteAppointment = async (appointmentId) => {
    try {
      await axios.delete(`/api/appointments/${appointmentId}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      })
      setSuccessMessage('Appointment cancelled successfully')
      await fetchAppointments()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel appointment')
    }
  }

  const groupedAppointments = useMemo(() => {
    const filtered = appointments.filter((appointment) =>
      timelineFilter === 'all' ? true : appointment.status === timelineFilter
    )

    const groups = new Map()
    filtered.forEach((appointment) => {
      const d = new Date(appointment.date)
      const key = d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key).push(appointment)
    })

    return Array.from(groups.entries())
  }, [appointments, timelineFilter])

  return (
    <div className="profile-container">
      <PageMeta title="Patient workspace" description="Your profile, medical details, and clinical timeline." />
      <div className="container">
        <div className="profile-header">
          <h1>Patient Health Workspace</h1>
          <p>{auth.user?.firstName} {auth.user?.lastName}</p>
        </div>

        {summary && (
          <div className="profile-stats">
            <div className="profile-stat-card">
              <span className="profile-stat-label">Total Visits</span>
              <span className="profile-stat-value">{summary.totalVisits}</span>
            </div>
            <div className="profile-stat-card">
              <span className="profile-stat-label">Completed Treatments</span>
              <span className="profile-stat-value">{summary.completedTreatments}</span>
            </div>
            <div className="profile-stat-card">
              <span className="profile-stat-label">Upcoming Appointments</span>
              <span className="profile-stat-value">{summary.upcomingAppointments}</span>
            </div>
            <div className="profile-stat-card">
              <span className="profile-stat-label">Latest Diagnosis</span>
              <span className="profile-stat-text">{summary.latestDiagnosis || 'No diagnosis yet'}</span>
            </div>
          </div>
        )}

        <div className="profile-content">
          <section className="profile-section">
            <h2>Personal Information</h2>
            <div className="user-info">
              <div className="info-card">
                <div className="info-group">
                  <label>First Name</label>
                  <p>{auth.user?.firstName}</p>
                </div>
                <div className="info-group">
                  <label>Last Name</label>
                  <p>{auth.user?.lastName}</p>
                </div>
              </div>
              <div className="info-card">
                <div className="info-group">
                  <label>Date of Birth</label>
                  <p>{formatDisplayDate(auth.user?.dateOfBirth)}</p>
                </div>
                <div className="info-group">
                  <label>Email</label>
                  <p>{auth.user?.email}</p>
                </div>
              </div>
              <div className="info-card">
                <div className="info-group">
                  <label>Phone</label>
                  <p>{auth.user?.phone}</p>
                </div>
                <div className="info-group">
                  <label>Health Timeline</label>
                  <p>Treatment details are tracked in your clinical timeline.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="profile-section">
            <div className="section-heading-row">
              <h2>Medical Profile</h2>
              <button
                type="button"
                className="btn btn-outline btn-small"
                onClick={() => setShowMedicalProfile((prev) => !prev)}
              >
                {showMedicalProfile ? 'Hide Details' : 'Edit Details'}
              </button>
            </div>
            {showMedicalProfile && (
            <form className="clinical-form" onSubmit={handleMedicalProfileSave}>
              <div className="info-card">
                <div className="form-group">
                  <label>Blood Type</label>
                  <input
                    name="bloodType"
                    value={medicalProfile.bloodType}
                    onChange={handleMedicalProfileChange}
                    placeholder="A+, O-, etc."
                  />
                </div>
                <div className="form-group">
                  <label>Current Medications</label>
                  <input
                    name="medications"
                    value={medicalProfile.medications}
                    onChange={handleMedicalProfileChange}
                    placeholder="Comma-separated"
                  />
                </div>
              </div>
              <div className="info-card">
                <div className="form-group">
                  <label>Allergies</label>
                  <input
                    name="allergies"
                    value={medicalProfile.allergies}
                    onChange={handleMedicalProfileChange}
                    placeholder="Latex, penicillin..."
                  />
                </div>
                <div className="form-group">
                  <label>Chronic Conditions</label>
                  <input
                    name="chronicConditions"
                    value={medicalProfile.chronicConditions}
                    onChange={handleMedicalProfileChange}
                    placeholder="Diabetes, hypertension..."
                  />
                </div>
              </div>
              <div className="info-card">
                <div className="form-group">
                  <label>Emergency Contact Name</label>
                  <input
                    name="emergencyContactName"
                    value={medicalProfile.emergencyContactName}
                    onChange={handleMedicalProfileChange}
                  />
                </div>
                <div className="form-group">
                  <label>Emergency Contact Phone</label>
                  <input
                    name="emergencyContactPhone"
                    value={medicalProfile.emergencyContactPhone}
                    onChange={handleMedicalProfileChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Clinical Notes</label>
                <textarea
                  name="notes"
                  rows="3"
                  value={medicalProfile.notes}
                  onChange={handleMedicalProfileChange}
                  placeholder="Any relevant history your dentist should know"
                />
              </div>
              <button className="btn btn-primary" type="submit">
                Save Medical Profile
              </button>
            </form>
            )}
          </section>

          {/* Appointments */}
          <section className="profile-section appointments-section">
            <div className="section-heading-row">
              <h2>Clinical Timeline</h2>
              <select
                className="timeline-filter"
                value={timelineFilter}
                onChange={(e) => setTimelineFilter(e.target.value)}
              >
                <option value="all">All Visits</option>
                <option value="scheduled">Upcoming</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {successMessage && (
              <div className="alert alert-success">{successMessage}</div>
            )}

            {error && <div className="alert alert-error">{error}</div>}

            {loading ? (
              <div className="skeleton-stack" aria-busy="true" aria-label="Loading timeline">
                <SkeletonText lines={2} />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : appointments.length === 0 ? (
              <EmptyState
                title="No visits yet"
                description="Book your first appointment to see it on your clinical timeline."
                actionLabel="Book an appointment"
                actionTo="/patient-workspace/book"
              />
            ) : groupedAppointments.length === 0 ? (
              <EmptyState
                title="No visits match this filter"
                description="Try showing all visits or a different status."
              />
            ) : (
              <div className="appointments-list">
                {groupedAppointments.map(([month, items]) => (
                  <details key={month} className="timeline-group" open>
                    <summary className="timeline-summary">
                      <span>{month}</span>
                      <span className="timeline-count">{items.length}</span>
                    </summary>
                    <div className="timeline-items">
                      {items.map((appointment) => (
                        <AppointmentCard
                          key={appointment._id}
                          appointment={appointment}
                          onDelete={handleDeleteAppointment}
                        />
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

export default Profile
