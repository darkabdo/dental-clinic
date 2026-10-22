import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import '../styles/PatientWorkspaceLayout.css'

export default function PatientWorkspaceLayout() {
  return (
    <div className="patient-workspace">
      <div className="container patient-workspace__inner">
        <nav className="patient-workspace__nav" aria-label="Patient workspace">
          <NavLink
            to="/patient-workspace"
            end
            className={({ isActive }) =>
              `patient-workspace__tab ${isActive ? 'patient-workspace__tab--active' : ''}`
            }
          >
            Overview
          </NavLink>
          <NavLink
            to="/patient-workspace/book"
            className={({ isActive }) =>
              `patient-workspace__tab ${isActive ? 'patient-workspace__tab--active' : ''}`
            }
          >
            Book visit
          </NavLink>
        </nav>
        <Outlet />
      </div>
    </div>
  )
}
