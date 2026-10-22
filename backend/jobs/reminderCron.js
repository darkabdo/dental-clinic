import cron from 'node-cron';
import Appointment from '../models/Appointment.js';
import { sendMail } from '../services/email.js';
import { getClinicName } from '../config/clinic.js';

export function startReminderCron() {
  if (process.env.REMINDER_EMAILS !== 'true') {
    console.log('[reminders] REMINDER_EMAILS is not true — appointment reminder cron disabled');
    return;
  }

  cron.schedule('0 8 * * *', async () => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayStart = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
      const dayEnd = new Date(
        tomorrow.getFullYear(),
        tomorrow.getMonth(),
        tomorrow.getDate(),
        23,
        59,
        59,
        999
      );

      const appointments = await Appointment.find({
        date: { $gte: dayStart, $lte: dayEnd },
        status: 'scheduled',
        reminderEmailSentAt: null,
      }).populate('patientId', 'email firstName lastName');

      const clinic = getClinicName();
      let sent = 0;

      for (const apt of appointments) {
        const patient = apt.patientId;
        if (!patient?.email) continue;

        const dateStr = apt.date.toLocaleDateString(undefined, {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        });
        const subject = `Appointment reminder — ${clinic}`;
        const text = `Hello ${patient.firstName},

This is a reminder from ${clinic}: you have an appointment on ${dateStr} at ${apt.time}.

If you need to reschedule, contact the clinic.`;

        await sendMail({
          to: patient.email,
          subject,
          text,
        });

        apt.reminderEmailSentAt = new Date();
        await apt.save();
        sent += 1;
      }

      console.log(`[reminders] processed ${appointments.length} appointments, sent ${sent} emails`);
    } catch (err) {
      console.error('[reminders] job failed:', err);
    }
  });

  console.log('[reminders] cron scheduled (daily 08:00 server time)');
}
