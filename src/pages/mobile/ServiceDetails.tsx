import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Camera, Share2, Calendar, MoreVertical, Star, ThumbsUp, Flag } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { MobileLayout } from '../../components/layouts/MobileLayout';
import { ImageGallery } from '../../components/mobile/ImageGallery';
import { ShareSheet } from '../../components/mobile/ShareSheet';
import { ActionSheet } from '../../components/mobile/ActionSheet';
import { MediaCapture } from '../../components/mobile/MediaCapture';
import { SwipeableList } from '../../components/mobile/SwipeableList';
import { supabase } from '../../lib/supabase';
import { mobileDeviceService } from '../../services/mobileDeviceService';

interface ServiceDetails {
  id: string;
  name: string;
  description: string;
  images: string[];
  business: {
    id: string;
    name: string;
  };
  reviews: Array<{
    id: string;
    rating: number;
    review_text: string;
    created_at: string;
  }>;
}

export default function ServiceDetails() {
  const { id } = useParams();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  const { data: service } = useQuery({
    queryKey: ['service', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          business:businesses(*),
          reviews:customer_reviews(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const actions = [
    {
      icon: <Calendar className="w-6 h-6" />,
      label: 'Book Now',
      onClick: () => {/* Handle booking */},
    },
    {
      icon: <Camera className="w-6 h-6" />,
      label: 'Add Photos',
      onClick: () => {/* Handle photo upload */},
    },
    {
      label: 'Report Issue',
      description: 'Report inappropriate content or issues',
      onClick: () => {/* Handle reporting */},
      destructive: true,
    },
  ];

  const handleShare = () => {
    setIsShareOpen(true);
    mobileDeviceService.vibrate('light');
  };

  return (
    <MobileLayout title={service?.name} showBackButton>
      <div className="space-y-4">
        {service?.images && (
          <ImageGallery
            images={service.images}
            onShare={handleShare}
          />
        )}

        <div className="p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">{service?.name}</h1>
          <div className="flex gap-2">
            <MediaCapture onCapture={(url) => {/* Handle media capture */}} />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsActionsOpen(true)}
            >
              <MoreVertical className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {service?.reviews && (
          <SwipeableList
            items={service.reviews}
            renderItem={(review) => (
              <div className="p-4">
                <p className="font-medium">{review.review_text}</p>
                <div className="flex gap-1 mt-1">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
            )}
            leftAction={{
              label: 'Like',
              color: 'bg-green-500',
              icon: <ThumbsUp className="w-6 h-6 text-white" />,
              onClick: () => {/* Handle like */},
            }}
            rightAction={{
              label: 'Report',
              color: 'bg-red-500',
              icon: <Flag className="w-6 h-6 text-white" />,
              onClick: () => {/* Handle report */},
            }}
          />
        )}

        <ShareSheet
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          title={service?.name || ''}
          text={service?.description || ''}
          url={window.location.href}
        />

        <ActionSheet
          isOpen={isActionsOpen}
          onClose={() => setIsActionsOpen(false)}
          title="Service Options"
          actions={actions}
        />
      </div>
    </MobileLayout>
  );
} 