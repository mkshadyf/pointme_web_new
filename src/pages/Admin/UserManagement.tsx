import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Shield, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import type { Profile } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import toast from 'react-hot-toast';

export default function UserManagement() {
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [newUser, setNewUser] = useState({
    full_name: '',
    role: 'client' as Profile['role'],
    avatar_url: null
  });
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (user: Profile) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(user)
        .eq('id', user.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setEditingUser(null);
      toast.success('User updated successfully');
    },
    onError: () => toast.error('Failed to update user'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
    },
    onError: () => toast.error('Failed to delete user'),
  });

  const createMutation = useMutation({
    mutationFn: async (user: Omit<Profile, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('profiles')
        .insert([user])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setNewUser({
        full_name: '',
        role: 'client',
        avatar_url: null
      });
      toast.success('User created successfully');
    },
    onError: () => toast.error('Failed to create user'),
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
      <Card>
        <CardHeader>
          <CardTitle>Add New User</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate(newUser);
            }}
            className="space-y-4"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                placeholder="Full Name"
                value={newUser.full_name}
                onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                required
              />
              <select
                className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as Profile['role'] })}
                required
              >
                <option value="client">Client</option>
                <option value="provider">Provider</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <Button type="submit" disabled={createMutation.isPending}>
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manage Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {users?.map((user) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardContent className="p-6">
                    {editingUser?.id === user.id ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (editingUser) {
                            updateMutation.mutate(editingUser);
                          }
                        }}
                        className="space-y-4"
                      >
                        <Input
                          value={editingUser?.full_name}
                          onChange={(e) =>
                            setEditingUser((prev) => prev ? { ...prev, full_name: e.target.value } : null)
                          }
                          placeholder="Full Name"
                          required
                        />
                        <select
                          className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                          value={editingUser?.role}
                          onChange={(e) =>
                            setEditingUser((prev) => prev ? { ...prev, role: e.target.value as Profile['role'] } : null)
                          }
                          required
                        >
                          <option value="client">Client</option>
                          <option value="provider">Provider</option>
                          <option value="admin">Admin</option>
                        </select>
                        <div className="flex gap-2">
                          <Button type="submit" disabled={updateMutation.isPending}>
                            Save
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setEditingUser(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div>
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              {user.role === 'admin' ? (
                                <Shield className="w-5 h-5 text-blue-600" />
                              ) : (
                                <User className="w-5 h-5 text-gray-600" />
                              )}
                              <h3 className="font-semibold">{user.full_name}</h3>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm">
                                <span className="font-medium">Role:</span>{' '}
                                <span className="capitalize">{user.role}</span>
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Joined:</span>{' '}
                                {new Date(user.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingUser(user)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this user?')) {
                                  deleteMutation.mutate(user.id);
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
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