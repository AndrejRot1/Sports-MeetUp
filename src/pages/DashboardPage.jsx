import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEvents } from '@/contexts/EventContext';
import { useAuth } from '@/contexts/AuthContext';
import EventCard from '@/components/EventCard';
import { useLanguage } from '@/contexts/LanguageContext';

function DashboardPage() {
  const { events, deleteEvent, joinedEventIds } = useEvents();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('all-events');

  const userId = user?.id || '';

  const userEvents = events.filter(event => event.user_id === userId);
  const joinedEvents = events.filter(event => joinedEventIds.includes(event.id) && event.user_id !== userId);
  
  const upcomingEvents = events.filter(event => new Date(event.date) >= new Date());
  const pastEventsData = events.filter(event => new Date(event.date) < new Date());

  const renderEventList = (eventList, emptyMessage, emptySubMessage) => {
    if (eventList.length === 0) {
      return (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Clock className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">{emptyMessage}</h3>
          <p className="mt-2 text-gray-600">{emptySubMessage}</p>
          {emptyMessage === t('noEventsAvailable') && (
             <Button asChild className="mt-4">
                <Link to="/create-event">{t('createEvent')}</Link>
              </Button>
          )}
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {eventList.map(event => (
          <EventCard key={event.id} event={event} showControls={event.user_id === userId} onDelete={deleteEvent} />
        ))}
      </div>
    );
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">{t('dashboard')}</h1>
          <Button asChild>
            <Link to="/create-event" className="flex items-center">
              <Plus className="mr-2 h-5 w-5" /> {t('createEvent')}
            </Link>
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
            <TabsTrigger value="all-events">{t('allEvents')}</TabsTrigger>
            <TabsTrigger value="my-events">{t('myEvents')}</TabsTrigger>
            <TabsTrigger value="joined-events">{t('joinedEvents')}</TabsTrigger>
            <TabsTrigger value="past-events">{t('pastEvents')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all-events">
            {renderEventList(events, t('noEventsAvailable'), t('checkBackLater'))}
          </TabsContent>
          <TabsContent value="my-events">
            {renderEventList(userEvents, t('noEventsCreated'), t('createEvent'))}
          </TabsContent>
          <TabsContent value="joined-events">
            {renderEventList(joinedEvents, t('noEventsJoined'), t('browseEvents'))}
          </TabsContent>
          <TabsContent value="past-events">
            {renderEventList(pastEventsData, t('noPastEvents'), '')}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

export default DashboardPage;
