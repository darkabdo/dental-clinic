import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dentistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dentist',
    },
    dentist: {
      type: String,
      required: [true, 'Please select a dentist'],
    },
    date: {
      type: Date,
      required: [true, 'Please provide an appointment date'],
    },
    time: {
      type: String,
      required: [true, 'Please select a time slot'],
    },
    reason: {
      type: String,
      required: [true, 'Please provide a reason for the visit'],
    },
    symptoms: {
      type: String,
      default: '',
      trim: true,
    },
    treatmentNotes: {
      type: String,
      default: '',
      trim: true,
    },
    diagnosis: {
      type: String,
      default: '',
      trim: true,
    },
    treatmentPlan: {
      type: String,
      default: '',
      trim: true,
    },
    prescribedMedications: {
      type: [String],
      default: [],
    },
    procedures: {
      type: [String],
      default: [],
    },
    painLevel: {
      type: Number,
      min: 0,
      max: 10,
    },
    followUpDate: {
      type: Date,
    },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    deskStatus: {
      type: String,
      enum: ['expected', 'confirmed', 'checked_in', 'no_show'],
      default: 'expected',
    },
    deskNote: {
      type: String,
      default: '',
      trim: true,
    },
    reminderEmailSentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Appointment', appointmentSchema);
