import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { qrService } from '../../services/qrService';
import { Button } from '../ui/Button';

interface QRScannerProps {
  onScan: (booking: unknown) => void;
  onError: (error: Error) => void;
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    scannerRef.current = new Html5Qrcode('qr-reader');

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop();
      }
    };
  }, []);

  const handleDecode = async (decodedText: string) => {
    try {
      const booking = await qrService.verifyBookingQR(decodedText);
      onScan(booking);
    } catch (error) {
      onError(error as Error);
    }
  };

  const startScanning = async () => {
    try {
      await scannerRef.current?.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        handleDecode,
        () => {}
      );
    } catch (error) {
      onError(error as Error);
    }
  };

  return (
    <div className="space-y-4">
      <div id="qr-reader" className="w-full max-w-sm mx-auto" />
      <Button onClick={startScanning}>Start Scanning</Button>
    </div>
  );
} 