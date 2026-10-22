/**
 * Single practice name for all dentists in this deployment.
 * Set CLINIC_NAME in `.env` to customize (defaults if unset).
 */
export function getClinicName() {
  const name = process.env.CLINIC_NAME?.trim();
  return name && name.length > 0 ? name : 'DentalClinic Network';
}
