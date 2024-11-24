export interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  icon_name: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface CategoryStats {
  category_id: string;
  count: string;
  avg_price: number;
  total_revenue: number;
  active_services: number;
}

export interface CategoryTrend {
  category_id: string;
  month: string;
  bookings_count: number;
  revenue: number;
  avg_price: number;
}

export const CATEGORY_ICONS: { [key: string]: string } = {
  'haircut': '💇',
  'massage': '💆',
  'nails': '💅',
  'spa': '🧖',
  'gym': '🏋️',
  'yoga': '🧘',
  'dental': '🦷',
  'medical': '👨‍⚕️',
  // Add more icons as needed
}; 