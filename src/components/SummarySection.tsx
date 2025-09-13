'use client';

import { formatTimeChinese } from '@/utils/timeUtils';

interface SummarySectionProps {
  morningTotal: number;
  afternoonTotal: number;
  onClearData: () => void;
}

export default function SummarySection({
  morningTotal,
  afternoonTotal,
  onClearData,
}: SummarySectionProps) {
  const dailyTotal = morningTotal + afternoonTotal;

  const handleClearData = () => {
    if (confirm('確定要清除今日所有學習紀錄嗎？')) {
      onClearData();
    }
  };

  return (
    <div className="summary-section">
      <div className="summary-title">📊 今日學習統計</div>
      <div className="time-stats">
        <div className="stat-item">
          <div className="stat-label">上午總時數</div>
          <div className="stat-value">{formatTimeChinese(morningTotal)}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">下午總時數</div>
          <div className="stat-value">{formatTimeChinese(afternoonTotal)}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">全日總計</div>
          <div className="stat-value">{formatTimeChinese(dailyTotal)}</div>
        </div>
      </div>
      <button className="btn clear-btn" onClick={handleClearData}>
        清除今日紀錄
      </button>
    </div>
  );
}