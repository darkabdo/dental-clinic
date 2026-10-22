import express from 'express';
import { body, validationResult } from 'express-validator';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import User from '../models/User.js';
import Dentist from '../models/Dentist.js';
import { getClinicName } from '../config/clinic.js';

const router = express.Router();

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
}

router.use(auth);
router.use(requireRole(['admin']));

/** Create receptionist or another admin (not patients — use public /register). */
router.post(
  '/staff',
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('dateOfBirth').notEmpty().withMessage('Date of birth is required'),
  body('role').isIn(['receptionist', 'admin']).withMessage('Role must be receptionist or admin'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { firstName, lastName, email, password, phone, dateOfBirth, role } = req.body;

      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ message: 'Email already in use' });
      }

      const user = new User({
        firstName,
        lastName,
        email,
        password,
        phone,
        dateOfBirth,
        role,
      });
      await user.save();

      res.status(201).json({
        message: 'Staff account created',
        user: { id: user._id, email: user.email, role: user.role },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/** Provision a doctor (Dentist collection). */
router.post(
  '/doctors',
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('specialty').trim().notEmpty().withMessage('Specialty is required'),
  body('licenseNumber').trim().notEmpty().withMessage('License number is required'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const {
        fullName,
        email,
        password,
        phone,
        specialty,
        licenseNumber,
        experienceYears,
        about,
        currentFocus,
      } = req.body;

      const educationRaw = req.body.education;
      const education = Array.isArray(educationRaw)
        ? educationRaw
        : typeof educationRaw === 'string' && educationRaw.trim()
          ? educationRaw
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [];

      const achievementsRaw = req.body.achievements;
      const achievements = Array.isArray(achievementsRaw)
        ? achievementsRaw
        : typeof achievementsRaw === 'string' && achievementsRaw.trim()
          ? achievementsRaw
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [];

      const existing = await Dentist.findOne({ email });
      if (existing) {
        return res.status(400).json({ message: 'Email already in use' });
      }

      const dentist = new Dentist({
        fullName,
        email,
        password,
        phone,
        clinicName: getClinicName(),
        specialty,
        licenseNumber,
        experienceYears: Number(experienceYears) || 1,
        education,
        achievements,
        about: about || '',
        currentFocus: currentFocus || 'Consultations and patient care',
      });

      await dentist.save();

      res.status(201).json({
        message: 'Doctor account created',
        dentist: { id: dentist._id, email: dentist.email, fullName: dentist.fullName },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;
