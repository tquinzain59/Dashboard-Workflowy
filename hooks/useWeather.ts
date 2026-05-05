import { useState, useEffect } from 'react';
import { WeatherInfo } from '@/types';

export function useWeather() {
  const [data, setData] = useState<WeatherInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch('/api/weather');
        if (!res.ok) throw new Error('Failed to fetch weather');
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchWeather();
  }, []);

  return { data, loading, error };
}
