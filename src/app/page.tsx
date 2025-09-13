'use client';

import { useEffect, useState } from 'react';
import SessionSection from '@/components/SessionSection';
import SummarySection from '@/components/SummarySection';
import { useStudyData } from '@/hooks/useStudyData';
import { getTodayDateString } from '@/utils/timeUtils';
import { Period } from '@/types/study';

export default function Home() {
  const { isLoaded, getTodayData, saveSession, clearTodayData } = useStudyData();
  const [morningTotal, setMorningTotal] = useState(0);
  const [afternoonTotal, setAfternoonTotal] = useState(0);

  // Calculate totals when data changes
  useEffect(() => {
    if (isLoaded) {
      const todayData = getTodayData();
      const morningSum = todayData.morning.reduce((sum, session) => sum + session.duration, 0);
      const afternoonSum = todayData.afternoon.reduce((sum, session) => sum + session.duration, 0);
      setMorningTotal(morningSum);
      setAfternoonTotal(afternoonSum);
    }
  }, [isLoaded, getTodayData]);

  const handleSessionComplete = (period: Period, startTime: number, endTime: number, duration: number) => {
    const session = {
      start: new Date(startTime).toLocaleTimeString('zh-TW'),
      end: new Date(endTime).toLocaleTimeString('zh-TW'),
      duration,
    };
    
    saveSession(period, session);
    
    // Update totals
    if (period === 'morning') {
      setMorningTotal(prev => prev + duration);
    } else {
      setAfternoonTotal(prev => prev + duration);
    }
  };

  const handleClearData = () => {
    clearTodayData();
    setMorningTotal(0);
    setAfternoonTotal(0);
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  const todayData = getTodayData();

  return (
    <div className="container">
      <div className="header">
        <h1>📚 每日讀書時間紀錄</h1>
        <div className="date-display">{getTodayDateString()}</div>
      </div>

      <div className="main-content">
        <SessionSection
          period="morning"
          title="上午時段"
          icon="🌅"
          timeSlot="8:00 - 12:00"
          sessions={todayData.morning}
          totalElapsed={morningTotal}
          onSessionComplete={handleSessionComplete}
        />

        <SessionSection
          period="afternoon"
          title="下午時段"
          icon="☀️"
          timeSlot="13:00 - 19:00"
          sessions={todayData.afternoon}
          totalElapsed={afternoonTotal}
          onSessionComplete={handleSessionComplete}
        />

        <SummarySection
          morningTotal={morningTotal}
          afternoonTotal={afternoonTotal}
          onClearData={handleClearData}
        />
      </div>
    </div>
  );
}
