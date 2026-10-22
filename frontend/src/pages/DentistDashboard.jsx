import React, { useMemo, useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import PageMeta from '../components/PageMeta'
import EmptyState from '../components/EmptyState'
import { Skeleton, SkeletonText } from '../components/Skeleton'
import '../styles/DentistDashboard.css'
import { formatDisplayDateTime } from '../utils/date'
import CalendarPicker from '../components/CalendarPicker'

const DentistDashboard = () => {
  const { auth } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('appointments')
  const [successMessage, setSuccessMessage] = useState('')
  const [dentistProfile, setDentistProfile] = useState(null)
  const [editingFocus, setEditingFocus] = useState('')
  const [selectedPatientHistory, setSelectedPatientHistory] = useState(null)
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [noteForms, setNoteForms] = useState({})
  const [selectedAppointmentId, setSelectedAppointmentId] = useState('')
  const [selectedClinicalEntryId, setSelectedClinicalEntryId] = useState('')
  const [patientSearch, setPatientSearch] = useState('')
  const [clinicalSearch, setClinicalSearch] = useState('')
  const [clinicalStatusFilter, setClinicalStatusFilter] = useState('all')
  const [scheduleMonthDate, setScheduleMonthDate] = useState(() => new Date())
  const [scheduleByDate, setScheduleByDate] = useState({})
  const [scheduleDates, setScheduleDates] = useState([])
  const [selectedScheduleDate, setSelectedScheduleDate] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const from = new Date(scheduleMonthDate.getFullYear(), scheduleMonthDate.getMonth(), 1)
        const to = new Date(scheduleMonthDate.getFullYear(), scheduleMonthDate.getMonth() + 1, 0)
        const fromKey = from.toISOString().slice(0, 10)
        const toKey = to.toISOString().slice(0, 10)

        const response = await axios.get(`/api/dentist/schedule?from=${fromKey}&to=${toKey}`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        })

        const map = {}
        const set = new Set()
        response.data.appointments.forEach((appt) => {
          const key = new Date(appt.date).toISOString().slice(0, 10)
          set.add(key)
          if (!map[key]) map[key] = []
          map[key].push(appt)
        })

        setScheduleByDate(map)
        const dates = Array.from(set).sort()
        setScheduleDates(dates)
        if (!selectedScheduleDate && dates.length) setSelectedScheduleDate(dates[0])
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load schedule calendar')
      }
    }

    if (auth.token) fetchSchedule()
  }, [auth.token, scheduleMonthDate, selectedScheduleDate])

  const scheduleBadges = scheduleDates.reduce((acc, dateKey) => {
    const count = scheduleByDate[dateKey]?.length || 0
    if (count > 0) acc[dateKey] = { text: String(count), variant: 'primary' }
    return acc
  }, {})

  const fetchData = async () => {
    try {
      const [appointmentsRes, patientsRes, profileRes] = await Promise.all([
        axios.get('/api/dentist/my', {
          headers: { Authorization: `Bearer ${auth.token}` },
        }),
        axios.get('/api/dentist/patients', {
          headers: { Authorization: `Bearer ${auth.token}` },
        }),
        axios.get('/api/dentist/profile', {
          headers: { Authorization: `Bearer ${auth.token}` },
        }),
      ])
      setAppointments(appointmentsRes.data)
      setPatients(patientsRes.data)
      setDentistProfile(profileRes.data)
      setEditingFocus(profileRes.data.currentFocus || '')
      setLoading(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data')
      setLoading(false)
    }
  }

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await axios.put(
        `/api/dentist/appointments/${appointmentId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      )
      setSuccessMessage('Appointment status updated')
      await fetchData()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update appointment')
    }
  }

  const handleLiveUpdate = async (status) => {
    try {
      await axios.put(
        '/api/dentist/profile/live',
        { currentStatus: status, currentFocus: editingFocus },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      )
      setSuccessMessage('Live profile updated')
      await fetchData()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update live status')
    }
  }

  const saveCurrentFocus = async () => {
    await handleLiveUpdate(dentistProfile?.currentStatus || 'available')
  }

  const updateNoteField = (appointmentId, field, value) => {
    setNoteForms((prev) => ({
      ...prev,
      [appointmentId]: {
        ...prev[appointmentId],
        [field]: value,
      },
    }))
  }

  const loadPatientHistory = async (patientId) => {
    try {
      const response = await axios.get(`/api/dentist/patients/${patientId}/history`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      setSelectedPatientId(patientId)
      setSelectedPatientHistory(response.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load patient history')
    }
  }

  const saveClinicalNote = async (appointmentId) => {
    const note = noteForms[appointmentId] || {}
    try {
      await axios.put(
        `/api/dentist/appointments/${appointmentId}/notes`,
        {
          diagnosis: note.diagnosis || '',
          treatmentNotes: note.treatmentNotes || '',
          treatmentPlan: note.treatmentPlan || '',
          procedures: (note.procedures || '')
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
          prescribedMedications: (note.prescribedMedications || '')
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
          followUpDate: note.followUpDate || '',
          painLevel: Number(note.painLevel || 0),
        },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      )
      setSuccessMessage('Clinical note saved')
      await fetchData()
      if (selectedPatientId) {
        await loadPatientHistory(selectedPatientId)
      }
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save clinical note')
    }
  }

  const filteredPatients = patients.filter((patient) => {
    const text = `${patient.firstName} ${patient.lastName} ${patient.email}`.toLowerCase()
    return text.includes(patientSearch.toLowerCase())
  })

  const filteredClinicalHistory =
    selectedPatientHistory?.clinicalHistory?.filter((item) => {
      const haystack = `${item.reason} ${item.symptoms || ''} ${item.diagnosis || ''} ${item.treatmentPlan || ''}`
        .toLowerCase()
      const matchesSearch = haystack.includes(clinicalSearch.toLowerCase())
      const matchesStatus =
        clinicalStatusFilter === 'all' ? true : item.status === clinicalStatusFilter
      return matchesSearch && matchesStatus
    }) || []

  const sortedAppointments = useMemo(
    () =>
      [...appointments].sort((a, b) => {
        const aDate = new Date(`${new Date(a.date).toISOString().slice(0, 10)}T${a.time || '00:00'}`)
        const bDate = new Date(`${new Date(b.date).toISOString().slice(0, 10)}T${b.time || '00:00'}`)
        return aDate - bDate
      }),
    [appointments]
  )

  const activeAppointment = useMemo(
    () => sortedAppointments.find((appt) => appt._id === selectedAppointmentId) || sortedAppointments[0],
    [selectedAppointmentId, sortedAppointments]
  )

  const activeClinicalEntry = useMemo(
    () =>
      filteredClinicalHistory.find((item) => item._id === selectedClinicalEntryId) || filteredClinicalHistory[0],
    [filteredClinicalHistory, selectedClinicalEntryId]
  )

  useEffect(() => {
    if (!activeAppointment && sortedAppointments.length > 0) {
      setSelectedAppointmentId(sortedAppointments[0]._id)
    }
  }, [activeAppointment, sortedAppointments])

  useEffect(() => {
    if (!activeClinicalEntry && filteredClinicalHistory.length > 0) {
      setSelectedClinicalEntryId(filteredClinicalHistory[0]._id)
    }
  }, [activeClinicalEntry, filteredClinicalHistory])

  const appointmentTone = (appointment) => {
    if (appointment?.urgency === 'high') return 'critical'
    if (appointment?.urgency === 'medium') return 'priority'
    const reason = (appointment?.reason || '').toLowerCase()
    if (reason.includes('surgery') || reason.includes('extraction')) return 'critical'
    if (reason.includes('pain') || reason.includes('infection')) return 'priority'
    return 'routine'
  }

  return (
    <div className="dentist-dashboard">
      <PageMeta title="Dentist dashboard" description="Clinical schedule, patients, and calendar." />
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1>Dentist Dashboard</h1>
            <p>Welcome, {dentistProfile?.fullName || auth.user?.fullName}!</p>
          </div>
          <div className="dentist-info">
            <div className="info-item">
              <span className="label">Specialty:</span>
              <span className="value">{dentistProfile?.specialty || auth.user?.specialty}</span>
            </div>
            <div className="info-item">
              <span className="label">Clinic:</span>
              <span className="value">
                {dentistProfile?.clinicName ?? (loading ? '…' : '—')}
              </span>
            </div>
          </div>
        </div>

        <div className="live-status-ribbon">
          <div className="live-status-title">
            <strong>Live Professional Status</strong>
            <span>Quick update shown to patients and staff</span>
          </div>
          <div className="live-status-controls">
            <input
              value={editingFocus}
              onChange={(e) => setEditingFocus(e.target.value)}
              placeholder="Current focus"
            />
            <select
              value={dentistProfile?.currentStatus || 'available'}
              onChange={(e) => handleLiveUpdate(e.target.value)}
            >
              <option value="available">Available</option>
              <option value="in_consultation">In consultation</option>
              <option value="in_procedure">In procedure</option>
              <option value="on_break">On break</option>
              <option value="offline">Offline</option>
            </select>
            <button className="btn btn-primary btn-small" onClick={saveCurrentFocus}>
              Save
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-label">Upcoming Appointments</div>
              <div className="stat-value">
                {appointments.filter((a) => a.status === 'scheduled').length}
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-label">Total Patients</div>
              <div className="stat-value">{patients.length}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-label">Completed</div>
              <div className="stat-value">
                {appointments.filter((a) => a.status === 'completed').length}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="dashboard-tabs">
          <button
            className={`tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            Appointments
          </button>
          <button
            className={`tab-btn ${activeTab === 'patients' ? 'active' : ''}`}
            onClick={() => setActiveTab('patients')}
          >
            Patients
          </button>
          <button
            className={`tab-btn ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendar')}
          >
            Calendar
          </button>
        </div>

        {/* Content */}
        <div className="dashboard-content">
          {successMessage && (
            <div className="alert alert-success">{successMessage}</div>
          )}
          {error && <div className="alert alert-error">{error}</div>}

          {loading ? (
            <div className="skeleton-workspace" aria-busy="true" aria-label="Loading dashboard">
              <div className="skeleton-stack">
                <Skeleton style={{ height: '4.25rem', borderRadius: '14px' }} />
                <Skeleton style={{ height: '4.25rem', borderRadius: '14px' }} />
                <Skeleton style={{ height: '4.25rem', borderRadius: '14px' }} />
              </div>
              <div className="skeleton-stack">
                <SkeletonText lines={5} />
              </div>
            </div>
          ) : activeTab === 'appointments' ? (
            <div className="appointments-section">
              <h2>Clinical Schedule Workspace</h2>
              {sortedAppointments.length === 0 ? (
                <EmptyState
                  title="No appointments scheduled"
                  description="New bookings from patients and reception will appear in this workspace."
                />
              ) : (
                <div className="clinical-workspace">
                  <div className="workspace-list">
                    {sortedAppointments.map((appointment) => (
                      <button
                        key={appointment._id}
                        type="button"
                        className={`workspace-item tone-${appointmentTone(appointment)} ${
                          activeAppointment?._id === appointment._id ? 'active' : ''
                        }`}
                        onClick={() => setSelectedAppointmentId(appointment._id)}
                      >
                        <div className="workspace-item-top">
                          <strong>
                            {appointment.patientId.firstName} {appointment.patientId.lastName}
                          </strong>
                          <span className={`mini-status mini-status-${appointment.status}`}>
                            {appointment.status}
                          </span>
                        </div>
                        <p>{formatDisplayDateTime(appointment.date, appointment.time)}</p>
                        <p>Reason: {appointment.reason}</p>
                      </button>
                    ))}
                  </div>
                  <div className="workspace-detail">
                    {activeAppointment && (
                      <>
                        <div className="detail-header">
                          <div>
                            <h3>
                              {activeAppointment.patientId.firstName} {activeAppointment.patientId.lastName}
                            </h3>
                            <p>{formatDisplayDateTime(activeAppointment.date, activeAppointment.time)}</p>
                          </div>
                          <div className="detail-header-actions">
                            <select
                              value={activeAppointment.status}
                              onChange={(e) => handleStatusChange(activeAppointment._id, e.target.value)}
                              className={`status-select status-${activeAppointment.status}`}
                            >
                              <option value="scheduled">Scheduled</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                            <button
                              className="btn btn-small btn-primary"
                              onClick={() => loadPatientHistory(activeAppointment.patientId._id)}
                            >
                              Open Clinical File
                            </button>
                          </div>
                        </div>
                        <div className="detail-grid">
                          <div className="detail-tile">
                            <label>Reason</label>
                            <p>{activeAppointment.reason}</p>
                          </div>
                          <div className="detail-tile">
                            <label>Symptoms</label>
                            <p>{activeAppointment.symptoms || 'Not provided'}</p>
                          </div>
                          <div className="detail-tile">
                            <label>Urgency</label>
                            <p>{activeAppointment.urgency || 'medium'}</p>
                          </div>
                          <div className="detail-tile">
                            <label>Patient Contact</label>
                            <p>{activeAppointment.patientId.email}</p>
                            <p>{activeAppointment.patientId.phone}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === 'patients' ? (
            <div className="patients-section">
              <h2>Your Patients</h2>
              <div className="form-group mb-2">
                <label>Search patient</label>
                <input
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  placeholder="Name or email"
                />
              </div>
              {patients.length === 0 ? (
                <EmptyState
                  title="No patients yet"
                  description="Patients are added when they book with you."
                />
              ) : (
                <div className="patients-grid">
                  {filteredPatients.map((patient) => (
                    <div key={patient._id} className="patient-card">
                      <div className="patient-avatar">
                        {patient.firstName[0]}
                        {patient.lastName[0]}
                      </div>
                      <div className="patient-details">
                        <h3>
                          {patient.firstName} {patient.lastName}
                        </h3>
                        <p className="patient-email">{patient.email}</p>
                        <p className="patient-phone">Phone: {patient.phone}</p>
                        <p className="patient-dob">Date of Birth: {new Date(patient.dateOfBirth).toLocaleDateString()}</p>
                        <p className="patient-dob">Clinical history linked to appointment records</p>
                      </div>
                      <div className="patient-actions">
                        <button
                          className="btn btn-small btn-primary"
                          onClick={() => loadPatientHistory(patient._id)}
                        >
                          View History
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="appointments-section">
              <h2>Schedule Calendar</h2>
              <div className="form-row mb-2">
                <button
                  type="button"
                  className="btn btn-outline btn-small"
                  onClick={() =>
                    setScheduleMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
                  }
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-small"
                  onClick={() =>
                    setScheduleMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
                  }
                >
                  Next
                </button>
              </div>

              <CalendarPicker
                title="Days with appointments (badge = count)"
                monthDate={scheduleMonthDate}
                availableDates={scheduleDates}
                selectedDate={selectedScheduleDate}
                dateBadges={scheduleBadges}
                onSelect={(key) => setSelectedScheduleDate(key)}
              />

              {selectedScheduleDate && (
                <div className="mt-3">
                  <h3>Appointments on {selectedScheduleDate}</h3>
                  {(scheduleByDate[selectedScheduleDate] || []).length === 0 ? (
                    <EmptyState
                      title="No appointments this day"
                      description="Pick another date on the calendar or wait for new bookings."
                      className="empty-state--inline"
                    />
                  ) : (
                    <div className="appointments-list">
                      {(scheduleByDate[selectedScheduleDate] || []).map((appt) => (
                        <div key={appt._id} className="patient-card">
                          <div className="patient-details">
                            <h3>{formatDisplayDateTime(appt.date, appt.time)}</h3>
                            <p>
                              Patient: {appt.patientId?.firstName} {appt.patientId?.lastName}
                            </p>
                            <p>Reason: {appt.reason}</p>
                            <p>Symptoms: {appt.symptoms || 'Not provided'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {selectedPatientHistory && (
          <div className="dashboard-content mt-3">
            <h2>
              Clinical File: {selectedPatientHistory.patient.firstName}{' '}
              {selectedPatientHistory.patient.lastName}
            </h2>
            <p className="text-secondary mb-2">
              Visits with you: {selectedPatientHistory.summary.totalVisitsWithDentist} | Latest diagnosis:{' '}
              {selectedPatientHistory.summary.latestDiagnosis || 'Not recorded'}
            </p>
            <div className="clinical-metrics">
              <div className="clinical-metric">
                <span>Total Visits</span>
                <strong>{selectedPatientHistory.summary.totalVisitsWithDentist}</strong>
              </div>
              <div className="clinical-metric">
                <span>Completed Treatments</span>
                <strong>{selectedPatientHistory.summary.completedTreatments || 0}</strong>
              </div>
              <div className="clinical-metric">
                <span>Active Medications</span>
                <strong>{selectedPatientHistory.summary.activeMedications?.length || 0}</strong>
              </div>
            </div>
            <div className="clinical-layout">
              <aside className="clinical-side">
                <div className="clinical-profile-card">
                  <h3>Medical Profile</h3>
                  <p>Blood Type: {selectedPatientHistory.patient.medicalProfile?.bloodType || 'Not set'}</p>
                  <p>
                    Allergies:{' '}
                    {(selectedPatientHistory.patient.medicalProfile?.allergies || []).join(', ') || 'None'}
                  </p>
                  <p>
                    Conditions:{' '}
                    {(selectedPatientHistory.patient.medicalProfile?.chronicConditions || []).join(', ') ||
                      'None'}
                  </p>
                  <p>
                    Medications:{' '}
                    {(selectedPatientHistory.patient.medicalProfile?.medications || []).join(', ') || 'None'}
                  </p>
                  <p>
                    Emergency Contact:{' '}
                    {selectedPatientHistory.patient.medicalProfile?.emergencyContactName || 'Not set'}{' '}
                    {selectedPatientHistory.patient.medicalProfile?.emergencyContactPhone || ''}
                  </p>
                </div>

                <div className="form-group mb-2">
                  <label>Search in history</label>
                  <input
                    value={clinicalSearch}
                    onChange={(e) => setClinicalSearch(e.target.value)}
                    placeholder="Diagnosis, reason, symptoms..."
                  />
                </div>
                <div className="form-group mb-2">
                  <label>Filter status</label>
                  <select
                    value={clinicalStatusFilter}
                    onChange={(e) => setClinicalStatusFilter(e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="clinical-visit-list">
                  {filteredClinicalHistory.map((item) => (
                    <button
                      type="button"
                      key={item._id}
                      className={`clinical-visit-item ${
                        activeClinicalEntry?._id === item._id ? 'active' : ''
                      }`}
                      onClick={() => setSelectedClinicalEntryId(item._id)}
                    >
                      <strong>{formatDisplayDateTime(item.date, item.time)}</strong>
                      <span>{item.reason}</span>
                      <span>Diagnosis: {item.diagnosis || 'Not recorded yet'}</span>
                      <small>Status: {item.status}</small>
                    </button>
                  ))}
                </div>
              </aside>

              <section className="clinical-main">
                {!activeClinicalEntry ? (
                  <p className="empty-state">No clinical entries match your filters.</p>
                ) : (
                  <div className="clinical-editor">
                    <div className="clinical-editor-head">
                      <h3>{formatDisplayDateTime(activeClinicalEntry.date, activeClinicalEntry.time)}</h3>
                      <p>Symptoms: {activeClinicalEntry.symptoms || 'Not provided'}</p>
                    </div>
                    <div className="clinical-form">
                      <div className="form-group">
                        <label>Diagnosis</label>
                        <input
                          value={noteForms[activeClinicalEntry._id]?.diagnosis ?? activeClinicalEntry.diagnosis ?? ''}
                          onChange={(e) =>
                            updateNoteField(activeClinicalEntry._id, 'diagnosis', e.target.value)
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label>Treatment Notes</label>
                        <textarea
                          rows="3"
                          value={
                            noteForms[activeClinicalEntry._id]?.treatmentNotes ??
                            activeClinicalEntry.treatmentNotes ??
                            ''
                          }
                          onChange={(e) =>
                            updateNoteField(activeClinicalEntry._id, 'treatmentNotes', e.target.value)
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label>Treatment Plan</label>
                        <textarea
                          rows="3"
                          value={
                            noteForms[activeClinicalEntry._id]?.treatmentPlan ??
                            activeClinicalEntry.treatmentPlan ??
                            ''
                          }
                          onChange={(e) =>
                            updateNoteField(activeClinicalEntry._id, 'treatmentPlan', e.target.value)
                          }
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Procedures (comma-separated)</label>
                          <input
                            value={
                              noteForms[activeClinicalEntry._id]?.procedures ??
                              (activeClinicalEntry.procedures || []).join(', ')
                            }
                            onChange={(e) =>
                              updateNoteField(activeClinicalEntry._id, 'procedures', e.target.value)
                            }
                          />
                        </div>
                        <div className="form-group">
                          <label>Prescribed Medications</label>
                          <input
                            value={
                              noteForms[activeClinicalEntry._id]?.prescribedMedications ??
                              (activeClinicalEntry.prescribedMedications || []).join(', ')
                            }
                            onChange={(e) =>
                              updateNoteField(activeClinicalEntry._id, 'prescribedMedications', e.target.value)
                            }
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Pain Level (0-10)</label>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={noteForms[activeClinicalEntry._id]?.painLevel ?? activeClinicalEntry.painLevel ?? ''}
                            onChange={(e) =>
                              updateNoteField(activeClinicalEntry._id, 'painLevel', e.target.value)
                            }
                          />
                        </div>
                        <div className="form-group">
                          <label>Follow-up Date</label>
                          <input
                            type="date"
                            value={
                              noteForms[activeClinicalEntry._id]?.followUpDate ??
                              (activeClinicalEntry.followUpDate ? activeClinicalEntry.followUpDate.slice(0, 10) : '')
                            }
                            onChange={(e) =>
                              updateNoteField(activeClinicalEntry._id, 'followUpDate', e.target.value)
                            }
                          />
                        </div>
                      </div>
                      <button
                        className="btn btn-primary"
                        type="button"
                        onClick={() => saveClinicalNote(activeClinicalEntry._id)}
                      >
                        Save Clinical Note
                      </button>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DentistDashboard
