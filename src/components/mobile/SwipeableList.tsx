import { useRef } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { useGestures } from '../../hooks/useGestures';
import { mobileDeviceService } from '../../services/mobileDeviceService';

interface SwipeAction {
  label: string;
  color: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface SwipeableListProps {
  items: any[];
  renderItem: (item: any) => React.ReactNode;
  leftAction?: SwipeAction;
  rightAction?: SwipeAction;
}

export function SwipeableList({ items, renderItem, leftAction, rightAction }: SwipeableListProps) {
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleDragEnd = async (info: PanInfo, index: number) => {
    const threshold = 80;
    const offset = info.offset.x;

    if (Math.abs(offset) > threshold) {
      await mobileDeviceService.vibrate('medium');
      if (offset > 0 && leftAction) {
        leftAction.onClick();
      } else if (offset < 0 && rightAction) {
        rightAction.onClick();
      }
    }
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <motion.div
          key={index}
          ref={(el) => (itemRefs.current[index] = el)}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragEnd={(_, info) => handleDragEnd(info, index)}
          className="relative bg-white rounded-lg shadow"
        >
          <div className="absolute inset-y-0 left-0 flex items-center justify-center w-20 bg-green-500 rounded-l-lg">
            {leftAction?.icon}
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center justify-center w-20 bg-red-500 rounded-r-lg">
            {rightAction?.icon}
          </div>
          {renderItem(item)}
        </motion.div>
      ))}
    </div>
  );
} 