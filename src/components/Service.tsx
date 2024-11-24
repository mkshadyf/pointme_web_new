import { FavoriteButton } from './FavoriteButton';
import { Card, CardContent } from './ui/Card';

interface ServiceProps {
  service: {
    id: string;
    name: string;
    // Add other service properties as needed
  };
}

export function Service({ service }: ServiceProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between">
          <h3 className="font-semibold">{service.name}</h3>
          <FavoriteButton serviceId={service.id} />
        </div>
        {/* Rest of the service component */}
      </CardContent>
    </Card>
  );
} 