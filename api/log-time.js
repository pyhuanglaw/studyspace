import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // 只接受 POST 請求
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  try {
    const { duration, period, sessionStartTime } = req.body;

    // 驗證必要的參數
    if (!duration || !period || !sessionStartTime) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required parameters: duration, period, sessionStartTime' 
      });
    }

    // 驗證 period 值
    if (period !== 'morning' && period !== 'afternoon') {
      return res.status(400).json({
        success: false,
        message: 'Invalid period. Must be "morning" or "afternoon"'
      });
    }

    // 生成記錄 ID
    const recordId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // 準備儲存的資料
    const record = {
      id: recordId,
      duration: duration,
      period: period,
      sessionStartTime: sessionStartTime,
      sessionEndTime: Date.now(),
      date: new Date().toDateString(),
      timestamp: new Date().toISOString()
    };

    // 儲存到當日記錄 (按日期索引)
    const dateKey = `study-sessions:${record.date}`;
    await kv.lpush(dateKey, JSON.stringify(record));

    // 也儲存到全域列表 (用於未來的聚合查詢)
    await kv.lpush('study-sessions:all', JSON.stringify(record));

    // 設定過期時間 (可選，例如 30 天後自動清理)
    await kv.expire(dateKey, 30 * 24 * 60 * 60); // 30 天

    res.status(200).json({ 
      success: true, 
      message: '時間已成功記錄到雲端',
      recordId: recordId
    });

  } catch (error) {
    console.error('ERROR storing to Vercel KV:', error);
    res.status(500).json({ 
      success: false, 
      message: '伺服器錯誤，無法儲存資料' 
    });
  }
}