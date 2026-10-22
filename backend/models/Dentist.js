import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import { getClinicName } from '../config/clinic.js';

const dentistSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Please provide a full name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    phone: {
      type: String,
      required: [true, 'Please provide a phone number'],
    },
    clinicName: {
      type: String,
      trim: true,
      default() {
        return getClinicName();
      },
    },
    specialty: {
      type: String,
      enum: ['General Dentistry', 'Orthodontics', 'Cosmetic Dentistry', 'Oral Surgery'],
      required: [true, 'Please select a specialty'],
    },
    licenseNumber: {
      type: String,
      required: [true, 'Please provide a license number'],
      trim: true,
    },
    experienceYears: {
      type: Number,
      default: 1,
      min: 0,
    },
    education: {
      type: [String],
      default: [],
    },
    achievements: {
      type: [String],
      default: [],
    },
    about: {
      type: String,
      default: '',
      trim: true,
    },
    currentFocus: {
      type: String,
      default: 'Consultations and patient care',
      trim: true,
    },
    currentStatus: {
      type: String,
      enum: ['available', 'in_consultation', 'in_procedure', 'on_break', 'offline'],
      default: 'available',
    },
    role: {
      type: String,
      default: 'dentist',
      enum: ['dentist'],
    },
  },
  {
    timestamps: true,
  }
);

function applyCanonicalClinicName(_, ret) {
  ret.clinicName = getClinicName();
}

dentistSchema.set('toJSON', {
  transform(doc, ret) {
    applyCanonicalClinicName(doc, ret);
    return ret;
  },
});

dentistSchema.set('toObject', {
  transform(doc, ret) {
    applyCanonicalClinicName(doc, ret);
    return ret;
  },
});

// Hash password before saving
dentistSchema.pre('save', async function (next) {
  this.clinicName = getClinicName();

  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
dentistSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

export default mongoose.model('Dentist', dentistSchema);
