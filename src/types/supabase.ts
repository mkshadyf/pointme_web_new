export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          avatar_url: string | null
          // In the profiles table definition
          role: 'super_admin' | 'admin' | 'provider' | 'client'
          email: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          role?: 'super_admin' | 'admin' | 'provider' | 'client'
          avatar_url?: string | null
          email?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          role?: 'super_admin' | 'admin' | 'provider' | 'client'
          avatar_url?: string | null
          email?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      businesses: {
        Row: {
          id: string
          owner_id: string
          name: string
          description: string | null
          logo_url: string | null
          address: string | null
          city: string | null
          state: string | null
          postal_code: string | null
          phone: string | null
          email: string | null
          website: string | null
          status: 'pending' | 'approved' | 'rejected'
          rating: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          description?: string | null
          logo_url?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          rating?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          description?: string | null
          logo_url?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          rating?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          icon_name: string | null
          slug: string
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string | null
          icon_name?: string | null
          slug?: string
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string | null
          icon_name?: string | null
          slug?: string
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
      }
      services: {
        Row: {
          id: string
          name: string
          description: string
          price: number
          duration: number
          category_id: string
          business_id: string
          image_url: string | null
          rating: number | null
          reviews_count: number
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          price: number
          duration: number
          category_id: string
          business_id: string
          image_url?: string | null
          rating?: number | null
          reviews_count?: number
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          price?: number
          duration?: number
          category_id?: string
          business_id?: string
          image_url?: string | null
          rating?: number | null
          reviews_count?: number
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          service_id: string
          client_id: string
          provider_id: string
          start_time: string
          end_time: string
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          service_id: string
          client_id: string
          provider_id: string
          start_time: string
          end_time: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          service_id?: string
          client_id?: string
          provider_id?: string
          start_time?: string
          end_time?: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export interface BookingWithServiceResponse {
  created_at: string;
  price: number;
  service: {
    category_id: string;
  };
}