import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import PageFooter from './components/PageFooter'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import PatientSignUp from './pages/PatientSignUp'
import PatientWorkspaceLayout from './pages/PatientWorkspaceLayout'
import Profile from './pages/Profile'
import BookAppointment from './pages/BookAppointment'
import DentistDashboard from './pages/DentistDashboard'
import ReceptionDashboard from './pages/ReceptionDashboard'
import AdminDashboard from './pages/AdminDashboard'
import CreateStaffAccount from './pages/CreateStaffAccount'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Privacy from './pages/Privacy'
import NotFound from './pages/NotFound'
import Unauthorized from './pages/Unauthorized'

function App() {
  return (
    <Router>
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content" className="site-main" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<PatientSignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route path="/profile" element={<Navigate to="/patient-workspace" replace />} />
          <Route path="/book-appointment" element={<Navigate to="/patient-workspace/book" replace />} />
          <Route path="/dentist-dashboard" element={<Navigate to="/doctor-dashboard" replace />} />
          <Route path="/reception-dashboard" element={<Navigate to="/reception-console" replace />} />

          <Route
            path="/patient-workspace"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientWorkspaceLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Profile />} />
            <Route path="book" element={<BookAppointment />} />
          </Route>

          <Route
            path="/doctor-dashboard"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DentistDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reception-console"
            element={
              <ProtectedRoute allowedRoles={['receptionist']}>
                <ReceptionDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard/provision"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CreateStaffAccount />
              </ProtectedRoute>
            }
          />

          <Route path="/dentist-register" element={<Navigate to="/login" replace />} />
          <Route path="/register-reception" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <PageFooter />
    </Router>
  )
}

export default App
