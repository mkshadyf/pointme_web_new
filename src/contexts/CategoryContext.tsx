import { createContext, useContext, useState } from 'react';
import { useCategories } from '../hooks/useCategories';
import { useCategoryStats } from '../hooks/useCategoryStats';
import type { Category } from '../types/category';

interface CategoryContextType {
  selectedCategory: string | null;
  setSelectedCategory: (categoryId: string | null) => void;
  categories: Category[] | undefined;
  isLoading: boolean;
  getCategoryName: (id: string) => string;
  getCategoryIcon: (id: string) => string | undefined;
  stats: {
    totalServices: number;
    averagePrice: number;
    totalRevenue: number;
    activeServices: number;
    getCategoryStats: (categoryId: string) => any;
  };
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { 
    categories, 
    isLoading, 
    getCategoryName,
    getCategoryIcon 
  } = useCategories();
  
  const { 
    getTotalServices, 
    getAveragePrice, 
    getTotalRevenue,
    getActiveServices,
    getCategoryStats 
  } = useCategoryStats();

  return (
    <CategoryContext.Provider
      value={{
        selectedCategory,
        setSelectedCategory,
        categories,
        isLoading,
        getCategoryName,
        getCategoryIcon,
        stats: {
          totalServices: getTotalServices(),
          averagePrice: getAveragePrice(),
          totalRevenue: getTotalRevenue(),
          activeServices: getActiveServices(),
          getCategoryStats,
        },
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategory() {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategory must be used within a CategoryProvider');
  }
  return context;
} 