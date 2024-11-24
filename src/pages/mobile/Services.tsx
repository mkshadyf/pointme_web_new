import { useQuery } from '@tanstack/react-query';
import { MobileLayout } from '../../components/layouts/MobileLayout';
import { ServiceCard } from '../../components/mobile/ServiceCard';
import { ShareSheet } from '../../components/mobile/ShareSheet';
import { PullToRefresh } from '../../components/mobile/PullToRefresh';
import { supabase } from '../../lib/supabase';
import { useState } from 'react';

export default function Services() {
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const { data: services, refetch } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          business:businesses(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleShare = (service: any) => {
    setSelectedService(service);
    setIsShareOpen(true);
  };

  return (
    <MobileLayout title="Services">
      <PullToRefresh onRefresh={refetch}>
        <div className="grid grid-cols-2 gap-4 p-4">
          {services?.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onShare={() => handleShare(service)}
            />
          ))}
        </div>
      </PullToRefresh>

      {selectedService && (
        <ShareSheet
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          title={selectedService.name}
          text={selectedService.description}
          url={`${window.location.origin}/services/${selectedService.id}`}
        />
      )}
    </MobileLayout>
  );
} 