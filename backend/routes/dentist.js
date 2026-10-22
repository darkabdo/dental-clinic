import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import Appointment from '../models/Appointment.js';
import Dentist from '../models/Dentist.js';
import User from '../models/User.js';

const router = express.Router();

// Public dentist directory for patients
router.get('/list', async (req, res) => {
  try {
    const dentists = await Dentist.find({})
      .select(
        'fullName specialty clinicName experienceYears achievements education about currentFocus currentStatus'
      )
      .sort({ createdAt: -1 });

    res.json(dentists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.use(auth, requireRole(['doctor']));

// Get all appointments for a specific dentist
router.get('/my', async (req, res) => {
  try {
    // Get the dentist info to match appointments
    const dentist = await Dentist.findById(req.userId);
    
    if (!dentist) {
      return res.status(404).json({ message: 'Dentist not found' });
    }

    // Find all appointments for this dentist
    const appointments = await Appointment.find({
      $or: [{ dentistId: dentist._id }, { dentist: dentist.fullName }],
      status: { $ne: 'cancelled' },
    })
      .populate('patientId', 'firstName lastName email phone')
      .populate('dentistId', 'fullName specialty clinicName currentStatus')
      .sort({ date: -1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Dentist schedule calendar (month/day range)
router.get('/schedule', async (req, res) => {
  try {
    const dentist = await Dentist.findById(req.userId);

    if (!dentist) {
      return res.status(404).json({ message: 'Dentist not found' });
    }

    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({ message: 'from and to are required (YYYY-MM-DD)' });
    }

    const fromDate = new Date(`${from}T00:00:00.000Z`);
    const toDate = new Date(`${to}T23:59:59.999Z`);

    const appointments = await Appointment.find({
      $or: [{ dentistId: dentist._id }, { dentist: dentist.fullName }],
      date: { $gte: fromDate, $lte: toDate },
      status: { $ne: 'cancelled' },
    })
      .populate('patientId', 'firstName lastName email phone')
      .sort({ date: 1, time: 1 });

    res.json({ from, to, appointments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get dentist info
router.get('/profile', async (req, res) => {
  try {
    const dentist = await Dentist.findById(req.userId).select('-password');
    
    if (!dentist) {
      return res.status(404).json({ message: 'Dentist not found' });
    }

    res.json(dentist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get patient list for dentist
router.get('/patients', async (req, res) => {
  try {
    const dentist = await Dentist.findById(req.userId);
    
    if (!dentist) {
      return res.status(404).json({ message: 'Dentist not found' });
    }

    // Get unique patients who have appointments with this dentist
    const appointments = await Appointment.find({
      $or: [{ dentistId: dentist._id }, { dentist: dentist.fullName }],
      status: { $ne: 'cancelled' },
    }).distinct('patientId');

    const patients = await User.find({ _id: { $in: appointments } }).select(
      'firstName lastName email phone dateOfBirth medicalProfile'
    );

    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/patients/:patientId/history', async (req, res) => {
  try {
    const dentist = await Dentist.findById(req.userId);
    if (!dentist) {
      return res.status(404).json({ message: 'Dentist not found' });
    }

    const patient = await User.findById(req.params.patientId).select(
      'firstName lastName email phone dateOfBirth medicalProfile'
    );
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const appointments = await Appointment.find({
      patientId: req.params.patientId,
      status: { $ne: 'cancelled' },
      $or: [{ dentistId: dentist._id }, { dentist: dentist.fullName }],
    })
      .sort({ date: -1 })
      .populate('dentistId', 'fullName specialty clinicName');

    res.json({
      patient,
      clinicalHistory: appointments,
      summary: {
        totalVisitsWithDentist: appointments.length,
        completedTreatments: appointments.filter((item) => item.status === 'completed').length,
        latestDiagnosis: appointments.find((item) => item.diagnosis)?.diagnosis || '',
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update appointment status
router.put('/appointments/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const dentist = await Dentist.findById(req.userId);

    if (!dentist) {
      return res.status(404).json({ message: 'Dentist not found' });
    }

    if (!['scheduled', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const isOwnedByDentist =
      (appointment.dentistId &&
        appointment.dentistId.toString() === dentist._id.toString()) ||
      appointment.dentist === dentist.fullName;

    if (!isOwnedByDentist) {
      return res.status(403).json({ message: 'Unauthorized appointment access' });
    }

    appointment.status = status;
    await appointment.save();

    await appointment.populate('patientId', 'firstName lastName email phone');

    res.json({
      message: 'Appointment status updated',
      appointment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Dentist can update own live status and profile highlights
router.put('/profile/live', async (req, res) => {
  try {
    const { currentStatus, currentFocus } = req.body;

    const updates = {};
    if (currentStatus) updates.currentStatus = currentStatus;
    if (typeof currentFocus === 'string') updates.currentFocus = currentFocus.trim();

    const dentist = await Dentist.findByIdAndUpdate(req.userId, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!dentist) {
      return res.status(404).json({ message: 'Dentist not found' });
    }

    res.json({ message: 'Live profile updated', dentist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Dentist can save treatment details to keep patient history
router.put('/appointments/:id/notes', async (req, res) => {
  try {
    const {
      treatmentNotes,
      followUpDate,
      diagnosis,
      treatmentPlan,
      prescribedMedications,
      procedures,
      painLevel,
    } = req.body;
    const dentist = await Dentist.findById(req.userId);

    if (!dentist) {
      return res.status(404).json({ message: 'Dentist not found' });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const isOwnedByDentist =
      (appointment.dentistId &&
        appointment.dentistId.toString() === dentist._id.toString()) ||
      appointment.dentist === dentist.fullName;

    if (!isOwnedByDentist) {
      return res.status(403).json({ message: 'Unauthorized appointment access' });
    }

    appointment.treatmentNotes = treatmentNotes || '';
    appointment.diagnosis = diagnosis || '';
    appointment.treatmentPlan = treatmentPlan || '';
    appointment.prescribedMedications = Array.isArray(prescribedMedications)
      ? prescribedMedications
      : [];
    appointment.procedures = Array.isArray(procedures) ? procedures : [];
    const parsedPain = Number(painLevel);
    appointment.painLevel = Number.isFinite(parsedPain) ? parsedPain : undefined;
    appointment.followUpDate = followUpDate
      ? new Date(`${followUpDate}T12:00:00.000Z`)
      : undefined;
    await appointment.save();

    res.json({ message: 'Treatment notes saved', appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
