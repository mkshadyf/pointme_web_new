import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Card, CardContent } from './ui/Card';
import { formatPrice } from '../lib/utils';
import { Clock, MapPin, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import CategoryBadge from './CategoryBadge';
import type { Service } from '../lib/supabase';
import { Link } from 'react-router-dom';

interface ServiceWithRelations extends Service {
  business: {
    name: string;
    address: string;
  };
  category: {
    name: string;
    id: string;
  };
}

export default function ServicesList() {
  const { data: services, isLoading, error, isError } = useQuery<ServiceWithRelations[]>({
    queryKey: ['featured-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          business:businesses(name, address),
          category:categories(name, id)
        `)
        .eq('status', 'active')
        .order('rating', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-lg mb-4" />
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Failed to load services</p>
        <button 
          onClick={() => window.location.reload()}
          className="text-primary-600 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!services?.length) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        No services available at the moment
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service, index) => (
        <motion.div
          key={service.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Link to={`/services/${service.id}`}>
            <Card className="group hover:shadow-lg transition-shadow overflow-hidden">
              <CardContent className="p-6">
                {service.image_url && (
                  <div className="relative h-48 -mx-6 -mt-6 mb-4 overflow-hidden">
                    <img
                      src={service.image_url}
                      alt={service.name}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <CategoryBadge categoryId={service.category.id} />
                    </div>
                  </div>
                )}
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary-600 transition-colors">
                  {service.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                  {service.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-primary-600 text-lg">
                    {formatPrice(service.price)}
                  </span>
                  <div className="flex items-center gap-4 text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {service.duration}min
                    </span>
                    {service.rating && (
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        {service.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-gray-500">
                  <span className="font-medium">{service.business.name}</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {service.business.address}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}