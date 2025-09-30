import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, Edit, Trash2, Eye, Bike, ShieldHalf, Zap, Dumbbell, Waves, MountainSnow, Target, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

// Inline basketball icon to ensure availability
function BasketballIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a15 15 0 0 1 0 18" />
      <path d="M12 3a15 15 0 0 0 0 18" />
    </svg>
  );
}

function SportIcon({ sport, className }) {
  const s = (sport || '').toString().toLowerCase();
  if (s === 'basketball') return <BasketballIcon className={className} />;
  if (s === 'football') return <ShieldHalf className={className} />;
  if (s === 'volleyball') return <ShieldHalf className={className} />;
  if (s === 'cycling') return <Bike className={className} />;
  if (s === 'hiking') return <MountainSnow className={className} />;
  if (s === 'climbing') return <MountainSnow className={className} />;
  if (s === 'gym') return <Dumbbell className={className} />;
  if (s === 'swimming') return <Waves className={className} />;
  if (s === 'tabletennis' || s === 'table_tennis' || s === 'tabletennis') return <Target className={className} />;
  if (s === 'squash') return <Bot className={className} />;
  if (s === 'badminton') return <Zap className={className} />;
  if (s === 'tennis') return <Zap className={className} />;
  // default generic
  return <Zap className={className} />;
}

function EventCard({ event, showControls = false, onDelete }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleDelete = async (e) => {
    e.stopPropagation(); 
    try {
      await onDelete(event.id);
      toast({ title: "Event Deleted", description: "The event has been successfully deleted." });
    } catch (error) {
      toast({ variant: "destructive", title: "Delete Failed", description: error.message });
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    navigate(`/create-event/${event.id}`);
  };
  
  const participantCount = event.participants ? event.participants.length : 0;
  const sport = event.sport_type || event.sportType;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-blue-700 truncate">{event.title}</CardTitle>
          <div className="text-sm text-gray-500 flex items-center">
            <SportIcon sport={sport} className="h-4 w-4 mr-2 opacity-50" />
            <span className="truncate">{sport}</span>
          </div>
        </CardHeader>
        <CardContent className="flex-grow space-y-3 text-sm">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-blue-500" />
            <span>{new Date(event.date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="h-4 w-4 mr-2 text-blue-500" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-2 text-blue-500" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Users className="h-4 w-4 mr-2 text-blue-500" />
            <span>{event.participants?.length || 0} {t('participants')} {event.max_participants ? `/ ${event.max_participants}` : ''}</span>
          </div>
        </CardContent>
        <CardFooter className="pt-4 border-t">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link to={`/events/${event.id}`}>
                <Eye className="mr-2 h-4 w-4" /> {t('details')}
              </Link>
            </Button>
            {showControls && (
              <>
                <Button variant="ghost" size="sm" onClick={handleEdit} className="w-full">
                  <Edit className="mr-2 h-4 w-4" /> {t('editEvent')}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" onClick={(e) => e.stopPropagation()} className="w-full">
                      <Trash2 className="mr-2 h-4 w-4" /> {t('deleteEvent')}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent onClick={(e) => e.stopPropagation()}>
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
        </CardFooter>
      </Card>
    </motion.div>
  );
}

export default EventCard;
