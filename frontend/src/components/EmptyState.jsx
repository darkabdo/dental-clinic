import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/EmptyState.css'

export default function EmptyState({
  title,
  description,
  actionLabel,
  actionTo,
  className = '',
}) {
  return (
    <div className={`empty-state ${className}`.trim()} role="status">
      <div className="empty-state__icon" aria-hidden="true">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h3 className="empty-state__title">{title}</h3>
      {description ? <p className="empty-state__desc">{description}</p> : null}
      {actionLabel && actionTo ? (
        <Link to={actionTo} className="btn btn-primary btn-small empty-state__action">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  )
}
