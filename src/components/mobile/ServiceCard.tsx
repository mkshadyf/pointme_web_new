import { motion } from 'framer-motion';
import { Share2, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FavoriteButton } from '../FavoriteButton';
import { mobileDeviceService } from '../../services/mobileDeviceService';

interface Service {
  id: string;
  name: string;
  image: string;
  rating: number;
  price: number;
  business: {
    id: string;
    name: string;
  };
}

interface ServiceCardProps {
  service: Service;
  onShare: () => void;
}

export function ServiceCard({ service, onShare }: ServiceCardProps) {
  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    mobileDeviceService.vibrate('light');
    onShare();
  };

  return (
    <Link to={`/services/${service.id}`}>
      <motion.div
        whileTap={{ scale: 0.98 }}
        className="relative rounded-lg overflow-hidden shadow-md bg-white"
      >
        <img
          src={service.image}
          alt={service.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2 flex gap-2">
          <FavoriteButton serviceId={service.id} />
          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-black/50 text-white"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          <h3 className="font-semibold">{service.name}</h3>
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm">{service.rating}</span>
            </div>
            <span className="font-medium">${service.price}</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
} 