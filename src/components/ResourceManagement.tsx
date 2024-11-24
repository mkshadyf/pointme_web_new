import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import type { Resource } from '../types/booking';
import { supabase } from '../lib/supabase';

export function ResourceManagement() {
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  const { data: resources } = useQuery({
    queryKey: ['resources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resources')
        .select('*');

      if (error) throw error;
      return data;
    },
  });

  const updateResource = useMutation({
    mutationFn: async (resource: Resource) => {
      const { data, error } = await supabase
        .from('resources')
        .update(resource)
        .eq('id', resource.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  });

  const handleAvailabilityUpdate = (date: string, timeSlot: string, available: boolean) => {
    if (!selectedResource) return;

    const updatedResource = {
      ...selectedResource,
      availability: {
        ...selectedResource.availability,
        [date]: {
          ...selectedResource.availability[date],
          [timeSlot]: available,
        },
      },
    };

    updateResource.mutate(updatedResource);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resource Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">Resources</h3>
            <div className="space-y-2">
              {resources?.map((resource) => (
                <div
                  key={resource.id}
                  className={`p-3 border rounded-md cursor-pointer ${
                    selectedResource?.id === resource.id ? 'border-primary-500' : ''
                  }`}
                  onClick={() => setSelectedResource(resource)}
                >
                  <p className="font-medium">{resource.name}</p>
                  <p className="text-sm text-gray-600">{resource.type}</p>
                </div>
              ))}
            </div>
          </div>

          {selectedResource && (
            <div>
              <h3 className="font-medium mb-2">Availability</h3>
              {/* Add availability management UI here */}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 