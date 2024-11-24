import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Service, Category, Business } from '../../lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import CategorySelect from '../../components/CategorySelect';

interface ServiceForm {
  name: string;
  description: string;
  price: number;
  duration: number;
  category_id: string;
  image_url: string | null;
  business_id: string;
  status: 'active' | 'inactive';
  rating: number | null;
  reviews_count: number;
}

export default function BusinessServices() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [business, setBusiness] = useState<Business | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Fetch business data
  const { isLoading: businessLoading } = useQuery({
    queryKey: ['business', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user?.id)
        .single();
      if (error) throw error;
      setBusiness(data);
      return data;
    },
    enabled: !!user?.id,
  });

  const [newService, setNewService] = useState<ServiceForm>({
    name: '',
    description: '',
    price: 0,
    duration: 30,
    category_id: '',
    image_url: null,
    business_id: '',
    status: 'active',
    rating: null,
    reviews_count: 0,
  });

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

  const { data: services, isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: ['business-services', business?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          categories (
            name,
            description
          )
        `)
        .eq('business_id', business?.id)
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: !!business?.id,
  });

  const createMutation = useMutation({
    mutationFn: async (service: typeof newService) => {
      const { error } = await supabase
        .from('services')
        .insert({
          ...service,
          business_id: business?.id,
          status: 'active',
          reviews_count: 0,
          rating: null,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['business-services', business?.id] 
      });
      setNewService({
        name: '',
        description: '',
        price: 0,
        duration: 30,
        category_id: '',
        image_url: null,
        business_id: '',
        status: 'active',
        rating: null,
        reviews_count: 0,
      });
      toast.success('Service added successfully');
    },
    onError: () => {
      toast.error('Failed to add service');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (service: Service) => {
      const { error } = await supabase
        .from('services')
        .update({
          name: service.name,
          description: service.description,
          price: service.price,
          duration: service.duration,
          category_id: service.category_id,
        })
        .eq('id', service.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['business-services', business?.id] 
      });
      setEditingService(null);
      toast.success('Service updated successfully');
    },
    onError: () => {
      toast.error('Failed to update service');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['business-services', business?.id] 
      });
      toast.success('Service deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete service');
    },
  });

  if (businessLoading || servicesLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Service</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate(newService);
            }}
            className="space-y-4"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Service Name"
                value={newService.name}
                onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                required
              />
              <FormField
                label="Price"
                type="number"
                value={newService.price}
                onChange={(e) => setNewService({ ...newService, price: Number(e.target.value) })}
                required
              />
              <FormField
                label="Duration (minutes)"
                type="number"
                value={newService.duration}
                onChange={(e) => setNewService({ ...newService, duration: Number(e.target.value) })}
                required
              />
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <CategorySelect
                  value={newService.category_id}
                  onChange={(value) => setNewService({ ...newService, category_id: value })}
                  required
                />
              </div>
            </div>
            <textarea
              className="flex w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
              placeholder="Description"
              value={newService.description}
              onChange={(e) => setNewService({ ...newService, description: e.target.value })}
              rows={3}
              required
            />
            <Button type="submit" disabled={createMutation.isPending}>
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manage Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services?.map((service) => (
              <div key={service.id} className="border rounded-md p-4">
                {editingService?.id === service.id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (editingService) {
                        updateMutation.mutate(editingService);
                      }
                    }}
                    className="space-y-4"
                  >
                    <Input
                      value={editingService.name}
                      onChange={(e) =>
                        setEditingService((prev) => prev ? { ...prev, name: e.target.value } : null)
                      }
                      required
                    />
                    <Input
                      type="number"
                      value={editingService.price}
                      onChange={(e) =>
                        setEditingService((prev) =>
                          prev ? { ...prev, price: Number(e.target.value) } : null
                        )
                      }
                      required
                    />
                    <Button type="submit" disabled={updateMutation.isPending}>
                      Save
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setEditingService(null)}
                    >
                      Cancel
                    </Button>
                  </form>
                ) : (
                  <div>
                    <h3 className="font-bold">{service.name}</h3>
                    <p>${service.price}</p>
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingService(service)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this service?')) {
                            deleteMutation.mutate(service.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 