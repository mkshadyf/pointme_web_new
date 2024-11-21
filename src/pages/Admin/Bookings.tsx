import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, User, Building2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';
import type { Booking, Service, Profile } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import toast from 'react-hot-toast';

type BookingWithDetails = Booking & {
  services: Service;
  profiles: Profile;
  provider: Profile;
};

const statusIcons = {
  pending: <AlertCircle className="w-5 h-5 text-yellow-500" />,
  confirmed: <CheckCircle2 className="w-5 h-5 text-green-500" />,
  cancelled: <XCircle className="w-5 h-5 text-red-500" />,
  completed: <CheckCircle2 className="w-5 h-5 text-blue-500" />,
};

export default function Bookings() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<Booking['status'] | 'all'>('all');

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          services (*),
          profiles!bookings_client_id_fkey (*),
          provider:profiles!bookings_provider_id_fkey (*)
        `)
        .order('start_time', { ascending: false });
      
      if (error) throw error;
      return data as BookingWithDetails[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Booking['status'] }) => {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast.success('Booking status updated');
    },
    onError: () => toast.error('Failed to update booking status'),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const filteredBookings = bookings?.filter(
    booking => statusFilter === 'all' || booking.status === statusFilter
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('all')}
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'pending' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('pending')}
            >
              Pending
            </Button>
            <Button
              variant={statusFilter === 'confirmed' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('confirmed')}
            >
              Confirmed
            </Button>
            <Button
              variant={statusFilter === 'completed' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('completed')}
            >
              Completed
            </Button>
            <Button
              variant={statusFilter === 'cancelled' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('cancelled')}
            >
              Cancelled
            </Button>
          </div>

          <div className="grid gap-4">
            {filteredBookings?.map((booking) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          {statusIcons[booking.status]}
                          <h3 className="font-semibold">{booking.services.name}</h3>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(booking.start_time), 'PPP')}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            {format(new Date(booking.start_time), 'p')} - 
                            {format(new Date(booking.end_time), 'p')}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="w-4 h-4" />
                            Client: {booking.profiles.full_name}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Building2 className="w-4 h-4" />
                            Provider: {booking.provider.full_name}
                          </div>
                        </div>

                        {booking.notes && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Notes:</span> {booking.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {booking.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              className="text-green-600"
                              onClick={() => updateMutation.mutate({ id: booking.id, status: 'confirmed' })}
                            >
                              Confirm
                            </Button>
                            <Button
                              variant="outline"
                              className="text-red-600"
                              onClick={() => updateMutation.mutate({ id: booking.id, status: 'cancelled' })}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                        {booking.status === 'confirmed' && (
                          <Button
                            variant="outline"
                            className="text-blue-600"
                            onClick={() => updateMutation.mutate({ id: booking.id, status: 'completed' })}
                          >
                            Mark as Completed
                          </Button>
                        )}
                      </div>
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