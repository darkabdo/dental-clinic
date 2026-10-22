import React from 'react'
import { Link } from 'react-router-dom'
import PageMeta from '../components/PageMeta'
import '../styles/AdminDashboard.css'

function AdminCardIcon({ children }) {
  return (
    <span className="admin-hub__card-icon" aria-hidden="true">
      <svg className="admin-hub__card-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        {children}
      </svg>
    </span>
  )
}

export default function AdminDashboard() {
  return (
    <div className="admin-hub">
      <PageMeta title="Admin" description="Clinic administration." />
      <h1 className="admin-hub__title">Administration</h1>
      <p className="admin-hub__lead">
        Everything useful is below: add people who work at the clinic. Patients still sign themselves up from the public{' '}
        <Link to="/register">patient registration</Link> page.
      </p>

      <div className="admin-hub__grid">
        <Link className="admin-hub__card" to="/admin-dashboard/provision?tab=staff">
          <AdminCardIcon>
            <path
              d="M5 21V10.8c0-.53.21-1.04.59-1.42l4.7-4.7a2 2 0 012.82 0l4.71 4.7c.38.38.59.89.59 1.42V21"
              stroke="currentColor"
              strokeWidth="1.65"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 21v-5h6v5M12 7v4"
              stroke="currentColor"
              strokeWidth="1.65"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </AdminCardIcon>
          <h2>Add receptionist</h2>
          <p>Front desk can search patients, manage the lobby, and book appointments for them.</p>
          <span className="admin-hub__card-cta">Open form →</span>
        </Link>

        <Link className="admin-hub__card" to="/admin-dashboard/provision?tab=staff&staffRole=admin">
          <AdminCardIcon>
            <path
              d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
              stroke="currentColor"
              strokeWidth="1.65"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 12l2 2 4-4"
              stroke="currentColor"
              strokeWidth="1.65"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </AdminCardIcon>
          <h2>Add another administrator</h2>
          <p>Create a second admin account with the same powers as yours (separate email and password).</p>
          <span className="admin-hub__card-cta">Open form →</span>
        </Link>

        <Link className="admin-hub__card" to="/admin-dashboard/provision?tab=doctor">
          <AdminCardIcon>
            <path
              d="M12 3c-1.72 0-2.94 1.12-3.08 2.72-.06.72-.35 1.22-.82 2.02-.52.88-.9 2.1-.9 4.06v7.05c0 .88.72 1.6 1.6 1.6.53 0 1.02-.26 1.32-.68.32-.46.92-.74 1.6-.74.7 0 1.3.3 1.62.76.3.42.78.66 1.3.66.88 0 1.6-.72 1.6-1.6v-7.05c0-1.96-.38-3.18-.9-4.06-.47-.8-.76-1.3-.82-2.02C14.94 4.12 13.72 3 12 3z"
              stroke="currentColor"
              strokeWidth="1.65"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </AdminCardIcon>
          <h2>Add a doctor</h2>
          <p>Adds a clinician to the system so they can sign in with email and password and see their schedule.</p>
          <span className="admin-hub__card-cta">Open form →</span>
        </Link>
      </div>

      <div className="admin-hub__note">
        <strong>Can’t do anything?</strong> You must open one of the cards above and submit the form — the home page
        only lists actions. After you create a receptionist or doctor, they sign in from the main{' '}
        <Link to="/login">Login</Link> page — no role picker needed; routing follows their account.
      </div>

      <details>
        <summary>First login / default dev password</summary>
        <p style={{ marginTop: '0.65rem' }}>
          If this is your own computer, the backend usually creates a first admin when MongoDB is running: sign in as{' '}
          <strong>admin@example.com</strong> / <strong>admin12345</strong> (unless you
          changed <code>DEFAULT_ADMIN_*</code> in <code>backend/.env</code>).
        </p>
      </details>
    </div>
  )
}
