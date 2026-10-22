import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import appointmentRoutes from './routes/appointments.js';
import dentistRoutes from './routes/dentist.js';
import receptionRoutes from './routes/reception.js';
import adminRoutes from './routes/admin.js';
import { getClinicName } from './config/clinic.js';
import { startReminderCron } from './jobs/reminderCron.js';
import { ensureDefaultAdmin } from './jobs/bootstrapDefaultAdmin.js';

dotenv.config();

const app = express();

if (!process.env.MONGO_URI) {
  console.error('FATAL: MONGO_URI is not set. Copy backend/.env.example to backend/.env and configure it.');
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB — if this fails, API routes that touch the DB will error until MongoDB is reachable
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 8_000,
  })
  .then(async () => {
    console.log('MongoDB connected');
    await ensureDefaultAdmin();
    startReminderCron();
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    console.error(
      '→ Is MongoDB running? For local dev: start the MongoDB service, run mongod, or use Docker:\n' +
        '  docker run -d -p 27017:27017 --name dental-mongo mongo:7\n' +
        '→ Or set MONGO_URI in backend/.env to a MongoDB Atlas connection string.'
    );
    console.error(
      '→ Until Mongo connects and you restart the backend, login will fail and no auto-admin is created.'
    );
  });

// Public: canonical practice name (single clinic for all dentists)
app.get('/api/clinic', (req, res) => {
  res.json({ clinicName: getClinicName() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/dentist', dentistRoutes);
app.use('/api/reception', receptionRoutes);
app.use('/api/admin', adminRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Dental Clinic API Server' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
