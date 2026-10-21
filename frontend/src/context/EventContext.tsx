import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { EventItem, EventListItem, EventCreateInput, HealthStatus } from '../types';
import { api } from '../services/api';

interface EventContextType {
  events: EventListItem[];
  currentEvent: EventItem | null;
  loading: boolean;
  generatingPlan: boolean;
  error: string | null;
  health: HealthStatus | null;
  selectEvent: (id: string) => Promise<void>;
  refreshCurrentEvent: () => Promise<void>;
  refreshEventsList: () => Promise<void>;
  createEvent: (input: EventCreateInput) => Promise<EventItem>;
  updateEvent: (id: string, input: Partial<EventCreateInput>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  generatePlan: (id?: string) => Promise<void>;
  loadDemoEvent: () => Promise<void>;
  clearCurrentEvent: () => void;
  clearError: () => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [currentEvent, setCurrentEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [generatingPlan, setGeneratingPlan] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      const data = await api.getHealth();
      setHealth(data);
    } catch {
      // API might be warming up or offline
    }
  }, []);

  const refreshEventsList = useCallback(async () => {
    try {
      const list = await api.getEvents();
      setEvents(list);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  }, []);

  const selectEvent = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const ev = await api.getEvent(id);
      setCurrentEvent(ev);
      localStorage.setItem('eventsaathi_active_event_id', id);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshCurrentEvent = useCallback(async () => {
    if (!currentEvent?.id) return;
    try {
      const ev = await api.getEvent(currentEvent.id);
      setCurrentEvent(ev);
      refreshEventsList();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  }, [currentEvent?.id, refreshEventsList]);

  // Initial load: fetch health, list events, and auto-load saved event if present
  useEffect(() => {
    fetchHealth();
    api.getEvents().then((list) => {
      setEvents(list);
      const savedId = localStorage.getItem('eventsaathi_active_event_id');
      if (savedId && list.some((e) => e.id === savedId)) {
        selectEvent(savedId);
      } else if (list.length > 0) {
        selectEvent(list[0].id);
      }
    }).catch(() => {});
  }, [fetchHealth, selectEvent]);

  const createEvent = async (input: EventCreateInput): Promise<EventItem> => {
    setLoading(true);
    setError(null);
    try {
      const newEv = await api.createEvent(input);
      setCurrentEvent(newEv);
      localStorage.setItem('eventsaathi_active_event_id', newEv.id);
      await refreshEventsList();
      return newEv;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create event';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateEvent = async (id: string, input: Partial<EventCreateInput>) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await api.updateEvent(id, input);
      setCurrentEvent(updated);
      await refreshEventsList();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update event';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.deleteEvent(id);
      if (currentEvent?.id === id) {
        setCurrentEvent(null);
        localStorage.removeItem('eventsaathi_active_event_id');
      }
      await refreshEventsList();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete event';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const generatePlan = async (id?: string) => {
    const targetId = id || currentEvent?.id;
    if (!targetId) return;

    setGeneratingPlan(true);
    setError(null);
    try {
      const updated = await api.generatePlan(targetId);
      setCurrentEvent(updated);
      await refreshEventsList();

      // Trigger celebratory confetti burst
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#e11d48', '#f59e0b', '#10b981', '#6366f1']
        });
      } catch {
        // Safe if canvas-confetti is not available
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate plan';
      setError(msg);
    } finally {
      setGeneratingPlan(false);
    }
  };

  const loadDemoEvent = async () => {
    setLoading(true);
    setError(null);
    try {
      // Check if a demo birthday event already exists
      const existing = events.find((e) => e.name.includes("Ahmedabad 30th Birthday Celebration"));
      if (existing) {
        await selectEvent(existing.id);
        return;
      }

      // Create realistic scenario according to Challenge Requirement 17
      const demoInput: EventCreateInput = {
        name: "Aarav's 30th Birthday Celebration",
        event_type: "birthday",
        date: "2026-11-20",
        city: "Ahmedabad, Gujarat",
        venue_status: "shortlisted",
        guest_count: 50,
        total_budget: 50000.0,
        currency: "INR",
        language: "en",
        theme_preference: "Bollywood Retro & Festive Elegance",
        dietary_requirements: "Pure Vegetarian with Jain special counter",
        indoor_outdoor: "both",
        additional_notes: "Live acoustic singing, custom cake cutting ceremony, and personalized return gifts.",
      };

      const created = await api.createEvent(demoInput);
      await refreshEventsList();
      // Generate plan immediately
      const withPlan = await api.generatePlan(created.id);
      setCurrentEvent(withPlan);
      localStorage.setItem('eventsaathi_active_event_id', withPlan.id);
      await refreshEventsList();

      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#e11d48', '#f59e0b', '#059669']
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load demo celebration';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const clearCurrentEvent = () => {
    setCurrentEvent(null);
    localStorage.removeItem('eventsaathi_active_event_id');
  };

  const clearError = () => setError(null);

  const value = {
    events,
    currentEvent,
    loading,
    generatingPlan,
    error,
    health,
    selectEvent,
    refreshCurrentEvent,
    refreshEventsList,
    createEvent,
    updateEvent,
    deleteEvent,
    generatePlan,
    loadDemoEvent,
    clearCurrentEvent,
    clearError,
  };

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
};

export const useEvent = (): EventContextType => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvent must be used within an EventProvider');
  }
  return context;
};
