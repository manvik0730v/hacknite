import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import API from '../services/api';

const StoryContext = createContext();

export function StoryProvider({ children }) {
  const { user } = useAuth();
  const [seenEvents, setSeenEvents] = useState(new Set());
  const [hasVisitedSincityMap, setHasVisitedSincityMap] = useState(false);
  const [pendingEvent, setPendingEvent] = useState(null); // { eventId, onComplete }

  useEffect(() => {
    if (!user) return;
    API.get('/api/story/seen').then(res => {
      setSeenEvents(new Set(res.data.seenEvents || []));
      setHasVisitedSincityMap(res.data.hasVisitedSincityMap || false);
    }).catch(() => {});
  }, [user]);

  const triggerStory = useCallback((eventId, onComplete) => {
    if (seenEvents.has(eventId)) {
      onComplete?.();
      return;
    }
    setPendingEvent({ eventId, onComplete });
  }, [seenEvents]);

  const markSeen = useCallback(async (eventId) => {
    setSeenEvents(prev => new Set([...prev, eventId]));
    try { await API.post('/api/story/seen', { event: eventId }); } catch {}
  }, []);

  const markSincityMapVisited = useCallback(async () => {
    setHasVisitedSincityMap(true);
    try { await API.post('/api/story/sincity-map-visited'); } catch {}
  }, []);

  const hasSeen = useCallback((eventId) => seenEvents.has(eventId), [seenEvents]);

  return (
    <StoryContext.Provider value={{
      triggerStory, markSeen, hasSeen,
      pendingEvent, setPendingEvent,
      hasVisitedSincityMap, markSincityMapVisited
    }}>
      {children}
    </StoryContext.Provider>
  );
}

export const useStory = () => useContext(StoryContext);
