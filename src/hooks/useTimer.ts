'use client';

import { useState, useEffect, useRef } from 'react';
import { Period } from '@/types/study';

export function useTimer(period: Period, totalElapsed: number, onSessionComplete: (period: Period, startTime: number, endTime: number, duration: number) => void) {
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentElapsed, setCurrentElapsed] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update current elapsed when totalElapsed changes (from completed sessions)
  useEffect(() => {
    if (!isRunning) {
      setCurrentElapsed(totalElapsed);
    }
  }, [totalElapsed, isRunning]);

  const isValidTimeSlot = (period: Period): boolean => {
    const now = new Date();
    const currentHour = now.getHours();
    
    if (period === 'morning') {
      return currentHour >= 8 && currentHour < 12;
    } else {
      return currentHour >= 13 && currentHour < 19;
    }
  };

  const start = () => {
    if (!isValidTimeSlot(period)) {
      const timeSlot = period === 'morning' ? '8:00-12:00' : '13:00-19:00';
      alert(`${period === 'morning' ? '上午' : '下午'}時段為 ${timeSlot}，請在正確時間內使用`);
      return;
    }

    const now = Date.now();
    setStartTime(now);
    setIsRunning(true);

    intervalRef.current = setInterval(() => {
      setCurrentElapsed(totalElapsed + Math.floor((Date.now() - now) / 1000));
    }, 1000);
  };

  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (startTime) {
      const endTime = Date.now();
      const sessionDuration = Math.floor((endTime - startTime) / 1000);
      
      onSessionComplete(period, startTime, endTime, sessionDuration);
    }

    setIsRunning(false);
    setStartTime(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    elapsed: currentElapsed,
    isRunning,
    start,
    stop,
  };
}