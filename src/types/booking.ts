export type RecurringFrequency = 'daily' | 'weekly' | 'monthly';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'waitlisted';
export type ResourceType = 'room' | 'equipment' | 'staff';

export interface RecurringBooking {
  id: string;
  serviceId: string;
  clientId: string;
  frequency: RecurringFrequency;
  intervalCount: number;
  startDate: string;
  endDate?: string;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  timeOfDay: string;
  status: BookingStatus;
}

export interface WaitlistEntry {
  id: string;
  serviceId: string;
  clientId: string;
  preferredDate: string;
  preferredTime: string;
  notes?: string;
  status: 'pending' | 'notified' | 'booked' | 'expired';
  notifiedAt?: string;
}

export interface GroupBooking {
  id: string;
  serviceId: string;
  organizerId: string;
  participants: string[];
  maxParticipants: number;
  startTime: string;
  endTime: string;
  status: BookingStatus;
}

export interface Resource {
  id: string;
  type: ResourceType;
  name: string;
  capacity?: number;
  availability: {
    [date: string]: {
      [timeSlot: string]: boolean;
    };
  };
}

export interface BookingReminder {
  id: string;
  bookingId: string;
  type: 'email' | 'sms' | 'push';
  scheduledFor: string;
  status: 'pending' | 'sent' | 'failed';
  attempts: number;
} 