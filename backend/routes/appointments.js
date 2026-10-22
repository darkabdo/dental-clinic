import express from 'express';
import { auth } from '../middleware/auth.js';
import Appointment from '../models/Appointment.js';
import Dentist from '../models/Dentist.js';
import User from '../models/User.js';
import { TIME_SLOTS } from '../config/timeSlots.js';

const router = express.Router();

/** YYYY-MM-DD in UTC — matches appointments stored as `${date}T12:00:00.000Z`. */
function utcYmd(d) {
  const x = new Date(d);
  return `${x.getUTCFullYear()}-${String(x.getUTCMonth() + 1).padStart(2, '0')}-${String(
    x.getUTCDate()
  ).padStart(2, '0')}`;
}

// Get user's appointments
router.get('/my', auth, async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patientId: req.userId,
      status: { $ne: 'cancelled' },
    })
      .populate('dentistId', 'fullName specialty clinicName currentStatus')
      .sort({ date: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/history-summary', auth, async (req, res) => {
  try {
    if (req.userRole !== 'patient') {
      return res.status(403).json({ message: 'Only patients can access this view' });
    }

    const [patient, appointments] = await Promise.all([
      User.findById(req.userId).select(
        'firstName lastName email phone dateOfBirth medicalProfile'
      ),
      Appointment.find({ patientId: req.userId, status: { $ne: 'cancelled' } })
        .populate('dentistId', 'fullName specialty clinicName')
        .sort({ date: -1 }),
    ]);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const completed = appointments.filter((item) => item.status === 'completed');
    const summary = {
      totalVisits: appointments.length,
      completedTreatments: completed.length,
      upcomingAppointments: appointments.filter((item) => item.status === 'scheduled').length,
      latestDiagnosis: completed.find((item) => item.diagnosis)?.diagnosis || '',
      activeMedications:
        completed.find((item) => item.prescribedMedications?.length > 0)
          ?.prescribedMedications || [],
    };

    res.json({ patient, summary, appointments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/availability/:dentistId', async (req, res) => {
  try {
    const dentist = await Dentist.findById(req.params.dentistId);
    if (!dentist) {
      return res.status(404).json({ message: 'Dentist not found' });
    }

    const daysAhead = Number(req.query.days || 45);
    const totalDays = Number.isFinite(daysAhead) ? Math.min(Math.max(daysAhead, 1), 120) : 45;

    let rangeStartMs;
    const anchorParam = req.query.anchor;
    if (typeof anchorParam === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(anchorParam.trim())) {
      const [yy, mm, dd] = anchorParam.trim().split('-').map(Number);
      rangeStartMs = Date.UTC(yy, mm - 1, dd, 0, 0, 0, 0);
    } else {
      const anchor = new Date();
      rangeStartMs = Date.UTC(
        anchor.getUTCFullYear(),
        anchor.getUTCMonth(),
        anchor.getUTCDate(),
        0,
        0,
        0,
        0
      );
    }

    const rangeEndExclusiveMs = rangeStartMs + (totalDays + 1) * 86400000;

    const appointments = await Appointment.find({
      dentistId: dentist._id,
      date: { $gte: new Date(rangeStartMs), $lt: new Date(rangeEndExclusiveMs) },
      status: { $ne: 'cancelled' },
    }).select('date time');

    const bookedByDay = new Map();
    appointments.forEach((item) => {
      const key = utcYmd(item.date);
      if (!bookedByDay.has(key)) {
        bookedByDay.set(key, new Set());
      }
      bookedByDay.get(key).add(item.time);
    });

    const calendar = [];
    for (let i = 0; i <= totalDays; i += 1) {
      const ms = rangeStartMs + i * 86400000;
      const key = utcYmd(new Date(ms));
      const booked = bookedByDay.get(key) || new Set();
      const availableSlots = TIME_SLOTS.filter((slot) => !booked.has(slot));
      calendar.push({
        date: key,
        availableSlots,
        isFullyBooked: availableSlots.length === 0,
      });
    }

    res.json({
      dentistId: dentist._id,
      availableDates: calendar.filter((item) => !item.isFullyBooked).map((item) => item.date),
      fullyBookedDates: calendar.filter((item) => item.isFullyBooked).map((item) => item.date),
      calendar,
      timeSlots: TIME_SLOTS,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/medical-profile', auth, async (req, res) => {
  try {
    if (req.userRole !== 'patient') {
      return res.status(403).json({ message: 'Only patients can update profile' });
    }

    const { medicalProfile } = req.body;
    if (!medicalProfile) {
      return res.status(400).json({ message: 'Medical profile is required' });
    }

    const patient = await User.findByIdAndUpdate(
      req.userId,
      { medicalProfile },
      { new: true, runValidators: true }
    ).select('firstName lastName medicalProfile');

    res.json({ message: 'Medical profile updated', patient });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Book appointment (patients only — reception books via POST /api/reception/appointments)
router.post('/', auth, async (req, res) => {
  try {
    const bookingRole = req.userRole || 'patient';
    if (bookingRole !== 'patient') {
      return res.status(403).json({
        message: 'Only patient accounts can book here. Use Reception console for behalf bookings.',
      });
    }

    const { dentistId, dentist, date, time, reason, symptoms, urgency } = req.body;

    // Validation
    if ((!dentistId && !dentist) || !date || !time || !reason) {
      return res
        .status(400)
        .json({ message: 'Please provide all required fields' });
    }

    let dentistEntity = null;
    if (dentistId) {
      dentistEntity = await Dentist.findById(dentistId);
    } else if (dentist) {
      dentistEntity = await Dentist.findOne({ fullName: dentist });
    }

    if (!dentistEntity) {
      return res.status(404).json({ message: 'Selected dentist not found' });
    }

    // Keep date stable across timezones: always store booking day at noon UTC.
    const normalizedDate = new Date(`${date}T12:00:00.000Z`);

    // Check for existing appointment at same time
    const existingAppointment = await Appointment.findOne({
      dentistId: dentistEntity._id,
      date: normalizedDate,
      time,
      status: { $ne: 'cancelled' },
    });

    if (existingAppointment) {
      return res
        .status(400)
        .json({ message: 'This time slot is already booked' });
    }

    const appointment = new Appointment({
      patientId: req.userId,
      dentistId: dentistEntity._id,
      dentist: dentistEntity.fullName,
      date: normalizedDate,
      time,
      reason,
      symptoms: symptoms || '',
      urgency: urgency || 'medium',
    });

    await appointment.save();

    res
      .status(201)
      .json({
        message: 'Appointment booked successfully',
        appointment: await appointment.populate('dentistId', 'fullName specialty clinicName currentStatus'),
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete appointment
router.delete('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user owns this appointment
    if (appointment.patientId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
