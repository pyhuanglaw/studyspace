'use client';

import { useEffect, useState } from 'react';
import { StudySessions, DayData, StudySession, Period } from '@/types/study';

const STORAGE_KEY = 'studySessions';

export function useStudyData() {
  const [data, setData] = useState<StudySessions>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setData(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to parse stored data:', e);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  const saveData = (newData: StudySessions) => {
    setData(newData);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    }
  };

  const getTodayData = (): DayData => {
    const today = new Date().toDateString();
    return data[today] || { morning: [], afternoon: [] };
  };

  const saveSession = (period: Period, session: StudySession) => {
    const today = new Date().toDateString();
    const newData = { ...data };
    
    if (!newData[today]) {
      newData[today] = { morning: [], afternoon: [] };
    }
    
    newData[today][period].push(session);
    saveData(newData);
  };

  const clearTodayData = () => {
    const today = new Date().toDateString();
    const newData = { ...data };
    delete newData[today];
    saveData(newData);
  };

  return {
    data,
    isLoaded,
    getTodayData,
    saveSession,
    clearTodayData,
  };
}