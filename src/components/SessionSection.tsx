'use client';

import { StudySession, Period } from '@/types/study';
import { formatTime, formatTimeChinese } from '@/utils/timeUtils';
import { useTimer } from '@/hooks/useTimer';

interface SessionSectionProps {
  period: Period;
  title: string;
  icon: string;
  timeSlot: string;
  sessions: StudySession[];
  totalElapsed: number;
  onSessionComplete: (period: Period, startTime: number, endTime: number, duration: number) => void;
}

export default function SessionSection({
  period,
  title,
  icon,
  timeSlot,
  sessions,
  totalElapsed,
  onSessionComplete,
}: SessionSectionProps) {
  const { elapsed, isRunning, start, stop } = useTimer(period, totalElapsed, onSessionComplete);

  return (
    <div className={`session-section ${period}`}>
      <div className="section-title">
        <span className="icon">{icon}</span>
        {title} ({timeSlot})
      </div>
      <div className="timer-display">
        {formatTime(elapsed)}
      </div>
      <div className="timer-controls">
        <button 
          className="btn" 
          onClick={start}
          disabled={isRunning}
        >
          開始
        </button>
        <button 
          className="btn stop" 
          onClick={stop}
          disabled={!isRunning}
        >
          停止
        </button>
      </div>
      <div className="sessions-list">
        <h4>今日{period === 'morning' ? '上午' : '下午'}時段紀錄：</h4>
        <div>
          {sessions.map((session, index) => (
            <div key={index} className="session-item">
              <span>{session.start} - {session.end}</span>
              <span>{formatTimeChinese(session.duration)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}