
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, User as UserIcon, Info, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEvents } from '@/contexts/EventContext';
import { useAuth } from '@/contexts/AuthContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { events, joinEvent, leaveEvent, deleteEvent, joinedEventIds, getEventParticipantsProfiles } = useEvents();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  const event = events.find(e => e.id === id);

  const [participants, setParticipants] = useState([]);
  const [shareWithHost, setShareWithHost] = useState(false);

  // Compute participation/host flags before effects
  const isUserParticipant = !!(event && joinedEventIds.includes(event.id));
  const isUserHost = !!(event && event.user_id === user.id);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (event && isUserHost) {
        const list = await getEventParticipantsProfiles(event.id);
        if (mounted) setParticipants(list);
      } else {
        setParticipants([]);
      }
    }
    load();
    return () => { mounted = false };
  }, [event ? event.id : undefined, isUserHost]);

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-128px)] text-center px-4">
        <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
        <p className="text-gray-600 mb-6">The event you are looking for does not exist or may have been removed.</p>
        <Button asChild>
          <Link to="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const handleJoinLeave = async () => {
    try {
      if (isUserParticipant) {
        await leaveEvent(event.id, user.id);
        toast({ title: "Left Event", description: "You have successfully left the event." });
      } else {
        await joinEvent(event.id, shareWithHost);
        toast({ title: "Joined Event", description: "You have successfully joined the event." });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Action Failed", description: error.message });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteEvent(event.id);
      toast({ title: "Event Deleted", description: "The event has been successfully deleted." });
      navigate('/dashboard');
    } catch (error) {
      toast({ variant: "destructive", title: "Delete Failed", description: error.message });
    }
  };
  
  const participantCount = event.participants ? event.participants.length : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
            <div className="flex items-center text-blue-100">
              <UserIcon className="h-4 w-4 mr-2" />
              <span>{t('hostedBy')} {event.user_name || 'Unknown Host'}</span>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
              <div className="flex items-start">
                <Calendar className="h-6 w-6 mr-3 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold">{t('date')}</p>
                  <p>{new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Clock className="h-6 w-6 mr-3 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold">{t('time')}</p>
                  <p>{event.time}</p>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="h-6 w-6 mr-3 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold">{t('location')}</p>
                  <p>{event.location}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Users className="h-6 w-6 mr-3 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold">{t('participants')}</p>
                  <p>{event.participants?.length || 0} {event.max_participants ? `/ ${event.max_participants}` : ''}</p>
                </div>
              </div>
            </div>

            {event.sport_type && (
              <div className="flex items-start text-gray-700">
                <Info className="h-6 w-6 mr-3 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold">{t('sportType')}</p>
                  <p>{event.sport_type}</p>
                </div>
              </div>
            )}
            
            {event.description && (
              <div className="pt-4 border-t">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">{t('eventDescription')}</h2>
                <p className="text-gray-600 whitespace-pre-wrap">{event.description}</p>
              </div>
            )}

            {isUserHost && (
              <div className="pt-6 border-t">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">{t('participants')}</h2>
                {participants.length === 0 ? (
                  <p className="text-gray-600">{t('noParticipantsYet') || 'No participants yet.'}</p>
                ) : (
                  <ul className="space-y-2">
                    {participants.map(p => (
                      <li key={p.user_id} className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                          {p.full_name?.charAt(0)?.toUpperCase() || p.username?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">{p.full_name || p.username || p.user_id}</span>
                          <span className="text-xs text-gray-500">
                            Joined {new Date(p.joined_at).toLocaleString()}
                            {p.gender ? ` • ${t('genderLabel')}: ${t(p.gender) || p.gender}` : ''}
                            {p.age_band ? ` • ${t('ageLabel')}: ${p.age_band}` : ''}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="pt-6 border-t flex flex-col sm:flex-row gap-3">
              {!isUserHost && (
                <>
                  {!isUserParticipant && (
                    <label className="flex items-start gap-2 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={shareWithHost}
                        onChange={(e) => setShareWithHost(e.target.checked)}
                      />
                      <span>{t('consentShareWithHost') || 'Share my gender and age group with the event organizer'}</span>
                    </label>
                  )}
                  <Button onClick={handleJoinLeave} className="w-full sm:w-auto">
                    {isUserParticipant ? t('leaveEvent') : t('joinEvent')}
                  </Button>
                </>
              )}
              {isUserHost && (
                <>
                  <Button asChild variant="outline" className="w-full sm:w-auto">
                    <Link to={`/create-event/${event.id}`}>
                      <Edit className="mr-2 h-4 w-4" /> {t('editEvent')}
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full sm:w-auto">
                        <Trash2 className="mr-2 h-4 w-4" /> {t('deleteEvent')}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('confirmDeleteEventTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('confirmDeleteEventDescription')}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>{t('delete')}</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default EventDetailsPage;
