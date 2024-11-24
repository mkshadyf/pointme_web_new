import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { locationService } from '../../services/locationService';
import { mobileBookingService } from '../../services/mobileBookingService';
import { MobileLayout } from '../layouts/MobileLayout';
import { Button } from '../ui/Button';

const steps = ['location', 'service', 'datetime', 'confirmation'] as const;
type Step = typeof steps[number];

interface BookingData {
  location: { latitude: number; longitude: number } | null;
  service: any;
  datetime: string | null;
}

export function MobileBookingFlow() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('location');
  const [bookingData, setBookingData] = useState<BookingData>({
    location: null,
    service: null,
    datetime: null,
  });

  const handleLocationStep = async () => {
    try {
      const coords = await locationService.getCurrentPosition();
      const nearbyProviders = await locationService.findNearbyProviders(coords);
      setBookingData({ ...bookingData, location: coords });
      setCurrentStep('service');
    } catch (error) {
      console.error('Location error:', error);
    }
  };

  const handleConfirmation = async () => {
    try {
      const booking = await mobileBookingService.createBooking(bookingData);
      navigate(`/bookings/${booking.id}/confirmation`, { state: { qrCode: booking.qrCode } });
    } catch (error) {
      console.error('Booking error:', error);
    }
  };

  return (
    <MobileLayout title="Book Service" showBackButton>
      <div className="p-4">
        <AnimatePresence mode="wait">
          {currentStep === 'location' && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <h2 className="text-xl font-semibold mb-4">Choose Location</h2>
              <Button onClick={handleLocationStep}>Use Current Location</Button>
            </motion.div>
          )}

          {/* Add other steps */}
        </AnimatePresence>
      </div>
    </MobileLayout>
  );
} 