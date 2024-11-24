import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMobile } from '../../contexts/MobileContext';
import { Button } from '../ui/Button';
import { QRScanner } from './QRScanner';
import { locationService } from '../../services/locationService';

interface BookingStep {
  id: string;
  title: string;
  component: React.ReactNode;
}

export function MobileBookingSteps() {
  const { getCurrentPosition, takePicture } = useMobile();
  const [currentStep, setCurrentStep] = useState(0);

  const steps: BookingStep[] = [
    {
      id: 'location',
      title: 'Choose Location',
      component: (
        <LocationStep
          onNext={async () => {
            const position = await getCurrentPosition();
            await locationService.saveLocationPreferences({
              maxDistance: 10,
              useCurrentLocation: true,
              savedLocations: [],
            });
            setCurrentStep(1);
          }}
        />
      ),
    },
    // Add more steps as needed
  ];

  return (
    <div className="h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4"
      >
        <h2 className="text-xl font-semibold mb-4">{steps[currentStep].title}</h2>
        {steps[currentStep].component}
      </motion.div>
    </div>
  );
}

function LocationStep({ onNext }: { onNext: () => Promise<void> }) {
  return (
    <div className="space-y-4">
      <Button onClick={onNext} className="w-full">
        Use Current Location
      </Button>
      {/* Add more location options */}
    </div>
  );
} 