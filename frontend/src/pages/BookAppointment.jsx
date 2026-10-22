import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import PageMeta from '../components/PageMeta'
import EmptyState from '../components/EmptyState'
import '../styles/BookAppointment.css'
import CalendarPicker from '../components/CalendarPicker'

const BookAppointment = () => {
  const navigate = useNavigate()
  const { auth } = useAuth()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [dentists, setDentists] = useState([])
  const [loadingDentists, setLoadingDentists] = useState(true)
  const [availability, setAvailability] = useState(null)
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [monthDate, setMonthDate] = useState(() => new Date())

  const reasons = [
    'Regular Checkup',
    'Cleaning',
    'Filling',
    'Root Canal',
    'Extraction',
    'Teeth Whitening',
    'Braces Adjustment',
    'Other',
  ]

  const [formData, setFormData] = useState({
    dentistId: '',
    date: '',
    time: '',
    reason: '',
    symptoms: '',
    urgency: 'medium',
  })

  useEffect(() => {
    const fetchDentists = async () => {
      try {
        const response = await axios.get('/api/dentist/list')
        setDentists(response.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dentist directory')
      } finally {
        setLoadingDentists(false)
      }
    }

    fetchDentists()
  }, [])

  const availabilityAnchor = useMemo(() => {
    const y = monthDate.getFullYear()
    const m = String(monthDate.getMonth() + 1).padStart(2, '0')
    return `${y}-${m}-01`
  }, [monthDate])

  const reloadAvailability = useCallback(async () => {
    if (!formData.dentistId) {
      setAvailability(null)
      return
    }

    try {
      setLoadingAvailability(true)
      const days = 75
      const response = await axios.get(
        `/api/appointments/availability/${formData.dentistId}?days=${days}&anchor=${availabilityAnchor}`
      )
      setAvailability(response.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load availability')
      setAvailability(null)
    } finally {
      setLoadingAvailability(false)
    }
  }, [formData.dentistId, availabilityAnchor])

  useEffect(() => {
    reloadAvailability()
  }, [reloadAvailability])

  const selectedDentist = useMemo(
    () => dentists.find((dentist) => dentist._id === formData.dentistId),
    [dentists, formData.dentistId]
  )

  const selectedDateAvailability = useMemo(
    () => availability?.calendar?.find((item) => item.date === formData.date),
    [availability, formData.date]
  )

  const dateBadges = useMemo(() => {
    const badges = {}
    ;(availability?.calendar || []).forEach((d) => {
      if (!d?.date) return
      if (d.isFullyBooked) return
      const count = d.availableSlots?.length || 0
      badges[d.date] = { text: String(count), variant: 'primary' }
    })
    return badges
  }, [availability])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'dentistId' ? { date: '', time: '' } : {}),
      ...(name === 'date' ? { time: '' } : {}),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await axios.post(
        '/api/appointments',
        {
          dentistId: formData.dentistId,
          date: formData.date,
          time: formData.time,
          reason: formData.reason,
          symptoms: formData.symptoms,
          urgency: formData.urgency,
        },
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      )

      setLoading(false)
      navigate('/patient-workspace')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment')
      setLoading(false)
    }
  }

  return (
    <div className="book-appointment-container">
      <PageMeta title="Book a visit" description="Choose a dentist and an available time for your appointment." />
      <div className="container">
        <div className="book-header">
          <h1>Book an Appointment</h1>
          <p>Schedule your visit with one of our experienced dentists</p>
        </div>

        <div className="book-content">
          {!loadingDentists && dentists.length === 0 ? (
            <EmptyState
              title="No dentists available"
              description="The clinic has not published any providers yet. Please try again later or contact the front desk."
            />
          ) : (
            <>
          <form onSubmit={handleSubmit} className="booking-form">
            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-group">
              <label htmlFor="dentist">Select Dentist *</label>
              <select
                id="dentist"
                name="dentistId"
                value={formData.dentistId}
                onChange={handleChange}
                required
                disabled={loadingDentists}
              >
                <option value="">-- Choose a dentist --</option>
                {dentists.map((dentist) => (
                  <option key={dentist._id} value={dentist._id}>
                    {dentist.fullName} - {dentist.specialty}
                  </option>
                ))}
              </select>
            </div>

            {selectedDentist && (
              <div className="booking-info">
                <h3>Selected Dentist</h3>
                <ul>
                  <li>Clinic: {selectedDentist.clinicName}</li>
                  <li>Experience: {selectedDentist.experienceYears || 1} years</li>
                  <li>Current focus: {selectedDentist.currentFocus || 'Consultations'}</li>
                  <li>Status now: {selectedDentist.currentStatus?.replace('_', ' ') || 'available'}</li>
                  <li>
                    Available days in calendar: {availability?.availableDates?.length || 0}
                    {loadingAvailability ? ' (loading...)' : ''}
                  </li>
                </ul>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">Appointment Date *</label>
                <div style={{ opacity: !formData.dentistId ? 0.7 : 1 }}>
                  <CalendarPicker
                    title={
                      !formData.dentistId
                        ? 'Select a dentist first'
                        : loadingAvailability
                        ? 'Loading availability…'
                        : 'Pick an available day (badge = free slots)'
                    }
                    monthDate={monthDate}
                    availableDates={availability?.availableDates || []}
                    selectedDate={formData.date}
                    dateBadges={dateBadges}
                    onSelect={(dateKey) =>
                      setFormData((prev) => ({ ...prev, date: dateKey, time: '' }))
                    }
                  />
                  <div className="form-row" style={{ marginTop: '0.75rem' }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-small"
                      onClick={() =>
                        setMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
                      }
                      disabled={!formData.dentistId}
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-small"
                      onClick={() =>
                        setMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
                      }
                      disabled={!formData.dentistId}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="time">Time Slot *</label>
                <select
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  disabled={!formData.date}
                >
                  <option value="">
                    {formData.date ? '-- Select available time --' : 'Select a date first'}
                  </option>
                  {(selectedDateAvailability?.availableSlots || []).map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reason">Reason for Visit *</label>
              <select
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                required
              >
                <option value="">-- Select reason --</option>
                {reasons.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="urgency">Urgency</label>
                <select
                  id="urgency"
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="symptoms">Current Symptoms</label>
                <input
                  type="text"
                  id="symptoms"
                  name="symptoms"
                  value={formData.symptoms}
                  onChange={handleChange}
                  placeholder="Pain, swelling, sensitivity..."
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Booking...' : 'Book Appointment'}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate('/patient-workspace')}
              >
                Cancel
              </button>
            </div>
          </form>

          <div className="booking-info">
            <h3>Booking Information</h3>
            <ul>
              <li>Appointments are available up to 60 days in advance.</li>
              <li>Only available days and time slots are selectable.</li>
              <li>Confirmation appears in your patient dashboard immediately.</li>
              <li>Reschedule or cancel from your profile timeline.</li>
              <li>Support: hello@dentalclinic.com</li>
            </ul>
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default BookAppointment
