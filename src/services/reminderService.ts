import { supabase } from '../lib/supabase';
import type { BookingReminder } from '../types/booking';

export const reminderService = {
  async scheduleReminder(bookingId: string, type: 'email' | 'sms' | 'push', scheduledFor: string) {
    const { data, error } = await supabase
      .from('booking_reminders')
      .insert({
        bookingId,
        type,
        scheduledFor,
        status: 'pending',
        attempts: 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async processReminders() {
    const { data: reminders, error } = await supabase
      .from('booking_reminders')
      .select(`
        *,
        booking:bookings(
          *,
          client:profiles!client_id(*),
          service:services(*)
        )
      `)
      .eq('status', 'pending')
      .lte('scheduledFor', new Date().toISOString());

    if (error) throw error;

    for (const reminder of reminders) {
      try {
        switch (reminder.type) {
          case 'email':
            await this.sendEmailReminder(reminder);
            break;
          case 'sms':
            await this.sendSMSReminder(reminder);
            break;
          case 'push':
            await this.sendPushReminder(reminder);
            break;
        }

        await supabase
          .from('booking_reminders')
          .update({
            status: 'sent',
            attempts: reminder.attempts + 1,
          })
          .eq('id', reminder.id);
      } catch (error) {
        console.error('Error processing reminder:', error);

        await supabase
          .from('booking_reminders')
          .update({
            status: reminder.attempts >= 2 ? 'failed' : 'pending',
            attempts: reminder.attempts + 1,
          })
          .eq('id', reminder.id);
      }
    }
  },

  private async sendEmailReminder(reminder: BookingReminder) {
    // Implement email sending logic
  },

  private async sendSMSReminder(reminder: BookingReminder) {
    // Implement SMS sending logic
  },

  private async sendPushReminder(reminder: BookingReminder) {
    // Implement push notification logic
  },
}; 