import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import ServicesList from '../components/ServicesList';
import BusinessesList from '../components/BusinessesList';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Category } from '../lib/supabase';

export default function Home() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch categories
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/services?search=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white"
        >
          Find and Book Local Services
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
        >
          Discover and book appointments with top local service providers
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <form onSubmit={handleSearch} className="w-full max-w-md flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <Button type="submit">
              Search
            </Button>
          </form>
        </motion.div>
      </section>

      {/* Featured Services */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Featured Services</h2>
          <Button variant="ghost" onClick={() => navigate('/services')}>
            View All
          </Button>
        </div>
        <ServicesList />
      </section>

      {/* Categories Section */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Browse by Category</h2>
          <Button variant="ghost" onClick={() => navigate('/services')}>
            View All Categories
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories?.map((category) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              className="cursor-pointer"
              onClick={() => navigate(`/services?category=${category.id}`)}
            >
              <Card className="text-center hover:shadow-lg transition-shadow dark:bg-gray-800">
                <CardContent className="p-6">
                  <div className="mx-auto w-12 h-12 bg-primary-100 dark:bg-primary-900/10 rounded-full flex items-center justify-center mb-4">
                    <span className="text-primary-600 dark:text-primary-400 text-xl">
                      {category.icon}
                    </span>
                  </div>
                  <h3 className="font-semibold dark:text-white">{category.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {category.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Businesses */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Popular Businesses</h2>
          <Button variant="ghost" onClick={() => navigate('/businesses')}>
            View All
          </Button>
        </div>
        <BusinessesList />
      </section>

      {/* How It Works */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: 'Browse Services',
              description: 'Explore our wide range of professional services',
              icon: <Search className="w-8 h-8 text-primary-600" />,
            },
            {
              title: 'Book Appointment',
              description: 'Choose your preferred time and book instantly',
              icon: <Calendar className="w-8 h-8 text-primary-600" />,
            },
            {
              title: 'Get Service',
              description: 'Enjoy your service from trusted professionals',
              icon: <CheckCircle2 className="w-8 h-8 text-primary-600" />,
            },
          ].map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="mx-auto w-16 h-16 bg-primary-100 dark:bg-primary-900/10 rounded-full flex items-center justify-center mb-4">
                {step.icon}
              </div>
              <h3 className="font-semibold mb-2 dark:text-white">{step.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}