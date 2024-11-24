import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { MultiSelect } from './ui/MultiSelect';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

const DAYS = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

const CATEGORIES = [
  { value: 'haircut', label: 'Haircut' },
  { value: 'massage', label: 'Massage' },
  { value: 'nails', label: 'Nails' },
  // Add more categories
];

interface CustomerPreference {
  preferred_categories: string[];
  preferred_days: string[];
  preferred_times: string[];
  price_range: {
    min: number;
    max: number;
  };
  location_preference: Record<string, any>;
  special_requirements: string[];
}

interface PreferenceValue {
  preferred_categories: string[];
  preferred_days: string[];
  // ... other preference fields
}

export function CustomerPreferences() {
  const [preferences, setPreferences] = useState<CustomerPreference>({
    preferred_categories: [],
    preferred_days: [],
    preferred_times: [],
    price_range: { min: 0, max: 1000 },
    location_preference: {},
    special_requirements: [],
  });

  const { data: currentPreferences } = useQuery({
    queryKey: ['customer-preferences'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_preferences')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  const updatePreferences = useMutation({
    mutationFn: async (preferences: any) => {
      const { data, error } = await supabase
        .from('customer_preferences')
        .upsert(preferences)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Preferences updated successfully!');
    },
  });

  useEffect(() => {
    if (currentPreferences) {
      setPreferences(currentPreferences);
    }
  }, [currentPreferences]);

  const handlePreferenceChange = (field: keyof PreferenceValue, value: string[]) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Preferred Categories</label>
            <MultiSelect
              options={CATEGORIES}
              value={preferences.preferred_categories}
              onChange={(value: string[]) => handlePreferenceChange('preferred_categories', value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Preferred Days</label>
            <MultiSelect
              options={DAYS}
              value={preferences.preferred_days}
              onChange={(value) => setPreferences({ ...preferences, preferred_days: value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Min Price</label>
              <Input
                type="number"
                value={preferences.price_range.min}
                onChange={(e) => setPreferences({
                  ...preferences,
                  price_range: { ...preferences.price_range, min: Number(e.target.value) }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Price</label>
              <Input
                type="number"
                value={preferences.price_range.max}
                onChange={(e) => setPreferences({
                  ...preferences,
                  price_range: { ...preferences.price_range, max: Number(e.target.value) }
                })}
              />
            </div>
          </div>

          <Button
            type="button"
            onClick={() => updatePreferences.mutate(preferences)}
            disabled={updatePreferences.isPending}
          >
            {updatePreferences.isPending ? 'Saving...' : 'Save Preferences'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 