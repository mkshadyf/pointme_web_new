import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';
import type { Category } from '../../lib/supabase';

interface CategoryForm {
  name: string;
  description: string;
  icon: string;
}

export default function AdminCategories() {
  const queryClient = useQueryClient();
  const [newCategory, setNewCategory] = useState<CategoryForm>({
    name: '',
    description: '',
    icon: '',
  });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const { data: categories, isLoading } = useQuery<Category[]>({
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

  const createMutation = useMutation({
    mutationFn: async (category: CategoryForm) => {
      const { error } = await supabase
        .from('categories')
        .insert(category);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setNewCategory({ name: '', description: '', icon: '' });
      toast.success('Category added successfully');
    },
    onError: () => {
      toast.error('Failed to add category');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (category: Category) => {
      const { error } = await supabase
        .from('categories')
        .update({
          name: category.name,
          description: category.description,
          icon: category.icon,
        })
        .eq('id', category.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setEditingCategory(null);
      toast.success('Category updated successfully');
    },
    onError: () => {
      toast.error('Failed to update category');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete category');
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Category</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate(newCategory);
            }}
            className="space-y-4"
          >
            <Input
              placeholder="Category Name"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              required
            />
            <Input
              placeholder="Description"
              value={newCategory.description}
              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              required
            />
            <Input
              placeholder="Icon (emoji or icon class)"
              value={newCategory.icon}
              onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
              required
            />
            <Button type="submit" disabled={createMutation.isPending}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manage Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories?.map((category) => (
              <div key={category.id} className="border rounded-md p-4">
                {editingCategory?.id === category.id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (editingCategory) {
                        updateMutation.mutate(editingCategory);
                      }
                    }}
                    className="space-y-4"
                  >
                    <Input
                      value={editingCategory.name}
                      onChange={(e) =>
                        setEditingCategory(prev => prev ? { ...prev, name: e.target.value } : null)
                      }
                      required
                    />
                    <Input
                      value={editingCategory.description || ''}
                      onChange={(e) =>
                        setEditingCategory(prev => prev ? { ...prev, description: e.target.value } : null)
                      }
                      required
                    />
                    <Input
                      value={editingCategory.icon || ''}
                      onChange={(e) =>
                        setEditingCategory(prev => prev ? { ...prev, icon: e.target.value } : null)
                      }
                      required
                    />
                    <div className="flex gap-2">
                      <Button type="submit" disabled={updateMutation.isPending}>
                        Save
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setEditingCategory(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{category.icon}</span>
                      <h3 className="font-bold">{category.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      {category.description}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingCategory(category)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this category?')) {
                            deleteMutation.mutate(category.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}