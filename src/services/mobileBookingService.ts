import { supabase } from '../lib/supabase';
import { locationService } from './locationService';
import { qrService } from './qrService';

interface BookingData {
  location: { latitude: number; longitude: number } | null;
  service: any;
  datetime: string | null;
}

interface Provider {
  id: string;
  // ... other provider properties
}

export const mobileBookingService = {
  async createBooking(data: BookingData) {
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        service_id: data.service?.id,
        start_time: data.datetime,
        location: data.location ? {
          type: 'Point',
          coordinates: [data.location.longitude, data.location.latitude]
        } : null,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    // Generate QR code for the booking
    const qrCode = await qrService.generateBookingQR(booking.id);

    return { ...booking, qrCode };
  },

  async findNearbySlots(coordinates: { latitude: number; longitude: number }) {
    const providers = await locationService.findNearbyProviders(coordinates);

    const { data: availableSlots, error } = await supabase
      .rpc('get_available_slots', {
        provider_ids: providers.map((p: Provider) => p.id),
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      });

    if (error) throw error;
    return availableSlots;
  }
}; 