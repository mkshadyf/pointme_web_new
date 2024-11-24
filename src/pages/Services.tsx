import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { supabase } from '../lib/supabase';
import type { Service, Category } from '../lib/supabase';

interface ServiceWithRelations extends Service {
  categories: {
    name: string;
    description: string;
  };
  businesses: {
    name: string;
    city: string;
    state: string;
  };
}

interface ServiceFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
}

const DEFAULT_SERVICE_IMAGE = '/default-service.jpg';

export default function Services() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ServiceFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  // Fetch categories for filter
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  // Fetch services with filters
  const { data: services, isLoading } = useQuery<ServiceWithRelations[]>({
    queryKey: ['services', searchTerm, filters],
    queryFn: async () => {
      let query = supabase
        .from('services')
        .select(`
          *,
          categories (
            name,
            description
          ),
          businesses (
            name,
            city,
            state
          )
        `)
        .eq('status', 'active');

      // Apply search filter
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      // Apply category filter
      if (filters.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }

      // Apply price range filter
      if (filters.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }

      // Apply rating filter
      if (filters.rating !== undefined) {
        query = query.gte('rating', filters.rating);
      }

      const { data, error } = await query.order('rating', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleFilterChange = (newFilters: Partial<ServiceFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-600 mt-2">Find and book the perfect service for you</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search services..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-5 w-5" />
            Filter
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  className="w-full border rounded-lg p-2"
                  value={filters.categoryId || ''}
                  onChange={(e) => handleFilterChange({ categoryId: e.target.value || undefined })}
                >
                  <option value="">All Categories</option>
                  {categories?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full border rounded-lg p-2"
                    value={filters.minPrice || ''}
                    onChange={(e) => handleFilterChange({ 
                      minPrice: e.target.value ? Number(e.target.value) : undefined 
                    })}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full border rounded-lg p-2"
                    value={filters.maxPrice || ''}
                    onChange={(e) => handleFilterChange({ 
                      maxPrice: e.target.value ? Number(e.target.value) : undefined 
                    })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rating
                </label>
                <select
                  className="w-full border rounded-lg p-2"
                  value={filters.rating || ''}
                  onChange={(e) => handleFilterChange({ 
                    rating: e.target.value ? Number(e.target.value) : undefined 
                  })}
                >
                  <option value="">Any Rating</option>
                  <option value="4.5">4.5+</option>
                  <option value="4">4+</option>
                  <option value="3.5">3.5+</option>
                  <option value="3">3+</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : services?.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-600">
            No services found matching your criteria.
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services?.map((service) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <img
                  src={service.image_url || DEFAULT_SERVICE_IMAGE}
                  alt={service.name}
                  className="w-full h-48 object-cover"
                />
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{service.name}</CardTitle>
                      <p className="text-gray-600 text-sm">
                        {service.businesses?.name} • {service.businesses?.city}, {service.businesses?.state}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {service.categories?.name}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {service.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      <span className="font-medium">{service.rating}</span>
                      <span className="text-gray-600 text-sm">
                        ({service.reviews_count})
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-semibold text-primary-600">
                        ${service.price}
                      </span>
                      <Button>
                        Book Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}