import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { supabase } from '../lib/supabase';

export function ServiceRecommendations() {
  const { data: recommendations } = useQuery({
    queryKey: ['service-recommendations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_recommendations')
        .select(`
          *,
          service:services(*)
        `)
        .order('score', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended for You</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {recommendations?.map((recommendation) => (
            <Card key={recommendation.id}>
              <CardContent className="p-4">
                <h3 className="font-semibold">{recommendation.service.name}</h3>
                <p className="text-sm text-gray-600">{recommendation.reason}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 