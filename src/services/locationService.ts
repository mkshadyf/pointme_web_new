import { supabase } from '../lib/supabase';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface LocationPreferences {
  maxDistance: number;
  useCurrentLocation: boolean;
  savedLocations: string[];
}

export const locationService = {
  async getCurrentPosition(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        { enableHighAccuracy: true }
      );
    });
  },

  async findNearbyProviders(coordinates: Coordinates, radius: number = 10) {
    const { data, error } = await supabase
      .rpc('find_nearby_providers', {
        lat: coordinates.latitude,
        lng: coordinates.longitude,
        radius_km: radius,
      });

    if (error) throw error;
    return data;
  },

  async saveLocationPreferences(preferences: LocationPreferences) {
    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        location_preferences: preferences,
      });

    if (error) throw error;
  },
}; 