'use client'

import { useState, useEffect, useRef } from 'react'

interface StudySession {
  start: string
  end: string
  duration: number
}

interface DailySessions {
  morning: StudySession[]
  afternoon: StudySession[]
}

export default function StudyTracker() {
  const [morningElapsed, setMorningElapsed] = useState(0)
  const [afternoonElapsed, setAfternoonElapsed] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState({ morning: false, afternoon: false })
  const [sessions, setSessions] = useState<{ [key: string]: DailySessions }>({})
  const [shareCode, setShareCode] = useState<string | null>(null)
  
  const morningStartTime = useRef<number | null>(null)
  const afternoonStartTime = useRef<number | null>(null)
  const morningInterval = useRef<NodeJS.Timeout | null>(null)
  const afternoonInterval = useRef<NodeJS.Timeout | null>(null)

  const today = new Date().toDateString()

  // Load data on component mount
  useEffect(() => {
    loadTodayData()
    loadShareCode()
  }, [])

  // Save data whenever sessions change
  useEffect(() => {
    if (Object.keys(sessions).length > 0) {
      localStorage.setItem('studySessions', JSON.stringify(sessions))
    }
  }, [sessions])

  // Load today's data from localStorage
  function loadTodayData() {
    const savedSessions = JSON.parse(localStorage.getItem('studySessions') || '{}')
    setSessions(savedSessions)
    
    if (savedSessions[today]) {
      const morningTotal = savedSessions[today].morning.reduce((total: number, session: StudySession) => total + session.duration, 0)
      const afternoonTotal = savedSessions[today].afternoon.reduce((total: number, session: StudySession) => total + session.duration, 0)
      setMorningElapsed(morningTotal)
      setAfternoonElapsed(afternoonTotal)
    }
  }

  // Load share code
  function loadShareCode() {
    const savedShareCode = localStorage.getItem('shareCode')
    setShareCode(savedShareCode)
  }

  // Format time display
  function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Format time in Chinese
  function formatTimeChinese(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}小時${minutes}分`
  }

  // Start timer
  function startTimer(period: 'morning' | 'afternoon') {
    const now = Date.now()
    
    if (period === 'morning') {
      morningStartTime.current = now
      setIsTimerRunning(prev => ({ ...prev, morning: true }))
      
      morningInterval.current = setInterval(() => {
        if (morningStartTime.current) {
          const elapsed = Math.floor((Date.now() - morningStartTime.current) / 1000)
          setMorningElapsed(prev => {
            const baseTime = sessions[today]?.morning.reduce((total, session) => total + session.duration, 0) || 0
            return baseTime + elapsed
          })
        }
      }, 1000)
    } else {
      afternoonStartTime.current = now
      setIsTimerRunning(prev => ({ ...prev, afternoon: true }))
      
      afternoonInterval.current = setInterval(() => {
        if (afternoonStartTime.current) {
          const elapsed = Math.floor((Date.now() - afternoonStartTime.current) / 1000)
          setAfternoonElapsed(prev => {
            const baseTime = sessions[today]?.afternoon.reduce((total, session) => total + session.duration, 0) || 0
            return baseTime + elapsed
          })
        }
      }, 1000)
    }
  }

  // Stop timer
  function stopTimer(period: 'morning' | 'afternoon') {
    const endTime = Date.now()
    
    if (period === 'morning' && morningStartTime.current) {
      const sessionDuration = Math.floor((endTime - morningStartTime.current) / 1000)
      saveSession('morning', morningStartTime.current, endTime, sessionDuration)
      
      if (morningInterval.current) {
        clearInterval(morningInterval.current)
        morningInterval.current = null
      }
      morningStartTime.current = null
      setIsTimerRunning(prev => ({ ...prev, morning: false }))
    } else if (period === 'afternoon' && afternoonStartTime.current) {
      const sessionDuration = Math.floor((endTime - afternoonStartTime.current) / 1000)
      saveSession('afternoon', afternoonStartTime.current, endTime, sessionDuration)
      
      if (afternoonInterval.current) {
        clearInterval(afternoonInterval.current)
        afternoonInterval.current = null
      }
      afternoonStartTime.current = null
      setIsTimerRunning(prev => ({ ...prev, afternoon: false }))
    }
  }

  // Save session
  function saveSession(period: 'morning' | 'afternoon', startTime: number, endTime: number, duration: number) {
    const session: StudySession = {
      start: new Date(startTime).toLocaleTimeString('zh-TW'),
      end: new Date(endTime).toLocaleTimeString('zh-TW'),
      duration: duration
    }

    setSessions(prev => {
      const updated = { ...prev }
      if (!updated[today]) {
        updated[today] = { morning: [], afternoon: [] }
      }
      updated[today][period].push(session)
      return updated
    })
  }

  // Generate share link
  async function generateShareLink() {
    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessions })
      })
      
      const data = await response.json()
      if (data.shareCode) {
        setShareCode(data.shareCode)
        localStorage.setItem('shareCode', data.shareCode)
        alert(`分享連結已產生！\n${window.location.origin}/share/${data.shareCode}`)
      }
    } catch (error) {
      alert('產生分享連結失敗')
    }
  }

  // Cancel share
  async function cancelShare() {
    if (!shareCode) return
    
    try {
      const response = await fetch(`/api/share/${shareCode}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setShareCode(null)
        localStorage.removeItem('shareCode')
        alert('分享已取消')
      }
    } catch (error) {
      alert('取消分享失敗')
    }
  }

  // Clear all data
  function clearAllData() {
    if (confirm('確定要清除今日所有學習紀錄嗎？')) {
      setSessions(prev => {
        const updated = { ...prev }
        delete updated[today]
        return updated
      })
      
      setMorningElapsed(0)
      setAfternoonElapsed(0)
      
      // Stop all timers
      if (morningInterval.current) {
        clearInterval(morningInterval.current)
        morningInterval.current = null
      }
      if (afternoonInterval.current) {
        clearInterval(afternoonInterval.current)
        afternoonInterval.current = null
      }
      morningStartTime.current = null
      afternoonStartTime.current = null
      setIsTimerRunning({ morning: false, afternoon: false })
    }
  }

  // Get current date display
  function getCurrentDate() {
    const now = new Date()
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    }
    return now.toLocaleDateString('zh-TW', options)
  }

  const todaySessions = sessions[today] || { morning: [], afternoon: [] }

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-8 text-center">
          <h1 className="text-4xl font-bold mb-3">📚 每日讀書時間紀錄</h1>
          <div className="text-xl opacity-90">{getCurrentDate()}</div>
        </div>

        <div className="p-8">
          {/* Share Controls */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">🔗 分享設定</h3>
            <div className="flex items-center gap-4">
              {shareCode ? (
                <>
                  <span className="text-green-600 font-medium">✅ 已啟用分享</span>
                  <button
                    onClick={cancelShare}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    取消分享
                  </button>
                  <span className="text-sm text-gray-600">
                    分享連結: {window.location.origin}/share/{shareCode}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-gray-600">❌ 未分享</span>
                  <button
                    onClick={generateShareLink}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    產生分享連結
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Morning Session */}
          <div className="bg-orange-50 rounded-lg p-6 mb-6 border-l-4 border-orange-400">
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-3">🌅</span>
              <h2 className="text-2xl font-bold text-gray-800">上午時段 (8:00 - 12:00)</h2>
            </div>
            
            <div className="text-center mb-6">
              <div className="text-5xl font-mono font-bold text-gray-700 mb-4">
                {formatTime(morningElapsed)}
              </div>
              <div className="space-x-4">
                <button
                  onClick={() => startTimer('morning')}
                  disabled={isTimerRunning.morning}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-full font-semibold transition-all transform hover:scale-105 disabled:hover:scale-100"
                >
                  開始
                </button>
                <button
                  onClick={() => stopTimer('morning')}
                  disabled={!isTimerRunning.morning}
                  className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-full font-semibold transition-all transform hover:scale-105 disabled:hover:scale-100"
                >
                  停止
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-gray-700">今日上午時段紀錄：</h4>
              <div className="space-y-2">
                {todaySessions.morning.map((session, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg flex justify-between items-center border">
                    <span>{session.start} - {session.end}</span>
                    <span className="font-semibold text-green-600">{formatTimeChinese(session.duration)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Afternoon Session */}
          <div className="bg-blue-50 rounded-lg p-6 mb-6 border-l-4 border-blue-400">
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-3">☀️</span>
              <h2 className="text-2xl font-bold text-gray-800">下午時段 (13:00 - 19:00)</h2>
            </div>
            
            <div className="text-center mb-6">
              <div className="text-5xl font-mono font-bold text-gray-700 mb-4">
                {formatTime(afternoonElapsed)}
              </div>
              <div className="space-x-4">
                <button
                  onClick={() => startTimer('afternoon')}
                  disabled={isTimerRunning.afternoon}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-full font-semibold transition-all transform hover:scale-105 disabled:hover:scale-100"
                >
                  開始
                </button>
                <button
                  onClick={() => stopTimer('afternoon')}
                  disabled={!isTimerRunning.afternoon}
                  className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-full font-semibold transition-all transform hover:scale-105 disabled:hover:scale-100"
                >
                  停止
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-gray-700">今日下午時段紀錄：</h4>
              <div className="space-y-2">
                {todaySessions.afternoon.map((session, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg flex justify-between items-center border">
                    <span>{session.start} - {session.end}</span>
                    <span className="font-semibold text-blue-600">{formatTimeChinese(session.duration)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Daily Summary */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-6 text-center">
            <h2 className="text-2xl font-bold mb-6">📊 今日學習統計</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-sm opacity-80 mb-1">上午總時數</div>
                <div className="text-xl font-bold">{formatTimeChinese(morningElapsed)}</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-sm opacity-80 mb-1">下午總時數</div>
                <div className="text-xl font-bold">{formatTimeChinese(afternoonElapsed)}</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-sm opacity-80 mb-1">全日總計</div>
                <div className="text-xl font-bold">{formatTimeChinese(morningElapsed + afternoonElapsed)}</div>
              </div>
            </div>
            
            <button
              onClick={clearAllData}
              className="mt-6 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full font-semibold transition-colors"
            >
              清除今日紀錄
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}