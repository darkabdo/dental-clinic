import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Dentist from '../models/Dentist.js';
import { getClinicName } from '../config/clinic.js';
import { sendMail } from '../services/email.js';

const router = express.Router();

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

const forgotLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

// Patient Register
router.post(
  '/register',
  authLimiter,
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('dateOfBirth').notEmpty().withMessage('Date of birth is required'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { firstName, lastName, email, password, phone, dateOfBirth } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }

      const user = new User({
        firstName,
        lastName,
        email,
        password,
        phone,
        dateOfBirth,
        role: 'patient',
      });

      await user.save();

      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/** Public self-service signup for staff is disabled — use POST /api/admin/staff (admin only). */
router.post('/register-reception', authLimiter, (req, res) => {
  res.status(403).json({
    message: 'Staff accounts are created by an administrator.',
  });
});

router.post(
  '/login',
  authLimiter,
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).select('+password');
      if (user) {
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
          return res.status(400).json({ message: 'Invalid credentials' });
        }

        const resolvedRole =
          user.role === 'admin'
            ? 'admin'
            : user.role === 'reception' || user.role === 'receptionist'
              ? 'receptionist'
              : 'patient';

        const token = jwt.sign(
          { id: user._id, email: user.email, role: resolvedRole },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        );

        return res.json({
          message: 'Login successful',
          token,
          role: resolvedRole,
          user: {
            id: user._id,
            email: user.email,
            role: resolvedRole,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            dateOfBirth: user.dateOfBirth,
          },
        });
      }

      const dentist = await Dentist.findOne({ email }).select('+password');
      if (!dentist) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const dentistPwOk = await dentist.comparePassword(password);
      if (!dentistPwOk) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: dentist._id, email: dentist.email, role: 'doctor' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        message: 'Login successful',
        token,
        role: 'doctor',
        dentist: {
          id: dentist._id,
          email: dentist.email,
          role: 'doctor',
          fullName: dentist.fullName,
          phone: dentist.phone,
          clinicName: getClinicName(),
          specialty: dentist.specialty,
          licenseNumber: dentist.licenseNumber,
          experienceYears: dentist.experienceYears,
          education: dentist.education,
          achievements: dentist.achievements,
          about: dentist.about,
          currentFocus: dentist.currentFocus,
          currentStatus: dentist.currentStatus,
        },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/** Doctor accounts are provisioned by an admin — see POST /api/admin/doctors */
router.post('/dentist-register', authLimiter, (req, res) => {
  res.status(403).json({
    message: 'Doctor accounts are created by an administrator.',
  });
});

const seedLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

/** One-time bootstrap when no admin exists (requires SETUP_SECRET in .env). */
router.post(
  '/seed-admin',
  seedLimiter,
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('dateOfBirth').notEmpty().withMessage('Date of birth is required'),
  body('setupSecret').notEmpty().withMessage('Setup secret is required'),
  handleValidationErrors,
  async (req, res) => {
    try {
      if (!process.env.SETUP_SECRET || req.body.setupSecret !== process.env.SETUP_SECRET) {
        return res.status(403).json({ message: 'Invalid setup secret' });
      }

      const existingAdmin = await User.findOne({ role: 'admin' });
      if (existingAdmin) {
        return res.status(400).json({ message: 'An admin account already exists' });
      }

      const { firstName, lastName, email, password, phone, dateOfBirth } = req.body;

      const dup = await User.findOne({ email });
      if (dup) {
        return res.status(400).json({ message: 'Email already in use' });
      }

      const user = new User({
        firstName,
        lastName,
        email,
        password,
        phone,
        dateOfBirth,
        role: 'admin',
      });
      await user.save();

      res.status(201).json({
        message: 'Admin created. Sign in with this email and password.',
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.post(
  '/dentist-login',
  authLimiter,
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      const dentist = await Dentist.findOne({ email }).select('+password');
      if (!dentist) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isPasswordValid = await dentist.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: dentist._id, email: dentist.email, role: 'doctor' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login successful',
        token,
        role: 'doctor',
        dentist: {
          id: dentist._id,
          email: dentist.email,
          role: 'doctor',
          fullName: dentist.fullName,
          phone: dentist.phone,
          clinicName: getClinicName(),
          specialty: dentist.specialty,
          licenseNumber: dentist.licenseNumber,
          experienceYears: dentist.experienceYears,
          education: dentist.education,
          achievements: dentist.achievements,
          about: dentist.about,
          currentFocus: dentist.currentFocus,
          currentStatus: dentist.currentStatus,
        },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.post(
  '/forgot-password',
  forgotLimiter,
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('accountType').isIn(['user', 'dentist']).withMessage('Invalid account type'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, accountType } = req.body;
      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 60 * 60 * 1000);
      const baseUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');

      if (accountType === 'user') {
        const user = await User.findOne({ email });
        if (user) {
          user.passwordResetToken = token;
          user.passwordResetExpires = expires;
          await user.save({ validateModifiedOnly: true });

          const link = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}&type=user`;
          await sendMail({
            to: email,
            subject: 'Reset your DentalClinic password',
            text: `Reset your password (valid 1 hour): ${link}`,
            html: `<p>Reset your password (valid 1 hour):</p><p><a href="${link}">${link}</a></p>`,
          });
        }
      } else {
        const dentist = await Dentist.findOne({ email });
        if (dentist) {
          dentist.passwordResetToken = token;
          dentist.passwordResetExpires = expires;
          await dentist.save({ validateModifiedOnly: true });

          const link = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}&type=dentist`;
          await sendMail({
            to: email,
            subject: 'Reset your DentalClinic password',
            text: `Reset your password (valid 1 hour): ${link}`,
            html: `<p>Reset your password (valid 1 hour):</p><p><a href="${link}">${link}</a></p>`,
          });
        }
      }

      res.json({
        message: 'If an account exists for that email, we sent reset instructions.',
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.post(
  '/reset-password',
  authLimiter,
  body('token').trim().notEmpty().withMessage('Token is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('accountType').isIn(['user', 'dentist']).withMessage('Invalid account type'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { token, password, accountType } = req.body;
      const now = new Date();

      if (accountType === 'user') {
        const user = await User.findOne({
          passwordResetToken: token,
          passwordResetExpires: { $gt: now },
        }).select('+password +passwordResetToken +passwordResetExpires');

        if (!user) {
          return res.status(400).json({ message: 'Invalid or expired reset link' });
        }

        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
      } else {
        const dentist = await Dentist.findOne({
          passwordResetToken: token,
          passwordResetExpires: { $gt: now },
        }).select('+password +passwordResetToken +passwordResetExpires');

        if (!dentist) {
          return res.status(400).json({ message: 'Invalid or expired reset link' });
        }

        dentist.password = password;
        dentist.passwordResetToken = undefined;
        dentist.passwordResetExpires = undefined;
        await dentist.save();
      }

      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;

