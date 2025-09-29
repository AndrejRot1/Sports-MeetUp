import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

const EventContext = createContext();

export function useEvents() {
  return useContext(EventContext);
}

export function EventProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joinedEventIds, setJoinedEventIds] = useState([]);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadEvents();
      loadJoinedEventIds();
    } else {
      setEvents([]);
      setJoinedEventIds([]);
      setLoading(false);
    }
  }, [user]);

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
      toast({
        variant: "destructive",
        title: "Failed to load events",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadJoinedEventIds = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('event_participants')
      .select('event_id')
      .eq('user_id', user.id);
    if (!error) {
      setJoinedEventIds((data || []).map(r => r.event_id));
    }
  };

  // Create a new event
  const createEvent = async (eventData) => {
    try {
      if (!user) throw new Error('You must be logged in to create an event');
      
      const newEvent = {
        title: eventData.title,
        sport_type: eventData.sportType,
        date: eventData.date,
        time: eventData.time,
        location: eventData.location,
        description: eventData.description,
        max_participants: eventData.maxParticipants,
        user_id: user.id,
        user_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email,
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('events')
        .insert([newEvent])
        .select()
        .single();

      if (error) throw error;

      setEvents(prev => [data, ...prev]);
      
      toast({
        title: "Event Created",
        description: "Your sports event has been successfully created.",
      });
      
      return { success: true, eventId: data.id };
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Event Creation Failed",
        description: error.message,
      });
      return { success: false, error: error.message };
    }
  };

  // Get a single event by ID
  const getEvent = async (id) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting event:', error);
      return null;
    }
  };

  // Join an event (via event_participants)
  const joinEvent = async (eventId, shareWithHost = false) => {
    try {
      if (!user) throw new Error('You must be logged in to join an event');
      
      // Ensure not already joined
      if (joinedEventIds.includes(eventId)) {
        throw new Error('You are already participating in this event');
      }

      // Check capacity
      const { data: ev } = await supabase
        .from('events')
        .select('id, max_participants')
        .eq('id', eventId)
        .single();

      if (ev?.max_participants) {
        const { data: countData } = await supabase
          .from('event_participants')
          .select('user_id', { count: 'exact', head: true })
          .eq('event_id', eventId);
        if ((countData?.length || 0) >= ev.max_participants) {
          throw new Error('This event is full');
        }
      }

      const { error } = await supabase
        .from('event_participants')
        .insert({ event_id: eventId, user_id: user.id, share_with_host: !!shareWithHost });

      if (error) throw error;

      await loadJoinedEventIds();
      toast({ title: "Joined Event", description: "You have successfully joined this event." });
      return { success: true };
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to Join", description: error.message });
      return { success: false, error: error.message };
    }
  };

  // Leave an event (via event_participants)
  const leaveEvent = async (eventId) => {
    try {
      if (!user) throw new Error('You must be logged in to leave an event');

      // Prevent host from leaving
      const { data: ev } = await supabase
        .from('events')
        .select('user_id')
        .eq('id', eventId)
        .single();
      if (ev?.user_id === user.id) {
        throw new Error('As the creator, you cannot leave this event. You can delete it instead.');
      }

      const { error } = await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);

      if (error) throw error;

      await loadJoinedEventIds();
      toast({ title: "Left Event", description: "You have successfully left this event." });
      return { success: true };
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to Leave", description: error.message });
      return { success: false, error: error.message };
    }
  };

  // Delete an event
  const deleteEvent = async (eventId) => {
    try {
      if (!user) throw new Error('You must be logged in to delete an event');
      
      const { data: event, error: fetchError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (fetchError) throw fetchError;
      
      if (event.user_id !== user.id) {
        throw new Error('You can only delete events you created');
      }
      
      const { error: deleteError } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (deleteError) throw deleteError;

      setEvents(prev => prev.filter(e => e.id !== eventId));
      await loadJoinedEventIds();
      
      toast({
        title: "Event Deleted",
        description: "Your event has been successfully deleted.",
      });
      
      return { success: true };
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: error.message,
      });
      return { success: false, error: error.message };
    }
  };

  // Update an event
  const updateEvent = async (eventId, updates) => {
    try {
      if (!user) throw new Error('You must be logged in to update an event');
      
      const { data: event, error: fetchError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (fetchError) throw fetchError;
      
      if (event.user_id !== user.id) {
        throw new Error('You can only update events you created');
      }

      const updateData = {
        title: updates.title,
        sport_type: updates.sportType,
        date: updates.date,
        time: updates.time,
        location: updates.location,
        description: updates.description,
        max_participants: updates.maxParticipants,
        updated_at: new Date().toISOString()
      };
      
      const { data, error: updateError } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', eventId)
        .select()
        .single();

      if (updateError) throw updateError;

      setEvents(prev => prev.map(e => 
        e.id === eventId ? data : e
      ));
      
      toast({
        title: "Event Updated",
        description: "Your event has been successfully updated.",
      });
      
      return { success: true };
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message,
      });
      return { success: false, error: error.message };
    }
  };

  const getEventParticipantsProfiles = async (eventId) => {
    try {
      // Organizer-only view: use RPC to get gender and age_band only if consented
      const { data: rows, error: rpcErr } = await supabase
        .rpc('get_event_participants_for_host', { p_event_id: eventId });
      if (rpcErr) throw rpcErr;
      const ids = (rows || []).map(r => r.user_id);
      let idToProfile = new Map();
      if (ids.length > 0) {
        const { data: profiles, error: profErr } = await supabase
          .from('profiles')
          .select('id, full_name, username, avatar_url')
          .in('id', ids);
        if (!profErr) idToProfile = new Map((profiles || []).map(p => [p.id, p]));
      }
      return (rows || []).map(r => ({
        user_id: r.user_id,
        joined_at: r.joined_at,
        gender: r.gender,
        age_band: r.age_band,
        full_name: idToProfile.get(r.user_id)?.full_name || null,
        username: idToProfile.get(r.user_id)?.username || null,
        avatar_url: idToProfile.get(r.user_id)?.avatar_url || null,
      }));
    } catch (e) {
      console.error('Failed to load participants via RPC', e);
      return [];
    }
  };

  const value = {
    events,
    loading,
    joinedEventIds,
    createEvent,
    getEvent,
    joinEvent,
    leaveEvent,
    deleteEvent,
    updateEvent,
    getEventParticipantsProfiles,
  };

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
}
