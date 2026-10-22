import React from 'react'
import PageMeta from '../components/PageMeta'

export default function Privacy() {
  return (
    <div className="container" style={{ padding: '2.5rem 1rem 3rem', maxWidth: '42rem' }}>
      <PageMeta
        title="Privacy"
        description="How DentalClinic handles your personal and health information."
      />
      <h1>Privacy</h1>
      <p className="text-secondary" style={{ marginBottom: '1.5rem' }}>
        This practice takes confidentiality seriously. This summary describes how we use information in this demo
        application.
      </p>
      <h2 style={{ fontSize: '1.15rem', marginTop: '1.5rem' }}>What we collect</h2>
      <p>
        Account details (name, email, phone, date of birth), appointment and clinical notes you or your providers enter,
        and technical logs needed to run the service.
      </p>
      <h2 style={{ fontSize: '1.15rem', marginTop: '1.5rem' }}>How we use it</h2>
      <p>
        To schedule visits, coordinate care between patients, dentists, and reception, and to send optional reminders
        when email is configured.
      </p>
      <h2 style={{ fontSize: '1.15rem', marginTop: '1.5rem' }}>Contact</h2>
      <p>
        Questions: <a href="mailto:privacy@dentalclinic.com">privacy@dentalclinic.com</a>
      </p>
    </div>
  )
}
