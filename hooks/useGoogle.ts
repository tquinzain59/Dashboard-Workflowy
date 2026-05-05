import { useState, useEffect } from 'react';
import { GoogleEvent, GmailMessage } from '@/types';

export function useGoogleCalendar() {
  const [events, setEvents] = useState<GoogleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCalendar() {
      try {
        const res = await fetch('/api/google/calendar');
        if (!res.ok) throw new Error('Non connecté');
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setEvents(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCalendar();
  }, []);

  return { events, loading, error };
}

export function useGmail() {
  const [messages, setMessages] = useState<GmailMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGmail() {
      try {
        const res = await fetch('/api/google/gmail');
        if (!res.ok) throw new Error('Non connecté');
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setMessages(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchGmail();
  }, []);

  return { messages, loading, error };
}
