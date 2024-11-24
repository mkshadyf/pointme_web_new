import { supabase } from '../src/lib/supabase';

const mockCategories = [
  { name: 'Hair Care', description: 'Haircuts, styling, and treatments' },
  { name: 'Massage', description: 'Therapeutic and relaxation massages' },
  { name: 'Fitness', description: 'Personal training and fitness classes' },
];

const mockServices = [
  {
    name: 'Haircut & Styling',
    description: 'Professional haircut and styling service',
    price: 45,
    duration: 60,
    category_id: '', // Will be filled after categories are inserted
    image_url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviews_count: 120
  },
  {
    name: 'Swedish Massage',
    description: 'Relaxing full-body massage using long, flowing strokes',
    price: 80,
    duration: 60,
    category_id: '', // Will be filled after categories are inserted
    image_url: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviews_count: 95
  },
  {
    name: 'Personal Training Session',
    description: 'One-on-one fitness training tailored to your goals',
    price: 65,
    duration: 45,
    category_id: '', // Will be filled after categories are inserted
    image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    reviews_count: 83
  },
  {
    name: 'Hair Coloring',
    description: 'Professional hair coloring and highlights',
    price: 120,
    duration: 120,
    category_id: '', // Will be filled after categories are inserted
    image_url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviews_count: 156
  },
  {
    name: 'Deep Tissue Massage',
    description: 'Therapeutic massage targeting deep muscle tension',
    price: 90,
    duration: 60,
    category_id: '', // Will be filled after categories are inserted
    image_url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviews_count: 112
  },
  {
    name: 'Group Fitness Class',
    description: 'High-energy group workout session',
    price: 25,
    duration: 45,
    category_id: '', // Will be filled after categories are inserted
    image_url: 'https://images.unsplash.com/photo-1571388208497-71bedc66e932?auto=format&fit=crop&w=800&q=80',
    rating: 4.6,
    reviews_count: 203
  }
];

async function seedDatabase() {
  try {
    // Insert categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .insert(mockCategories)
      .select();

    if (categoriesError) throw categoriesError;

    // Update services with category IDs
    const servicesWithCategories = mockServices.map((service, index) => ({
      ...service,
      category_id: categories[index % categories.length].id
    }));

    // Insert services
    const { error: servicesError } = await supabase
      .from('services')
      .insert(servicesWithCategories);

    if (servicesError) throw servicesError;

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Run the seed script
seedDatabase(); 