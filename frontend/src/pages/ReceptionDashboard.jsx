import React, { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import CalendarPicker from '../components/CalendarPicker'
import { formatCalendarAgendaParts } from '../utils/date'
import '../styles/ReceptionDashboard.css'

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

const PANELS = [
  {
    id: 'lobby',
    title: "Today's lobby",
    hint: 'Arrivals and desk status for today',
  },
  {
    id: 'pipeline',
    title: 'Booking pipeline',
    hint: 'Scheduled visits from tomorrow onward',
  },
  {
    id: 'concierge',
    title: 'Concierge booking',
    hint: 'Find a patient and book an available slot',
  },
]

const deskTone = {
  expected: 'neutral',
  confirmed: 'info',
  checked_in: 'success',
  no_show: 'warn',
}

const FILTER_ANY = 'all'

function urgencyKey(u) {
  if (u === 'low' || u === 'high' || u === 'medium') return u
  return 'medium'
}

function DeskPill({ status }) {
  const s = status || 'expected'
  const label = (s || '').replace(/_/g, ' ')
  return (
    <span className={`reception-pill reception-pill--${deskTone[s] || 'neutral'}`}>
      {label}
    </span>
  )
}

function DeskStatusSelect({ appointmentId, value, disabled, onChange, compact }) {
  const v = value || 'expected'
  return (
    <select
      className={`reception-desk-select ${compact ? 'reception-desk-select--compact' : ''}`}
      aria-label="Lobby desk status"
      value={v}
      disabled={disabled}
      onChange={(e) => onChange(appointmentId, e.target.value)}
    >
      <option value="expected">Expected</option>
      <option value="confirmed">Confirmed</option>
      <option value="checked_in">Checked in</option>
      <option value="no_show">No-show</option>
    </select>
  )
}

function AgendaDayHeader({ date, today, compact }) {
  const p = formatCalendarAgendaParts(date)
  if (!p) return null
  return (
    <div
      className={`reception-agenda-day__header ${today ? 'reception-agenda-day__header--today' : ''} ${
        compact ? 'reception-agenda-day__header--compact' : ''
      }`}
    >
      <div className="reception-agenda-day__tile" aria-hidden="true">
        <span className="reception-agenda-day__dow">{p.dowShort}</span>
        <span className="reception-agenda-day__dom">{p.dayNum}</span>
        <span className="reception-agenda-day__mon">{p.monthShort}</span>
      </div>
      <div className="reception-agenda-day__meta">
        <div className="reception-agenda-day__titles">
          <span className="reception-agenda-day__weekday">{p.dowLong}</span>
          <span className="reception-agenda-day__fulldate">{p.monthYear}</span>
        </div>
        {today ? <span className="reception-agenda-day__tag">Today</span> : null}
      </div>
    </div>
  )
}

function LobbyScheduleTable({
  appointments,
  onDeskChange,
  onEdit,
  onCancel,
  dense = false,
  deskLayout = 'full',
  tone = 'default',
}) {
  const deskCompactOnly = deskLayout === 'compact'
  const wrapClass = [
    'reception-table-wrap',
    dense && 'reception-table-wrap--dense',
    tone === 'lobby' && 'reception-table-wrap--lobby',
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <div className={wrapClass}>
      <table className={`reception-data-table ${tone === 'lobby' ? 'reception-data-table--lobby' : ''}`}>
        <thead>
          <tr>
            <th scope="col">Time</th>
            <th scope="col">Patient</th>
            <th scope="col">Contact</th>
            <th scope="col">Clinician</th>
            <th scope="col">Visit</th>
            <th scope="col">Urgency</th>
            <th scope="col">Desk status</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((apt) => {
            const patient = apt.patientId
            const dentist = apt.dentistId
            const name = patient ? `${patient.firstName} ${patient.lastName}` : '—'
            const locked = apt.status !== 'scheduled'
            const phone = patient?.phone
            const email = patient?.email
            const doc = dentist?.fullName || apt.dentist || '—'
            const urg = apt.urgency ? apt.urgency.charAt(0).toUpperCase() + apt.urgency.slice(1) : '—'
            const uk = urgencyKey(apt.urgency)

            return (
              <tr
                key={apt._id}
                className={`${locked ? 'reception-data-table__row--locked' : ''} reception-data-table__row--urgency-${uk}`.trim()}
              >
                <td className="reception-data-table__time">{apt.time}</td>
                <td className="reception-data-table__strong">{name}</td>
                <td className="reception-data-table__contact">
                  {phone ? <span className="reception-contact-line">{phone}</span> : null}
                  {email ? (
                    <span className="reception-contact-line reception-contact-line--muted">{email}</span>
                  ) : null}
                  {!phone && !email ? <span className="reception-muted-inline">—</span> : null}
                </td>
                <td>{doc}</td>
                <td className="reception-data-table__visit">
                  <span className="reception-table-primary">{apt.reason || '—'}</span>
                  {apt.symptoms ? (
                    <span className="reception-table-sub">{apt.symptoms}</span>
                  ) : null}
                </td>
                <td>
                  <span className={`reception-urgency reception-urgency--${uk}`}>{urg}</span>
                </td>
                <td className="reception-data-table__desk">
                  <div
                    className={`reception-table-desk-cell ${
                      deskCompactOnly ? 'reception-table-desk-cell--compact-only' : ''
                    }`}
                  >
                    {!deskCompactOnly ? <DeskPill status={apt.deskStatus} /> : null}
                    <DeskStatusSelect
                      appointmentId={apt._id}
                      value={apt.deskStatus}
                      disabled={locked}
                      onChange={onDeskChange}
                      compact={dense || deskCompactOnly}
                    />
                  </div>
                </td>
                <td className="reception-data-table__actions">
                  <div className="reception-row-actions">
                    <button type="button" className="btn btn-outline btn-small" onClick={() => onEdit(apt)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-small"
                      disabled={locked}
                      onClick={() => onCancel(apt)}
                    >
                      Cancel
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/** Pipeline: table-like rows (CSS grid) with urgency color accents — easier to scan than a cramped table. */
function PipelineScheduleGrid({ appointments, onDeskChange, onEdit, onCancel }) {
  return (
    <div className="reception-pipeline-grid" role="list" aria-label="Upcoming visits">
      {appointments.map((apt) => {
        const patient = apt.patientId
        const dentist = apt.dentistId
        const name = patient ? `${patient.firstName} ${patient.lastName}` : '—'
        const doc = dentist?.fullName || apt.dentist || '—'
        const locked = apt.status !== 'scheduled'
        const uk = urgencyKey(apt.urgency)
        const urg = apt.urgency ? apt.urgency.charAt(0).toUpperCase() + apt.urgency.slice(1) : '—'

        return (
          <div
            key={apt._id}
            role="listitem"
            className={`reception-pipeline-card reception-pipeline-card--urgency-${uk} ${
              locked ? 'reception-pipeline-card--locked' : ''
            }`.trim()}
          >
            <div className="reception-pipeline-card__time">{apt.time}</div>
            <div className="reception-pipeline-card__body">
              <span className="reception-pipeline-card__name">{name}</span>
              <span className="reception-pipeline-card__doc">{doc}</span>
              {apt.reason ? (
                <span className="reception-pipeline-card__reason">{apt.reason}</span>
              ) : null}
              {apt.symptoms ? (
                <span className="reception-pipeline-card__symptoms">{apt.symptoms}</span>
              ) : null}
            </div>
            <div className="reception-pipeline-card__urgency">
              <span className={`reception-urgency reception-urgency--${uk}`}>{urg}</span>
            </div>
            <div className="reception-pipeline-card__desk">
              <DeskStatusSelect
                appointmentId={apt._id}
                value={apt.deskStatus}
                disabled={locked}
                onChange={onDeskChange}
                compact
              />
            </div>
            <div className="reception-pipeline-card__actions">
              <button type="button" className="btn btn-outline btn-small" onClick={() => onEdit(apt)}>
                Edit
              </button>
              <button
                type="button"
                className="btn btn-outline btn-small"
                disabled={locked}
                onClick={() => onCancel(apt)}
              >
                Cancel
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

const ReceptionDashboard = () => {
  const { auth } = useAuth()
  const { toastSuccess, toastError } = useToast()
  const authHeader = useMemo(
    () => ({ headers: { Authorization: `Bearer ${auth.token}` } }),
    [auth.token]
  )

  const [overview, setOverview] = useState(null)
  const [loadingOverview, setLoadingOverview] = useState(true)

  const [dentists, setDentists] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [availability, setAvailability] = useState(null)
  const [loadingAvail, setLoadingAvail] = useState(false)
  const [monthDate, setMonthDate] = useState(() => new Date())
  const [booking, setBooking] = useState(false)

  const [bookForm, setBookForm] = useState({
    dentistId: '',
    date: '',
    time: '',
    reason: '',
    symptoms: '',
    urgency: 'medium',
  })

  const [activePanel, setActivePanel] = useState('lobby')
  const [urgencyFilter, setUrgencyFilter] = useState(FILTER_ANY)
  const [deskFilter, setDeskFilter] = useState(FILTER_ANY)
  const [agendaMonthDate, setAgendaMonthDate] = useState(() => new Date())
  const [selectedAgendaDate, setSelectedAgendaDate] = useState(() => {
    const d = new Date()
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  })
  const [editingApt, setEditingApt] = useState(null)
  const [savingEdit, setSavingEdit] = useState(false)
  const [editForm, setEditForm] = useState({
    dentistId: '',
    date: '',
    time: '',
    reason: '',
    urgency: 'medium',
    symptoms: '',
  })

  const refreshOverview = useCallback(async () => {
    setLoadingOverview(true)
    try {
      const { data } = await axios.get('/api/reception/overview', authHeader)
      setOverview(data)
    } catch {
      setOverview(null)
    } finally {
      setLoadingOverview(false)
    }
  }, [authHeader])

  useEffect(() => {
    refreshOverview()
  }, [refreshOverview])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await axios.get('/api/dentist/list')
        if (!cancelled) setDentists(data || [])
      } catch {
        if (!cancelled) setDentists([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const availabilityAnchor = useMemo(() => {
    const y = monthDate.getFullYear()
    const m = String(monthDate.getMonth() + 1).padStart(2, '0')
    return `${y}-${m}-01`
  }, [monthDate])

  const reloadAvailability = useCallback(async () => {
    if (!bookForm.dentistId) {
      setAvailability(null)
      return
    }
    setLoadingAvail(true)
    try {
      const days = 75
      const res = await axios.get(
        `/api/appointments/availability/${bookForm.dentistId}?days=${days}&anchor=${availabilityAnchor}`
      )
      setAvailability(res.data)
    } catch {
      setAvailability(null)
    } finally {
      setLoadingAvail(false)
    }
  }, [bookForm.dentistId, availabilityAnchor])

  useEffect(() => {
    reloadAvailability()
  }, [reloadAvailability])

  const selectedDateAvail = useMemo(
    () => availability?.calendar?.find((d) => d.date === bookForm.date),
    [availability, bookForm.date]
  )

  const dateBadges = useMemo(() => {
    const badges = {}
    ;(availability?.calendar || []).forEach((d) => {
      if (!d?.date || d.isFullyBooked) return
      const count = d.availableSlots?.length || 0
      badges[d.date] = { text: String(count), variant: 'primary' }
    })
    return badges
  }, [availability])

  const handleDeskChange = async (appointmentId, nextStatus) => {
    try {
      await axios.patch(
        `/api/reception/appointments/${appointmentId}/desk`,
        { deskStatus: nextStatus },
        authHeader
      )
      await refreshOverview()
    } catch {
      await refreshOverview()
    }
  }

  const handleCancelAppointment = async (apt) => {
    if (!apt?._id) return
    if (!window.confirm('Cancel this appointment?')) return
    try {
      await axios.put(`/api/reception/appointments/${apt._id}/cancel`, {}, authHeader)
      toastSuccess('Appointment cancelled.')
      await Promise.all([reloadAvailability(), refreshOverview()])
    } catch (err) {
      toastError(err.response?.data?.message || 'Could not cancel appointment.')
    }
  }

  const openEditModal = (apt) => {
    if (!apt?._id) return
    setEditingApt(apt)
    setEditForm({
      dentistId: apt?.dentistId?._id || '',
      date: apt.date ? new Date(apt.date).toISOString().slice(0, 10) : '',
      time: apt.time || '',
      reason: apt.reason || '',
      urgency: apt.urgency || 'medium',
      symptoms: apt.symptoms || '',
    })
  }

  const closeEditModal = () => {
    if (savingEdit) return
    setEditingApt(null)
  }

  const handleEditSave = async (e) => {
    e.preventDefault()
    if (!editingApt?._id) return
    setSavingEdit(true)
    try {
      await axios.put(
        `/api/reception/appointments/${editingApt._id}`,
        {
          dentistId: editForm.dentistId,
          date: editForm.date.trim(),
          time: editForm.time.trim(),
          reason: editForm.reason.trim(),
          urgency: editForm.urgency.trim().toLowerCase(),
          symptoms: editForm.symptoms.trim(),
        },
        authHeader
      )
      toastSuccess('Appointment updated.')
      await Promise.all([reloadAvailability(), refreshOverview()])
      setEditingApt(null)
    } catch (err) {
      toastError(err.response?.data?.message || 'Could not update appointment.')
    } finally {
      setSavingEdit(false)
    }
  }

  const runSearch = async () => {
    const q = searchQuery.trim()
    if (q.length < 2) {
      setSearchResults([])
      return
    }
    try {
      const { data } = await axios.get(
        `/api/reception/patients?q=${encodeURIComponent(q)}`,
        authHeader
      )
      setSearchResults(Array.isArray(data) ? data : [])
    } catch {
      setSearchResults([])
      toastError('Patient search failed.')
    }
  }

  const handleBook = async (e) => {
    e.preventDefault()
    if (!selectedPatient?._id) {
      toastError('Select a patient from search.')
      return
    }
    setBooking(true)
    try {
      await axios.post(
        '/api/reception/appointments',
        {
          patientId: selectedPatient._id,
          dentistId: bookForm.dentistId,
          date: bookForm.date,
          time: bookForm.time,
          reason: bookForm.reason,
          symptoms: bookForm.symptoms,
          urgency: bookForm.urgency,
        },
        authHeader
      )
      toastSuccess(`Booked ${selectedPatient.firstName} ${selectedPatient.lastName}.`)
      setBookForm((p) => ({ ...p, date: '', time: '', symptoms: '' }))
      await Promise.all([reloadAvailability(), refreshOverview()])
    } catch (err) {
      toastError(err.response?.data?.message || 'Could not book this slot.')
    } finally {
      setBooking(false)
    }
  }

  const kpis = overview?.kpis
  const lobby = overview?.lobby || []
  const pipeline = overview?.pipeline || []
  const lobbyDayDate = lobby[0]?.date || new Date()
  const clinicLine = overview?.clinicTagline
  const staffName = auth.user?.firstName || 'Coordinator'
  const applyReceptionFilters = useCallback(
    (items) =>
      items.filter((apt) => {
        const aptUrgency = urgencyKey(apt.urgency)
        const aptDesk = apt.deskStatus || 'expected'
        const urgencyOk = urgencyFilter === FILTER_ANY || aptUrgency === urgencyFilter
        const deskOk = deskFilter === FILTER_ANY || aptDesk === deskFilter
        return urgencyOk && deskOk
      }),
    [urgencyFilter, deskFilter]
  )

  const filteredLobby = useMemo(() => applyReceptionFilters(lobby), [lobby, applyReceptionFilters])
  const allAgendaVisits = useMemo(() => [...lobby, ...pipeline], [lobby, pipeline])

  const agendaAvailableDates = useMemo(() => {
    const set = new Set()
    for (const apt of allAgendaVisits) {
      if (!apt?.date) continue
      const key = new Date(apt.date).toISOString().slice(0, 10)
      set.add(key)
    }
    return [...set].sort()
  }, [allAgendaVisits])

  const agendaDateBadges = useMemo(() => {
    const badges = {}
    for (const key of agendaAvailableDates) {
      const count = allAgendaVisits.filter((apt) => new Date(apt.date).toISOString().slice(0, 10) === key).length
      badges[key] = { text: String(count), variant: 'primary' }
    }
    return badges
  }, [agendaAvailableDates, allAgendaVisits])

  useEffect(() => {
    if (!agendaAvailableDates.length) return
    if (!agendaAvailableDates.includes(selectedAgendaDate)) {
      setSelectedAgendaDate(agendaAvailableDates[0])
    }
  }, [agendaAvailableDates, selectedAgendaDate])

  const selectedAgendaVisits = useMemo(() => {
    return allAgendaVisits
      .filter((apt) => new Date(apt.date).toISOString().slice(0, 10) === selectedAgendaDate)
      .filter((apt) => {
        const aptUrgency = urgencyKey(apt.urgency)
        const aptDesk = apt.deskStatus || 'expected'
        const urgencyOk = urgencyFilter === FILTER_ANY || aptUrgency === urgencyFilter
        const deskOk = deskFilter === FILTER_ANY || aptDesk === deskFilter
        return urgencyOk && deskOk
      })
      .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
  }, [allAgendaVisits, selectedAgendaDate, urgencyFilter, deskFilter])

  const selectedAgendaDateValue = useMemo(() => {
    if (!selectedAgendaDate) return new Date()
    return new Date(`${selectedAgendaDate}T12:00:00`)
  }, [selectedAgendaDate])

  return (
    <div className="reception-dashboard">
      <div className="container reception-dashboard__wrap">
        <header className="reception-page-header">
          <div className="reception-page-header__main">
            <p className="reception-eyebrow">Practice operations</p>
            <h1>Reception console</h1>
            <p className="reception-page-header__lead">{clinicLine || 'Front desk coordination'}</p>
            <p className="reception-page-header__greeting">
              Good day, <strong>{staffName}</strong> · Choose a tab below to manage today&apos;s lobby, the booking
              pipeline, or concierge reservations.
            </p>
          </div>
          <div className="reception-page-header__kpis">
            <div className="reception-kpi">
              <span className="reception-kpi__value">{kpis?.lobbyToday ?? '—'}</span>
              <span className="reception-kpi__label">Today&apos;s lobby</span>
            </div>
            <div className="reception-kpi">
              <span className="reception-kpi__value">{kpis?.pipelineUpcoming ?? '—'}</span>
              <span className="reception-kpi__label">Upcoming pipeline</span>
            </div>
          </div>
        </header>

        <div className="reception-tab-shell" role="tablist" aria-label="Reception sections">
          <div className="reception-tab-row">
            {PANELS.map((p) => {
              const isActive = activePanel === p.id
              const countBadge =
                p.id === 'lobby'
                  ? kpis?.lobbyToday
                  : p.id === 'pipeline'
                  ? kpis?.pipelineUpcoming
                  : null
              return (
                <button
                  key={p.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  id={`reception-tab-${p.id}`}
                  className={`reception-tab ${isActive ? 'reception-tab--active' : ''}`}
                  onClick={() => setActivePanel(p.id)}
                >
                  <span className="reception-tab__title">{p.title}</span>
                  <span className="reception-tab__hint">{p.hint}</span>
                  {countBadge != null ? (
                    <span className="reception-tab__badge">{countBadge}</span>
                  ) : null}
                </button>
              )
            })}
          </div>

          <div
            role="tabpanel"
            aria-labelledby={`reception-tab-${activePanel}`}
            className="reception-panel-stage reception-scroll"
          >
            {activePanel === 'lobby' && (
              <div className="reception-panel-inner reception-panel-inner--lobby">
                <div className="reception-panel-intro">
                  <h2 className="reception-panel-h2">Today&apos;s lobby</h2>
                  <p className="reception-panel-lead">
                    Full-day schedule — scan time, patient, contact, clinician, and desk status in one view.
                  </p>
                </div>
                {loadingOverview ? (
                  <p className="reception-muted">Loading lobby…</p>
                ) : lobby.length === 0 ? (
                  <p className="reception-muted reception-prose">
                    No visits scheduled for today. Same-day appointments will appear in the table below.
                  </p>
                ) : (
                  <div className="reception-lobby-layout">
                    <section className="reception-agenda-day reception-agenda-day--with-table">
                      <AgendaDayHeader date={lobbyDayDate} today />
                      <div className="reception-filter-row">
                        <div className="form-group">
                          <label>Urgency</label>
                          <select value={urgencyFilter} onChange={(e) => setUrgencyFilter(e.target.value)}>
                            <option value={FILTER_ANY}>All</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Desk status</label>
                          <select value={deskFilter} onChange={(e) => setDeskFilter(e.target.value)}>
                            <option value={FILTER_ANY}>All</option>
                            <option value="expected">Expected</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="checked_in">Checked in</option>
                            <option value="no_show">No-show</option>
                          </select>
                        </div>
                      </div>
                      {filteredLobby.length === 0 ? (
                        <p className="reception-muted reception-prose" style={{ padding: '0.6rem 1rem 1rem' }}>
                          No visits match current filters for today.
                        </p>
                      ) : (
                        <LobbyScheduleTable
                          appointments={filteredLobby}
                          onDeskChange={handleDeskChange}
                          onEdit={openEditModal}
                          onCancel={handleCancelAppointment}
                          tone="lobby"
                        />
                      )}
                    </section>
                  </div>
                )}
              </div>
            )}

            {activePanel === 'pipeline' && (
              <div className="reception-panel-inner reception-panel-inner--pipeline">
                <div className="reception-panel-intro">
                  <h2 className="reception-panel-h2">Booking pipeline</h2>
                  <p className="reception-panel-lead">
                    Pick any day from the calendar to instantly view appointments for that date.
                  </p>
                </div>
                {loadingOverview ? (
                  <p className="reception-muted">Loading pipeline…</p>
                ) : allAgendaVisits.length === 0 ? (
                  <p className="reception-muted reception-prose">
                    Once patients book online or through concierge, they appear here grouped by day with times in order.
                  </p>
                ) : (
                  <>
                    <div className="reception-pipeline-calendar-block">
                      <CalendarPicker
                        title="Calendar appointments"
                        monthDate={agendaMonthDate}
                        availableDates={agendaAvailableDates}
                        selectedDate={selectedAgendaDate}
                        dateBadges={agendaDateBadges}
                        onSelect={(d) => setSelectedAgendaDate(d)}
                      />
                      <div className="reception-month-nav">
                        <button
                          type="button"
                          className="btn btn-outline btn-small"
                          onClick={() =>
                            setAgendaMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
                          }
                        >
                          Prev
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-small"
                          onClick={() =>
                            setAgendaMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
                          }
                        >
                          Next
                        </button>
                      </div>
                    </div>

                    <section className="reception-pipeline-day reception-pipeline-day--cards">
                      <AgendaDayHeader
                        date={selectedAgendaDateValue}
                        today={selectedAgendaDate === new Date().toISOString().slice(0, 10)}
                        compact
                      />
                      <div className="reception-filter-row reception-filter-row--in-card">
                        <div className="form-group">
                          <label>Urgency</label>
                          <select value={urgencyFilter} onChange={(e) => setUrgencyFilter(e.target.value)}>
                            <option value={FILTER_ANY}>All</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Desk status</label>
                          <select value={deskFilter} onChange={(e) => setDeskFilter(e.target.value)}>
                            <option value={FILTER_ANY}>All</option>
                            <option value="expected">Expected</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="checked_in">Checked in</option>
                            <option value="no_show">No-show</option>
                          </select>
                        </div>
                      </div>
                      {selectedAgendaVisits.length ? (
                        <PipelineScheduleGrid
                          appointments={selectedAgendaVisits}
                          onDeskChange={handleDeskChange}
                          onEdit={openEditModal}
                          onCancel={handleCancelAppointment}
                        />
                      ) : (
                        <p className="reception-muted reception-prose" style={{ padding: '0.85rem 1rem 1rem' }}>
                          No appointments on this day.
                        </p>
                      )}
                    </section>
                  </>
                )}
              </div>
            )}

            {activePanel === 'concierge' && (
              <div className="reception-panel-inner reception-panel-inner--concierge">
                <div className="reception-panel-intro">
                  <h2 className="reception-panel-h2">Concierge booking</h2>
                  <p className="reception-panel-lead">
                    Search for a patient, choose a dentist, then pick a time that is still available.
                  </p>
                </div>

                <div className="reception-concierge-block">
                  <label className="reception-label">Find patient</label>
                  <div className="reception-search-row">
                    <input
                      type="search"
                      className="reception-input"
                      placeholder="Email or name (min 2 characters)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === 'Enter' && (e.preventDefault(), runSearch())
                      }
                    />
                    <button type="button" className="btn btn-primary" onClick={runSearch}>
                      Search
                    </button>
                  </div>
                  {searchResults.length > 0 && (
                    <ul className="reception-search-results">
                      {searchResults.map((p) => (
                        <li key={p._id}>
                          <button
                            type="button"
                            className={
                              selectedPatient?._id === p._id
                                ? 'reception-patient-btn reception-patient-btn--active'
                                : 'reception-patient-btn'
                            }
                            onClick={() => setSelectedPatient(p)}
                          >
                            <strong>
                              {p.firstName} {p.lastName}
                            </strong>
                            <span>{p.email}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

              <form onSubmit={handleBook} className="reception-book-form">
                <div className="form-group">
                  <label htmlFor="recv-dentist">Dentist</label>
                  <select
                    id="recv-dentist"
                    value={bookForm.dentistId}
                    onChange={(e) =>
                      setBookForm((prev) => ({
                        ...prev,
                        dentistId: e.target.value,
                        date: '',
                        time: '',
                      }))
                    }
                    required
                  >
                    <option value="">— Choose dentist —</option>
                    {dentists.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.fullName} · {d.specialty}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="reception-calendar-wrap">
                  <CalendarPicker
                    title={
                      !bookForm.dentistId
                        ? 'Select a dentist first'
                        : loadingAvail
                        ? 'Loading availability…'
                        : 'Pick an available day'
                    }
                    monthDate={monthDate}
                    availableDates={availability?.availableDates || []}
                    selectedDate={bookForm.date}
                    dateBadges={dateBadges}
                    onSelect={(dateKey) =>
                      setBookForm((prev) => ({ ...prev, date: dateKey, time: '' }))
                    }
                  />
                  <div className="reception-month-nav">
                    <button
                      type="button"
                      className="btn btn-outline btn-small"
                      onClick={() =>
                        setMonthDate((prev) =>
                          new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
                        )
                      }
                      disabled={!bookForm.dentistId}
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-small"
                      onClick={() =>
                        setMonthDate((prev) =>
                          new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
                        )
                      }
                      disabled={!bookForm.dentistId}
                    >
                      Next
                    </button>
                  </div>
                </div>

                <div className="form-row reception-form-row-tight">
                  <div className="form-group">
                    <label htmlFor="recv-time">Time</label>
                    <select
                      id="recv-time"
                      value={bookForm.time}
                      onChange={(e) => setBookForm((p) => ({ ...p, time: e.target.value }))}
                      required
                      disabled={!bookForm.date}
                    >
                      <option value="">
                        {bookForm.date ? '— Available times —' : 'Choose a date first'}
                      </option>
                      {(selectedDateAvail?.availableSlots || []).map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="recv-reason">Reason</label>
                    <select
                      id="recv-reason"
                      value={bookForm.reason}
                      onChange={(e) => setBookForm((p) => ({ ...p, reason: e.target.value }))}
                      required
                    >
                      <option value="">— Select —</option>
                      {reasons.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row reception-form-row-tight">
                  <div className="form-group">
                    <label htmlFor="recv-urgency">Urgency</label>
                    <select
                      id="recv-urgency"
                      value={bookForm.urgency}
                      onChange={(e) => setBookForm((p) => ({ ...p, urgency: e.target.value }))}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="recv-symptoms">Symptoms</label>
                    <input
                      id="recv-symptoms"
                      type="text"
                      value={bookForm.symptoms}
                      onChange={(e) => setBookForm((p) => ({ ...p, symptoms: e.target.value }))}
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary reception-book-submit"
                  disabled={booking || !selectedPatient}
                >
                  {booking ? 'Booking…' : 'Confirm booking'}
                </button>
              </form>
              </div>
            )}
          </div>
        </div>
      </div>
      {editingApt ? (
        <div className="reception-modal-backdrop" onClick={closeEditModal}>
          <div className="reception-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit appointment</h3>
            <form onSubmit={handleEditSave} className="reception-edit-form">
              <div className="form-group">
                <label>Dentist</label>
                <select
                  value={editForm.dentistId}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, dentistId: e.target.value }))}
                  required
                >
                  <option value="">— Choose dentist —</option>
                  {dentists.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.fullName} · {d.specialty}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row reception-form-row-tight">
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <input
                    type="time"
                    value={editForm.time}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, time: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="form-row reception-form-row-tight">
                <div className="form-group">
                  <label>Reason</label>
                  <select
                    value={editForm.reason}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, reason: e.target.value }))}
                    required
                  >
                    <option value="">— Select —</option>
                    {reasons.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Urgency</label>
                  <select
                    value={editForm.urgency}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, urgency: e.target.value }))}
                    required
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Symptoms</label>
                <input
                  type="text"
                  value={editForm.symptoms}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, symptoms: e.target.value }))}
                  placeholder="Optional"
                />
              </div>
              <div className="reception-edit-actions">
                <button type="button" className="btn btn-outline" onClick={closeEditModal} disabled={savingEdit}>
                  Close
                </button>
                <button type="submit" className="btn btn-primary" disabled={savingEdit}>
                  {savingEdit ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default ReceptionDashboard
