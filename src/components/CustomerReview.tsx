import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Star, ThumbsUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Textarea } from './ui/Textarea';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

interface ReviewFormProps {
  serviceId: string;
  providerId: string;
  bookingId?: string;
  onSuccess?: () => void;
}

interface TextareaChangeEvent extends React.ChangeEvent<HTMLTextAreaElement> {
  target: HTMLTextAreaElement;
}

export function CustomerReview({ serviceId, providerId, bookingId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  const submitReview = useMutation({
    mutationFn: async ({ rating, reviewText }: { rating: number; reviewText: string }) => {
      const { data, error } = await supabase
        .from('customer_reviews')
        .insert({
          service_id: serviceId,
          provider_id: providerId,
          booking_id: bookingId,
          rating,
          review_text: reviewText,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Review submitted successfully!');
      onSuccess?.();
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <Star
                key={value}
                className={`w-6 h-6 cursor-pointer ${
                  value <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
                onClick={() => setRating(value)}
              />
            ))}
          </div>

          <Textarea
            value={reviewText}
            onChange={(e: TextareaChangeEvent) => setReviewText(e.target.value)}
            placeholder="Share your experience..."
            rows={4}
          />

          <Button
            onClick={() => submitReview.mutate({ rating, reviewText })}
            disabled={rating === 0 || !reviewText || submitReview.isPending}
          >
            {submitReview.isPending ? 'Submitting...' : 'Submit Review'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 