/** Canonical roles returned by the API after login */
export const ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  RECEPTIONIST: 'receptionist',
  ADMIN: 'admin',
}

/** Default landing path for each role (post-login / unauthorized recovery). */
export function dashboardPathForRole(role) {
  switch (role) {
    case ROLES.PATIENT:
      return '/patient-workspace'
    case ROLES.DOCTOR:
      return '/doctor-dashboard'
    case ROLES.RECEPTIONIST:
      return '/reception-console'
    case ROLES.ADMIN:
      return '/admin-dashboard'
    default:
      return '/'
  }
}

/** After login, only honor `from` if it belongs to this role (avoids open redirects). */
export function safePostLoginRedirect(role, fromPath) {
  const fallback = dashboardPathForRole(role)
  if (!fromPath || typeof fromPath !== 'string') return fallback

  const patterns = {
    patient: [/^\/patient-workspace(\/.*)?$/, /^\/profile$/, /^\/book-appointment(\/.*)?$/],
    doctor: [/^\/doctor-dashboard(\/.*)?$/],
    receptionist: [/^\/reception-console(\/.*)?$/, /^\/reception-dashboard(\/.*)?$/],
    admin: [/^\/admin-dashboard(\/.*)?$/],
  }

  const list = patterns[role]
  if (!list) return fallback
  if (!list.some((re) => re.test(fromPath))) return fallback

  if (role === 'patient' && fromPath === '/profile') return '/patient-workspace'
  if (role === 'patient' && /^\/book-appointment/.test(fromPath)) return '/patient-workspace/book'

  return fromPath
}
