import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { BookingHistory } from '../components/BookingHistory';
import { CustomerPreferences } from '../components/CustomerPreferences';
import { ServiceRecommendations } from '../components/ServiceRecommendations';
import { RecurringBookingForm } from '../components/RecurringBookingForm';
import { GroupBookingForm } from '../components/GroupBookingForm';
import { WaitingList } from '../components/WaitingList';

export default function Bookings() {
  const [activeTab, setActiveTab] = useState('history');

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="history">Booking History</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="recurring">Recurring Bookings</TabsTrigger>
          <TabsTrigger value="group">Group Bookings</TabsTrigger>
          <TabsTrigger value="waitlist">Waiting List</TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <BookingHistory />
        </TabsContent>

        <TabsContent value="preferences">
          <CustomerPreferences />
        </TabsContent>

        <TabsContent value="recommendations">
          <ServiceRecommendations />
        </TabsContent>

        <TabsContent value="recurring">
          <RecurringBookingForm 
            serviceId="default-service-id" 
            onSuccess={() => setActiveTab('history')}
          />
        </TabsContent>

        <TabsContent value="group">
          <GroupBookingForm serviceId="default-service-id" />
        </TabsContent>

        <TabsContent value="waitlist">
          <WaitingList serviceId="default-service-id" />
        </TabsContent>
      </Tabs>
    </div>
  );
}