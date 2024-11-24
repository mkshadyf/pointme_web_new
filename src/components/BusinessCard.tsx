import { Link } from 'react-router-dom';
import { Card, CardContent } from './ui/Card';
import { MapPin, Clock, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Tables } from '../lib/supabase';

type Business = Tables['businesses']['Row'];

interface BusinessCardProps {
  business: Business;
}

export function BusinessCard({ business }: BusinessCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
    >
      <Link to={`/businesses/${business.id}`}>
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            {business.logo_url && (
              <div className="h-48 relative">
                <img
                  src={business.logo_url}
                  alt={business.name}
                  className="w-full h-full object-cover"
                />
                {business.rating && (
                  <div className="absolute top-4 right-4 bg-white rounded-full px-2 py-1 flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-medium">{business.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            )}
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{business.name}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {business.description}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                {business.address && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{business.address}</span>
                  </div>
                )}
                {business.status === 'approved' && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Open</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
} 