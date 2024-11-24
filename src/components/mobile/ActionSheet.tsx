import { motion } from 'framer-motion';
import { BottomSheet } from './BottomSheet';
import { mobileDeviceService } from '../../services/mobileDeviceService';

interface Action {
  icon?: React.ReactNode;
  label: string;
  description?: string;
  onClick: () => void;
  destructive?: boolean;
}

interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  actions: Action[];
}

export function ActionSheet({ isOpen, onClose, title, actions }: ActionSheetProps) {
  const handleAction = async (action: Action) => {
    await mobileDeviceService.vibrate('light');
    action.onClick();
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={title}>
      <div className="divide-y">
        {actions.map((action, index) => (
          <motion.button
            key={index}
            whileTap={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
            onClick={() => handleAction(action)}
            className={`w-full px-4 py-3 flex items-center gap-3 text-left ${
              action.destructive ? 'text-red-600' : ''
            }`}
          >
            {action.icon}
            <div>
              <div className="font-medium">{action.label}</div>
              {action.description && (
                <div className="text-sm text-gray-500">{action.description}</div>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </BottomSheet>
  );
} 