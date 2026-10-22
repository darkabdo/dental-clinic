import React, { useState } from 'react'
import '../styles/AppointmentCard.css'
import { formatDisplayDateTime } from '../utils/date'

const AppointmentCard = ({ appointment, onDelete }) => {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const dentistName = appointment.dentistId?.fullName || appointment.dentist
  const specialty = appointment.dentistId?.specialty || 'Dental Care'

  const statusColors = {
    scheduled: '#10b981',
    completed: '#6b7280',
    cancelled: '#ef4444',
  }

  return (
    <div className="appointment-card">
      <div className="appointment-header">
        <div>
          <h3 className="appointment-dentist">{dentistName}</h3>
          <p className="appointment-date">{formatDisplayDateTime(appointment.date, appointment.time)}</p>
          <p className="appointment-date">{specialty}</p>
        </div>
        <span
          className="appointment-status"
          style={{ backgroundColor: statusColors[appointment.status] }}
        >
          {appointment.status}
        </span>
      </div>

      <div className="appointment-body">
        <p className="appointment-reason">
          <strong>Reason:</strong> {appointment.reason}
        </p>
        {appointment.symptoms && (
          <p className="appointment-reason">
            <strong>Symptoms:</strong> {appointment.symptoms}
          </p>
        )}
      </div>

      <div className="appointment-footer">
        {appointment.status === 'scheduled' && (
          <>
            <button
              className="btn btn-outline btn-small appointment-cancel-trigger"
              onClick={() => setShowCancelConfirm(true)}
            >
              Cancel appointment
            </button>
            {showCancelConfirm && (
              <div className="appointment-modal-backdrop" role="presentation">
                <div className="appointment-modal" role="dialog" aria-modal="true">
                  <h4>Cancel this appointment?</h4>
                  <p>This action cannot be undone. The slot will be released.</p>
                  <div className="appointment-modal-actions">
                    <button
                      type="button"
                      className="btn btn-outline btn-small"
                      onClick={() => setShowCancelConfirm(false)}
                    >
                      Keep appointment
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-small"
                      onClick={() => {
                        onDelete(appointment._id)
                        setShowCancelConfirm(false)
                      }}
                    >
                      Yes, cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default AppointmentCard
