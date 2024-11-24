export type StaffRole = 'staff' | 'manager' | 'admin';
export type StaffStatus = 'active' | 'inactive';

export interface Staff {
  id: string;
  business_id: string;
  full_name: string;
  email: string;
  phone: string;
  role: StaffRole;
  status: StaffStatus;
  avatar_url?: string | null;
  specialties?: string[];
  schedule?: {
    days: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[];
    start_time: string;
    end_time: string;
  };
  created_at: string;
  updated_at: string;
}

export interface StaffForm {
  full_name: string;
  email: string;
  phone: string;
  role: StaffRole;
  status: StaffStatus;
  avatar_url?: string;
  specialties?: string[];
  schedule?: Staff['schedule'];
}

export const STAFF_ROLES: { value: StaffRole; label: string }[] = [
  { value: 'staff', label: 'Staff Member' },
  { value: 'manager', label: 'Manager' },
  { value: 'admin', label: 'Admin' },
];