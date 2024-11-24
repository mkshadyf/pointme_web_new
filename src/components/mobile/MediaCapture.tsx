import { useState } from 'react';
import { Camera, Image, Video } from 'lucide-react';
import { motion } from 'framer-motion';
import { mobileDeviceService } from '../../services/mobileDeviceService';
import { Button } from '../ui/Button';
import { BottomSheet } from './BottomSheet';

interface MediaCaptureProps {
  onCapture: (mediaUrl: string) => void;
  type?: 'photo' | 'video';
  maxDuration?: number;
}

export function MediaCapture({ onCapture, type = 'photo', maxDuration = 30 }: MediaCaptureProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const handleCapture = async () => {
    try {
      const media = await mobileDeviceService.takePicture();
      onCapture(media);
      setIsOpen(false);
    } catch (error) {
      console.error('Media capture error:', error);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="rounded-full"
      >
        {type === 'photo' ? <Camera className="w-6 h-6" /> : <Video className="w-6 h-6" />}
      </Button>

      <BottomSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={type === 'photo' ? 'Take Photo' : 'Record Video'}
      >
        <div className="space-y-4">
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
            {/* Camera preview will be rendered here */}
            <div id="camera-preview" className="w-full h-full" />
          </div>

          <div className="flex justify-center">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleCapture}
              className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center"
            >
              <div className="w-14 h-14 rounded-full bg-red-600" />
            </motion.button>
          </div>
        </div>
      </BottomSheet>
    </>
  );
} 