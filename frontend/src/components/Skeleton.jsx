import React from 'react'
import '../styles/Skeleton.css'

export function Skeleton({ className = '', style, ...rest }) {
  return <div className={`skeleton ${className}`.trim()} style={style} {...rest} />
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`skeleton-text ${className}`.trim()}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="skeleton-text__line"
          style={{ width: i === lines - 1 ? '72%' : '100%' }}
        />
      ))}
    </div>
  )
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`skeleton-card ${className}`.trim()}>
      <Skeleton className="skeleton-card__title" />
      <SkeletonText lines={2} />
    </div>
  )
}
