import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Shield, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export default function AdminManagement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newAdmin, setNewAdmin] = useState({
    email: '',
    full_name: '',
    password: '',
  });

  // Only super_admin can see all admins, regular admins only see the ones they created
  const { data: admins, isLoading } = useQuery({
    queryKey: ['admins'],
    queryFn: async () => {
      const query = supabase
        .from('profiles')
        .select('*')
        .in('role', ['admin', 'super_admin'])
        .order('created_at', { ascending: false });

      // If not super_admin, only show admins created by this admin
      if (user?.role !== 'super_admin') {
        query.eq('created_by', user?.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (adminData: typeof newAdmin) => {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: adminData.email,
        password: adminData.password,
        options: {
          data: {
            full_name: adminData.full_name,
          }
        }
      });

      if (authError) throw authError;

      // 2. Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user!.id,
          full_name: adminData.full_name,
          email: adminData.email,
          role: 'admin',
          created_by: user?.id,
        });

      if (profileError) throw profileError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      setNewAdmin({ email: '', full_name: '', password: '' });
      toast.success('Admin created successfully');
    },
    onError: () => {
      toast.error('Failed to create admin');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (adminId: string) => {
      // Only allow deletion if super_admin or if the admin was created by the current user
      const { data: adminData } = await supabase
        .from('profiles')
        .select('created_by')
        .eq('id', adminId)
        .single();

      if (!adminData || (user?.role !== 'super_admin' && adminData.created_by !== user?.id)) {
        throw new Error('Unauthorized');
      }

      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', adminId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast.success('Admin removed successfully');
    },
    onError: () => {
      toast.error('Failed to remove admin');
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Only show create form for super_admin or admin */}
      {(user?.role === 'super_admin' || user?.role === 'admin') && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate(newAdmin);
              }}
              className="space-y-4"
            >
              <Input
                placeholder="Full Name"
                value={newAdmin.full_name}
                onChange={(e) => setNewAdmin({ ...newAdmin, full_name: e.target.value })}
                required
              />
              <Input
                type="email"
                placeholder="Email"
                value={newAdmin.email}
                onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={newAdmin.password}
                onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                required
              />
              <Button type="submit" disabled={createMutation.isPending}>
                <Plus className="w-4 h-4 mr-2" />
                Add Admin
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Manage Admins</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {admins?.map((admin) => (
              <motion.div
                key={admin.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-blue-600" />
                          <h3 className="font-semibold">{admin.full_name}</h3>
                        </div>
                        <p className="text-sm text-gray-600">{admin.email}</p>
                        <p className="text-sm">
                          <span className="font-medium">Role:</span>{' '}
                          <span className="capitalize">{admin.role}</span>
                        </p>
                      </div>
                      {/* Only show delete button for super_admin or if the admin was created by current user */}
                      {(user?.role === 'super_admin' || admin.created_by === user?.id) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => {
                            if (confirm('Are you sure you want to remove this admin?')) {
                              deleteMutation.mutate(admin.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 