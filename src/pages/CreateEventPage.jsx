import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, Type, Info, Save, ArrowLeft, Bike, ShieldHalf, Users2 as UsersThree, Zap, Dumbbell, Waves, MountainSnow, Target, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEvents } from '@/contexts/EventContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

const sportOptions = [
  { value: "football", labelKey: "football", icon: <ShieldHalf className="h-4 w-4 mr-2 opacity-50" /> },
  { value: "basketball", labelKey: "basketball", icon: <Zap className="h-4 w-4 mr-2 opacity-50" /> },
  { value: "tennis", labelKey: "tennis", icon: <UsersThree className="h-4 w-4 mr-2 opacity-50" /> },
  { value: "running", labelKey: "running", icon: <Users className="h-4 w-4 mr-2 opacity-50" /> },
  { value: "cycling", labelKey: "cycling", icon: <Bike className="h-4 w-4 mr-2 opacity-50" /> },
  { value: "volleyball", labelKey: "volleyball", icon: <ShieldHalf className="h-4 w-4 mr-2 opacity-50" /> },
  { value: "badminton", labelKey: "badminton", icon: <Zap className="h-4 w-4 mr-2 opacity-50" /> },
  { value: "hiking", labelKey: "hiking", icon: <MountainSnow className="h-4 w-4 mr-2 opacity-50" /> },
  { value: "yoga", labelKey: "yoga", icon: <Users className="h-4 w-4 mr-2 opacity-50" /> },
  { value: "gym", labelKey: "gym", icon: <Dumbbell className="h-4 w-4 mr-2 opacity-50" /> },
  { value: "swimming", labelKey: "swimming", icon: <Waves className="h-4 w-4 mr-2 opacity-50" /> },
  { value: "tableTennis", labelKey: "tableTennis", icon: <Target className="h-4 w-4 mr-2 opacity-50" /> },
  { value: "squash", labelKey: "squash", icon: <Bot className="h-4 w-4 mr-2 opacity-50" /> },
  { value: "golf", labelKey: "golf", icon: <Zap className="h-4 w-4 mr-2 opacity-50" /> },
  { value: "other", labelKey: "otherSport", icon: <Info className="h-4 w-4 mr-2 opacity-50" /> }
];

function CreateEventPage() {
  const { id: eventId } = useParams(); 
  const navigate = useNavigate();
  const { createEvent, updateEvent, events } = useEvents();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  const isEditing = Boolean(eventId);
  const [eventData, setEventData] = useState({
    title: '',
    sportType: '',
    date: '',
    time: '',
    location: '',
    description: '',
    maxParticipants: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing) {
      const existingEvent = events.find(event => event.id === eventId);
      if (existingEvent) {
        setEventData({
          title: existingEvent.title || '',
          sportType: existingEvent.sport_type || '',
          date: existingEvent.date || '',
          time: existingEvent.time || '',
          location: existingEvent.location || '',
          description: existingEvent.description || '',
          maxParticipants: existingEvent.max_participants || ''
        });
      } else {
        navigate('/dashboard'); 
      }
    }
  }, [eventId, events, isEditing, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData(prev => ({ ...prev, [name]: value }));
  };

  const handleSportTypeChange = (value) => {
    setEventData(prev => ({ ...prev, sportType: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!eventData.title || !eventData.sportType || !eventData.date || !eventData.time || !eventData.location) {
      setError('Please fill in all required fields.');
      setIsLoading(false);
      return;
    }
    
    const eventPayload = {
      ...eventData,
      maxParticipants: eventData.maxParticipants ? parseInt(eventData.maxParticipants) : null,
      userId: user.id,
      userName: user.name
    };

    try {
      if (isEditing) {
        await updateEvent(eventId, eventPayload);
        toast({ title: t('profileUpdatedTitle'), description: t('profileUpdatedDescription') });
      } else {
        await createEvent(eventPayload);
        toast({ title: t('eventCreatedTitle'), description: t('eventCreatedDescription') });
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || t('unexpectedError'));
      toast({ variant: "destructive", title: isEditing ? t('updateFailedTitle') : t('registrationFailedTitle'), description: err.message || t('unexpectedError') });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('backToLogin')} 
        </Button>
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <h1 className="text-2xl font-bold">{isEditing ? t('updateEvent') : t('createANewEvent')}</h1>
            <p className="text-blue-100">{t('createEventPageDescription')}</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <Label htmlFor="title" className="text-base flex items-center"><Type className="h-4 w-4 mr-1" />{t('eventTitleLabel')}</Label>
              <Input id="title" name="title" value={eventData.title} onChange={handleChange} placeholder={t('eventTitlePlaceholder')} className="mt-1" required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="sportType" className="text-base flex items-center"><Users className="h-4 w-4 mr-1" />{t('sportTypeLabel')}</Label>
                <Select onValueChange={handleSportTypeChange} value={eventData.sportType} required>
                  <SelectTrigger id="sportType" className="mt-1">
                    <SelectValue placeholder={t('sportTypePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {sportOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center">
                           {option.icon}
                           {t(option.labelKey)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="maxParticipants" className="text-base flex items-center"><Users className="h-4 w-4 mr-1" />{t('maxParticipantsLabel')}</Label>
                <Input id="maxParticipants" name="maxParticipants" type="number" value={eventData.maxParticipants} onChange={handleChange} placeholder={t('maxParticipantsPlaceholder')} className="mt-1" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="date" className="text-base flex items-center"><Calendar className="h-4 w-4 mr-1" />{t('dateLabel')}</Label>
                <Input id="date" name="date" type="date" value={eventData.date} onChange={handleChange} className="mt-1" required />
              </div>
              <div>
                <Label htmlFor="time" className="text-base flex items-center"><Clock className="h-4 w-4 mr-1" />{t('timeLabel')}</Label>
                <Input id="time" name="time" type="time" value={eventData.time} onChange={handleChange} className="mt-1" required />
              </div>
            </div>

            <div>
              <Label htmlFor="location" className="text-base flex items-center"><MapPin className="h-4 w-4 mr-1" />{t('locationLabel')}</Label>
              <Input id="location" name="location" value={eventData.location} onChange={handleChange} placeholder={t('locationPlaceholder')} className="mt-1" required />
            </div>

            <div>
              <Label htmlFor="description" className="text-base flex items-center"><Info className="h-4 w-4 mr-1" />{t('descriptionLabel')}</Label>
              <Textarea id="description" name="description" value={eventData.description} onChange={handleChange} placeholder={t('descriptionPlaceholder')} className="mt-1" rows={4} />
            </div>
            
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}
            
            <div className="flex justify-end pt-4">
              <Button type="submit" className="flex items-center" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                    {isEditing ? t('updatingEvent') : t('creatingEvent')}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isEditing ? t('updateEvent') : t('createEvent')}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default CreateEventPage;
