import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { LoadingState } from '../../components/LoadingState';
import { ErrorMessage } from '../../components/ErrorMessage';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import type { Business } from '../../lib/supabase';
import type { Staff, StaffForm } from '../../types/staff';
import { useStaff } from '../../hooks/useStaff';

const STAFF_ROLES = [
  { value: 'staff', label: 'Staff Member' },
  { value: 'manager', label: 'Manager' },
  { value: 'admin', label: 'Admin' },
];

export default function BusinessStaff() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [business, setBusiness] = useState<Business | null>(null);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<Staff['role'] | 'all'>('all');

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

  const {
    staffMembers,
    isLoading: staffLoading,
    error,
    createStaff,
    updateStaff,
    deleteStaff,
  } = useStaff(business?.id);

  // Filter staff members
  const filteredStaff = staffMembers?.filter(staff => {
    const matchesSearch = staff.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || staff.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (businessLoading || staffLoading) {
    return <LoadingState message="Loading staff members..." />;
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      {staffMembers && <StaffStats staffMembers={staffMembers} />}

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:max-w-xs"
            />
            <Select
              value={filterRole}
              onValueChange={(value) => setFilterRole(value as Staff['role'] | 'all')}
              options={[
                { value: 'all', label: 'All Roles' },
                ...STAFF_ROLES
              ]}
            />
            <Button
              onClick={() => setShowAddStaff(true)}
              className="md:ml-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Staff
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Staff List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredStaff?.map((staff) => (
          <Card key={staff.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{staff.full_name}</h3>
                  <p className="text-sm text-gray-600">{staff.email}</p>
                  <p className="text-sm text-gray-600">{staff.phone}</p>
                  <p className="text-sm font-medium capitalize mt-2">
                    Role: {staff.role}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingStaff(staff)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => setConfirmDelete(staff.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Staff Dialog */}
      {(showAddStaff || editingStaff) && (
        <StaffForm
          staff={editingStaff}
          onSubmit={async (data) => {
            try {
              if (editingStaff) {
                await updateStaff.mutateAsync({ ...editingStaff, ...data });
                toast.success('Staff member updated');
              } else {
                await createStaff.mutateAsync(data);
                toast.success('Staff member added');
              }
              setShowAddStaff(false);
              setEditingStaff(null);
            } catch (error) {
              toast.error('Failed to save staff member');
            }
          }}
          onCancel={() => {
            setShowAddStaff(false);
            setEditingStaff(null);
          }}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={async () => {
          if (confirmDelete) {
            try {
              await deleteStaff.mutateAsync(confirmDelete);
              toast.success('Staff member removed');
            } catch (error) {
              toast.error('Failed to remove staff member');
            }
            setConfirmDelete(null);
          }
        }}
        title="Remove Staff Member"
        message="Are you sure you want to remove this staff member? This action cannot be undone."
        confirmText="Remove"
        type="danger"
      />
    </div>
  );
}

// Stats Component
const StaffStats = ({ staffMembers }: { staffMembers: Staff[] }) => {
  const totalStaff = staffMembers.length;
  const activeStaff = staffMembers.filter(s => s.status === 'active').length;
  const staffByRole = staffMembers.reduce((acc, staff) => {
    acc[staff.role] = (acc[staff.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm text-gray-500">Total Staff</h3>
          <p className="text-2xl font-bold">{totalStaff}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm text-gray-500">Active Staff</h3>
          <p className="text-2xl font-bold">{activeStaff}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm text-gray-500">Staff by Role</h3>
          {Object.entries(staffByRole).map(([role, count]) => (
            <div key={role} className="flex justify-between items-center">
              <span className="capitalize">{role}</span>
              <span className="font-semibold">{count}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

// Staff Form Component
const StaffForm = ({
  staff,
  onSubmit,
  onCancel,
}: {
  staff?: Staff | null;
  onSubmit: (data: StaffForm) => void;
  onCancel: () => void;
}) => {
  const [form, setForm] = useState<StaffForm>({
    full_name: staff?.full_name || '',
    email: staff?.email || '',
    phone: staff?.phone || '',
    role: staff?.role || 'staff',
    status: staff?.status || 'active',
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{staff ? 'Edit Staff Member' : 'Add Staff Member'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => {
          e.preventDefault();
          onSubmit(form);
        }} 
        className="space-y-4">
          <Input
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            placeholder="Full Name"
            required
          />
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Email"
            required
          />
          <Input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="Phone"
            required
          />
          <Select
            value={form.role}
            onValueChange={(value) => setForm({ ...form, role: value as Staff['role'] })}
            options={STAFF_ROLES}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {staff ? 'Save Changes' : 'Add Staff Member'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

// Staff Availability Component
const StaffAvailability = ({ staffId }: { staffId: string }) => {
  const [schedule, setSchedule] = useState<Record<string, { start: string; end: string; enabled: boolean }>>({
    monday: { start: '09:00', end: '17:00', enabled: true },
    tuesday: { start: '09:00', end: '17:00', enabled: true },
    wednesday: { start: '09:00', end: '17:00', enabled: true },
    thursday: { start: '09:00', end: '17:00', enabled: true },
    friday: { start: '09:00', end: '17:00', enabled: true },
    saturday: { start: '09:00', end: '17:00', enabled: false },
    sunday: { start: '09:00', end: '17:00', enabled: false },
  });

  const updateSchedule = useMutation({
    mutationFn: async (newSchedule: typeof schedule) => {
      const { error } = await supabase
        .from('staff')
        .update({ schedule: newSchedule })
        .eq('id', staffId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Schedule updated successfully');
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Availability Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(schedule).map(([day, hours]) => (
            <div key={day} className="flex items-center gap-4">
              <div className="w-32 capitalize">{day}</div>
              <Input
                type="time"
                value={hours.start}
                onChange={(e) => setSchedule({
                  ...schedule,
                  [day]: { ...hours, start: e.target.value }
                })}
                disabled={!hours.enabled}
                className="w-32"
              />
              <Input
                type="time"
                value={hours.end}
                onChange={(e) => setSchedule({
                  ...schedule,
                  [day]: { ...hours, end: e.target.value }
                })}
                disabled={!hours.enabled}
                className="w-32"
              />
              <Button
                type="button"
                variant={hours.enabled ? 'default' : 'outline'}
                onClick={() => setSchedule({
                  ...schedule,
                  [day]: { ...hours, enabled: !hours.enabled }
                })}
              >
                {hours.enabled ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
          ))}
          <Button 
            onClick={() => updateSchedule.mutate(schedule)}
            className="mt-4"
          >
            Save Schedule
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Staff Services Component
const StaffServices = ({ staffId }: { staffId: string }) => {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const { data: services } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('status', 'active');
      if (error) throw error;
      return data;
    },
  });

  const updateServices = useMutation({
    mutationFn: async (serviceIds: string[]) => {
      const { error } = await supabase
        .from('staff_services')
        .upsert(
          serviceIds.map(serviceId => ({
            staff_id: staffId,
            service_id: serviceId,
          }))
        );
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Services updated successfully');
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Services & Specialties</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {services?.map((service) => (
            <div key={service.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedServices.includes(service.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedServices([...selectedServices, service.id]);
                  } else {
                    setSelectedServices(selectedServices.filter(id => id !== service.id));
                  }
                }}
                className="rounded border-gray-300"
              />
              <span>{service.name}</span>
            </div>
          ))}
          <Button 
            onClick={() => updateServices.mutate(selectedServices)}
            className="mt-4"
          >
            Save Services
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Staff Performance Component
const StaffPerformance = ({ staffId }: { staffId: string }) => {
  const { data: metrics } = useQuery({
    queryKey: ['staff-performance', staffId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff_metrics')
        .select('*')
        .eq('staff_id', staffId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Bookings</h4>
            <p className="text-2xl font-bold">{metrics?.total_bookings || 0}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Revenue</h4>
            <p className="text-2xl font-bold">${metrics?.total_revenue || 0}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Rating</h4>
            <p className="text-2xl font-bold">{metrics?.average_rating || 0}/5</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Reviews</h4>
            <p className="text-2xl font-bold">{metrics?.review_count || 0}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 