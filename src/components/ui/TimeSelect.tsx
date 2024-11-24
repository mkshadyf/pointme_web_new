import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { format, addMinutes, parse, isAfter, isBefore } from 'date-fns';
import { cn } from '../../lib/utils';

interface TimeSlot {
  time: string;
  available: boolean;
}

interface TimeSelectProps {
  value?: string;
  onChange: (time: string) => void;
  duration: number;
  businessId: string;
  selectedDate?: Date;
  className?: string;
}

export function TimeSelect({
  value,
  onChange,
  duration,
  businessId,
  selectedDate = new Date(),
  className,
}: TimeSelectProps) {
  // Fetch business hours
  const { data: businessHours } = useQuery({
    queryKey: ['business-hours', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_hours')
        .select('*')
        .eq('business_id', businessId)
        .eq('day', format(selectedDate, 'EEEE').toLowerCase())
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Fetch existing bookings
  const { data: existingBookings } = useQuery({
    queryKey: ['bookings', businessId, selectedDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('start_time, end_time')
        .eq('business_id', businessId)
        .gte('start_time', format(selectedDate, 'yyyy-MM-dd'))
        .lt('start_time', format(addMinutes(selectedDate, 1440), 'yyyy-MM-dd'))
        .not('status', 'eq', 'cancelled');

      if (error) throw error;
      return data;
    },
  });

  // Generate time slots
  const timeSlots = generateTimeSlots(
    businessHours?.start_time || '09:00',
    businessHours?.end_time || '17:00',
    duration,
    existingBookings || [],
    selectedDate
  );

  return (
    <div className={cn("grid grid-cols-4 gap-2", className)}>
      {timeSlots.map((slot) => (
        <button
          key={slot.time}
          onClick={() => slot.available && onChange(slot.time)}
          disabled={!slot.available}
          className={cn(
            "px-3 py-2 text-sm rounded-md transition-colors",
            slot.available
              ? "hover:bg-primary-50 dark:hover:bg-primary-900/10"
              : "opacity-50 cursor-not-allowed",
            value === slot.time && "bg-primary-100 dark:bg-primary-900/20"
          )}
        >
          {format(parse(slot.time, 'HH:mm', new Date()), 'h:mm a')}
        </button>
      ))}
    </div>
  );
}

function generateTimeSlots(
  startTime: string,
  endTime: string,
  duration: number,
  existingBookings: { start_time: string; end_time: string }[],
  selectedDate: Date
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const start = parse(startTime, 'HH:mm', selectedDate);
  const end = parse(endTime, 'HH:mm', selectedDate);
  let current = start;

  while (isBefore(current, end)) {
    const timeString = format(current, 'HH:mm');
    const slotEnd = addMinutes(current, duration);

    // Check if slot is available
    const isSlotAvailable = !existingBookings.some(booking => {
      const bookingStart = new Date(booking.start_time);
      const bookingEnd = new Date(booking.end_time);
      return (
        (isAfter(current, bookingStart) && isBefore(current, bookingEnd)) ||
        (isAfter(slotEnd, bookingStart) && isBefore(slotEnd, bookingEnd))
      );
    });

    slots.push({
      time: timeString,
      available: isSlotAvailable,
    });

    current = addMinutes(current, 30); // 30-minute intervals
  }

  return slots;
} 