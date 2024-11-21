import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const bookings = [
  {
    id: 1,
    service: 'Haircut & Styling',
    provider: 'Style Studio',
    date: '2024-03-15',
    time: '10:00 AM',
    location: '123 Style Street',
    status: 'upcoming'
  },
  {
    id: 2,
    service: 'Massage Therapy',
    provider: 'Wellness Spa',
    date: '2024-03-20',
    time: '2:30 PM',
    location: '456 Wellness Ave',
    status: 'upcoming'
  }
];

export default function Bookings() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-gray-600 mt-2">Manage your upcoming and past appointments</p>
      </div>

      <div className="space-y-4">
        {bookings.map((booking) => (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{booking.service}</CardTitle>
                    <p className="text-gray-600">{booking.provider}</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {booking.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <span>{booking.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <span>{booking.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <span>{booking.location}</span>
                  </div>
                </div>
                <div className="flex justify-end gap-4 mt-4">
                  <Button variant="outline">Reschedule</Button>
                  <Button variant="ghost" className="text-red-600 hover:text-red-700">Cancel</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}