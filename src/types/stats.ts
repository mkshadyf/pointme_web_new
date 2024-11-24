export interface CategoryStats {
  category_id: string;
  count: string;
  avg_price: number;
}

export interface ServiceStats {
  total: number;
  active: number;
  categories: CategoryStats[];
} 