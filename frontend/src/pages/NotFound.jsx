import React from 'react'
import { Link } from 'react-router-dom'
import PageMeta from '../components/PageMeta'

export default function NotFound() {
  return (
    <div className="container text-center" style={{ padding: '4rem 1rem' }}>
      <PageMeta title="Page not found" description="This page does not exist." />
      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>404</h1>
      <p className="text-secondary" style={{ marginBottom: '1.5rem' }}>
        We could not find that page.
      </p>
      <Link to="/" className="btn btn-primary">
        Back to home
      </Link>
    </div>
  )
}
