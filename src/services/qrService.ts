import QRCode from 'qrcode';
import { supabase } from '../lib/supabase';

export const qrService = {
  async generateBookingQR(bookingId: string): Promise<string> {
    const { data } = await supabase
      .storage.from('qr-codes')
      .upload(
        `bookings/${bookingId}.png`,
        await QRCode.toBuffer(JSON.stringify({ type: 'booking', id: bookingId })),
        { contentType: 'image/png', upsert: true }
      );

    if (!data) throw new Error('Failed to generate QR code');

    const { data: { publicUrl } } = supabase
      .storage.from('qr-codes')
      .getPublicUrl(`bookings/${bookingId}.png`);

    return publicUrl;
  },

  async verifyBookingQR(qrData: string) {
    try {
      const data = JSON.parse(qrData);
      if (data.type !== 'booking') throw new Error('Invalid QR code type');

      const { data: booking, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', data.id)
        .single();

      if (error) throw error;
      return booking;
    } catch (error) {
      throw new Error('Invalid QR code');
    }
  },
}; 