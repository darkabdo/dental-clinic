import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import Appointment from '../models/Appointment.js';
import Dentist from '../models/Dentist.js';
import User from '../models/User.js';
import { getClinicName } from '../config/clinic.js';

const router = express.Router();

router.use(auth);
router.use(requireRole(['receptionist']));

/** Lobby (today) + pipeline (upcoming) + light KPIs — drives the 3-column desk UI. */
router.get('/overview', async (req, res) => {
  try {
    const now = new Date();
    const y = now.getUTCFullYear();
    const mo = now.getUTCMonth();
    const da = now.getUTCDate();
    const todayStart = new Date(Date.UTC(y, mo, da, 0, 0, 0, 0));
    const tomorrowStart = new Date(Date.UTC(y, mo, da + 1, 0, 0, 0, 0));
    const horizonEnd = new Date(Date.UTC(y, mo, da + 22, 0, 0, 0, 0));

    const populate = [
      { path: 'patientId', select: 'firstName lastName email phone' },
      { path: 'dentistId', select: 'fullName specialty clinicName currentStatus' },
    ];

    const [lobby, pipeline] = await Promise.all([
      Appointment.find({
        status: 'scheduled',
        date: { $gte: todayStart, $lt: tomorrowStart },
      })
        .populate(populate)
        .sort({ time: 1 }),
      Appointment.find({
        status: 'scheduled',
        date: { $gte: tomorrowStart, $lt: horizonEnd },
      })
        .populate(populate)
        .sort({ date: 1, time: 1 })
        .limit(48),
    ]);

    res.json({
      clinicTagline: getClinicName(),
      kpis: {
        lobbyToday: lobby.length,
        pipelineUpcoming: pipeline.length,
      },
      lobby,
      pipeline,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/appointments/:id/desk', async (req, res) => {
  try {
    const { deskStatus, deskNote } = req.body;
    const allowed = ['expected', 'confirmed', 'checked_in', 'no_show'];
    if (!deskStatus || !allowed.includes(deskStatus)) {
      return res.status(400).json({ message: 'Valid deskStatus is required' });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.status !== 'scheduled') {
      return res
        .status(400)
        .json({ message: 'Desk status can only be updated for scheduled visits' });
    }

    appointment.deskStatus = deskStatus;
    if (typeof deskNote === 'string') {
      appointment.deskNote = deskNote.trim();
    }

    await appointment.save();

    await appointment.populate([
      { path: 'patientId', select: 'firstName lastName email phone' },
      { path: 'dentistId', select: 'fullName specialty clinicName currentStatus' },
    ]);

    res.json({ message: 'Desk status updated', appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/** Search patients by email or name (min 2 chars). */
router.get('/patients', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (q.length < 2) {
      return res.json([]);
    }

    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const rx = new RegExp(escaped, 'i');

    const users = await User.find({
      role: 'patient',
      $or: [{ email: rx }, { firstName: rx }, { lastName: rx }],
    })
      .select('firstName lastName email phone dateOfBirth role')
      .limit(25);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/** Book on behalf of a patient (same slot rules as patient booking). */
router.post('/appointments', async (req, res) => {
  try {
    const { patientId, dentistId, date, time, reason, symptoms, urgency } = req.body;

    if (!patientId || !dentistId || !date || !time || !reason) {
      return res
        .status(400)
        .json({ message: 'patientId, dentistId, date, time, and reason are required' });
    }

    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const dentistEntity = await Dentist.findById(dentistId);
    if (!dentistEntity) {
      return res.status(404).json({ message: 'Dentist not found' });
    }

    const normalizedDate = new Date(`${date}T12:00:00.000Z`);

    const existingAppointment = await Appointment.findOne({
      dentistId: dentistEntity._id,
      date: normalizedDate,
      time,
      status: { $ne: 'cancelled' },
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }

    const appointment = new Appointment({
      patientId,
      dentistId: dentistEntity._id,
      dentist: dentistEntity.fullName,
      date: normalizedDate,
      time,
      reason,
      symptoms: symptoms || '',
      urgency: urgency || 'medium',
      deskStatus: 'confirmed',
    });

    await appointment.save();

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment: await appointment.populate(
        'dentistId',
        'fullName specialty clinicName currentStatus'
      ),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/** Edit a scheduled appointment (reason/time/date/urgency/symptoms and optionally dentist). */
router.put('/appointments/:id', async (req, res) => {
  try {
    const { dentistId, date, time, reason, symptoms, urgency } = req.body;

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    if (appointment.status !== 'scheduled') {
      return res.status(400).json({ message: 'Only scheduled appointments can be edited' });
    }

    let nextDentistId = appointment.dentistId;
    let nextDentistName = appointment.dentist;
    if (dentistId) {
      const dentistEntity = await Dentist.findById(dentistId);
      if (!dentistEntity) {
        return res.status(404).json({ message: 'Dentist not found' });
      }
      nextDentistId = dentistEntity._id;
      nextDentistName = dentistEntity.fullName;
    }

    let nextDate = appointment.date;
    if (date) {
      const normalizedDate = new Date(`${date}T12:00:00.000Z`);
      if (Number.isNaN(normalizedDate.getTime())) {
        return res.status(400).json({ message: 'Invalid date' });
      }
      nextDate = normalizedDate;
    }

    const nextTime = typeof time === 'string' && time.trim() ? time.trim() : appointment.time;
    if (!nextTime) {
      return res.status(400).json({ message: 'Time is required' });
    }

    const conflict = await Appointment.findOne({
      _id: { $ne: appointment._id },
      dentistId: nextDentistId,
      date: nextDate,
      time: nextTime,
      status: { $ne: 'cancelled' },
    });
    if (conflict) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }

    if (reason != null && String(reason).trim()) {
      appointment.reason = String(reason).trim();
    }
    if (symptoms != null) {
      appointment.symptoms = String(symptoms).trim();
    }
    if (urgency != null) {
      const allowedUrgency = ['low', 'medium', 'high'];
      if (!allowedUrgency.includes(urgency)) {
        return res.status(400).json({ message: 'Invalid urgency value' });
      }
      appointment.urgency = urgency;
    }

    appointment.dentistId = nextDentistId;
    appointment.dentist = nextDentistName;
    appointment.date = nextDate;
    appointment.time = nextTime;

    await appointment.save();
    await appointment.populate([
      { path: 'patientId', select: 'firstName lastName email phone' },
      { path: 'dentistId', select: 'fullName specialty clinicName currentStatus' },
    ]);

    res.json({ message: 'Appointment updated', appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/** Cancel appointment (soft-cancel, keeps history). */
router.put('/appointments/:id/cancel', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    if (appointment.status === 'cancelled') {
      return res.status(400).json({ message: 'Appointment already cancelled' });
    }

    appointment.status = 'cancelled';
    appointment.deskStatus = 'no_show';
    await appointment.save();
    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/** Permanently delete appointment. Use for cleanup after cancellation mistakes. */
router.delete('/appointments/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
