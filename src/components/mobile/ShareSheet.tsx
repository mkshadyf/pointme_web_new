import { Share2, Link, MessageCircle, Mail } from 'lucide-react';
import { BottomSheet } from './BottomSheet';
import { mobileDeviceService } from '../../services/mobileDeviceService';

interface ShareSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  text: string;
  url?: string;
}

export function ShareSheet({ isOpen, onClose, title, text, url }: ShareSheetProps) {
  const shareOptions = [
    {
      icon: <MessageCircle className="w-6 h-6" />,
      label: 'Message',
      action: () => mobileDeviceService.shareContent(title, text, url),
    },
    {
      icon: <Mail className="w-6 h-6" />,
      label: 'Email',
      action: () => window.location.href = `mailto:?subject=${title}&body=${text}${url ? '\n\n' + url : ''}`,
    },
    {
      icon: <Link className="w-6 h-6" />,
      label: 'Copy Link',
      action: () => {
        navigator.clipboard.writeText(url || window.location.href);
        onClose();
      },
    },
  ];

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Share">
      <div className="grid grid-cols-4 gap-4 p-4">
        {shareOptions.map((option) => (
          <button
            key={option.label}
            onClick={option.action}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              {option.icon}
            </div>
            <span className="text-sm">{option.label}</span>
          </button>
        ))}
      </div>
    </BottomSheet>
  );
} 