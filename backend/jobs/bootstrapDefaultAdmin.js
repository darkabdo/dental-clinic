import User from '../models/User.js';

/**
 * Ensures at least one admin exists (local dev convenience).
 * Set DISABLE_DEFAULT_ADMIN=true in production.
 * Override credentials with DEFAULT_ADMIN_EMAIL / DEFAULT_ADMIN_PASSWORD.
 */
export async function ensureDefaultAdmin() {
  if (process.env.DISABLE_DEFAULT_ADMIN === 'true') {
    console.log('[bootstrap] DISABLE_DEFAULT_ADMIN=true — not creating a default admin.');
    return;
  }

  try {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount > 0) {
      console.log('[bootstrap] Admin user(s) already in database — skipping default admin.');
      return;
    }

    // Must match User schema email regex — avoid odd TLDs if validation tightens.
    const email = (process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com').toLowerCase();
    const password = process.env.DEFAULT_ADMIN_PASSWORD || 'admin12345';
    const taken = await User.countDocuments({ email });
    if (taken) {
      console.warn(
        '[bootstrap] No admin yet, but this email is already a user (patient/staff):',
        email,
        '\n         Fix: promote them to admin in MongoDB, delete that user, or pick DEFAULT_ADMIN_EMAIL in .env.'
      );
      return;
    }

    await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email,
      password,
      phone: process.env.DEFAULT_ADMIN_PHONE || '0000000000',
      dateOfBirth: new Date('1990-01-01'),
      role: 'admin',
    });

    console.log('[bootstrap] Default admin created — sign in with:');
    console.log(`[bootstrap]   Email:    ${email}`);
    console.log(`[bootstrap]   Password: ${password}`);
    console.log('[bootstrap] Change this password after first login. Set DISABLE_DEFAULT_ADMIN=true in production.');
  } catch (err) {
    console.error('[bootstrap] Could not create default admin:', err.message);
    if (err.errors) {
      console.error('[bootstrap] Validation:', JSON.stringify(err.errors, null, 2));
    }
  }
}
