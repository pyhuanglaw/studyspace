'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'

interface StudySession {
  id: string
  period: 'morning' | 'afternoon'
  startTime: string
  endTime: string
  duration: number
}

interface LeaveDay {
  id: string
  date: string
  reason?: string
}

export default function StudyTracker() {
  const { data: session, status } = useSession()
  
  // Timer states
  const [morningElapsed, setMorningElapsed] = useState(0)
  const [afternoonElapsed, setAfternoonElapsed] = useState(0)
  const [morningRunning, setMorningRunning] = useState(false)
  const [afternoonRunning, setAfternoonRunning] = useState(false)
  
  // Session data
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [leaveDay, setLeaveDay] = useState<LeaveDay | null>(null)
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [leaveReason, setLeaveReason] = useState('')
  
  // Timer refs
  const morningStartTimeRef = useRef<number | null>(null)
  const afternoonStartTimeRef = useRef<number | null>(null)
  const morningIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const afternoonIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  const currentDate = new Date().toISOString().split('T')[0]
  
  // Load data when component mounts or session changes
  useEffect(() => {
    if (session?.user) {
      loadTodayData()
    }
  }, [session]) // eslint-disable-line react-hooks/exhaustive-deps
  
  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (morningIntervalRef.current) clearInterval(morningIntervalRef.current)
      if (afternoonIntervalRef.current) clearInterval(afternoonIntervalRef.current)
    }
  }, [])
  
  const loadTodayData = async () => {
    try {
      // Load study sessions
      const sessionsResponse = await fetch(`/api/study-sessions?date=${currentDate}`)
      if (sessionsResponse.ok) {
        const sessionData = await sessionsResponse.json()
        setSessions(sessionData)
        
        // Calculate elapsed time
        const morningTotal = sessionData
          .filter((s: StudySession) => s.period === 'morning')
          .reduce((total: number, s: StudySession) => total + s.duration, 0)
        const afternoonTotal = sessionData
          .filter((s: StudySession) => s.period === 'afternoon')
          .reduce((total: number, s: StudySession) => total + s.duration, 0)
        
        setMorningElapsed(morningTotal)
        setAfternoonElapsed(afternoonTotal)
      }
      
      // Load leave day status
      const leaveResponse = await fetch(`/api/leave-days?date=${currentDate}`)
      if (leaveResponse.ok) {
        const leaveData = await leaveResponse.json()
        setLeaveDay(leaveData)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }
  
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  const formatTimeChinese = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}小時${minutes}分`
  }
  
  const getCurrentDisplayTime = (period: 'morning' | 'afternoon'): string => {
    if (period === 'morning') {
      if (morningRunning && morningStartTimeRef.current) {
        const currentElapsed = morningElapsed + Math.floor((Date.now() - morningStartTimeRef.current) / 1000)
        return formatTime(currentElapsed)
      }
      return formatTime(morningElapsed)
    } else {
      if (afternoonRunning && afternoonStartTimeRef.current) {
        const currentElapsed = afternoonElapsed + Math.floor((Date.now() - afternoonStartTimeRef.current) / 1000)
        return formatTime(currentElapsed)
      }
      return formatTime(afternoonElapsed)
    }
  }
  
  const startTimer = (period: 'morning' | 'afternoon') => {
    const now = new Date()
    const currentHour = now.getHours()
    
    // Check time constraints
    if (period === 'morning' && (currentHour < 8 || currentHour >= 12)) {
      alert('上午時段為 8:00-12:00，請在正確時間內使用')
      return
    }
    if (period === 'afternoon' && (currentHour < 13 || currentHour >= 19)) {
      alert('下午時段為 13:00-19:00，請在正確時間內使用')
      return
    }
    
    if (period === 'morning') {
      morningStartTimeRef.current = Date.now()
      setMorningRunning(true)
      morningIntervalRef.current = setInterval(() => {
        // Trigger re-render to update display
        setMorningElapsed(prev => prev)
      }, 1000)
    } else {
      afternoonStartTimeRef.current = Date.now()
      setAfternoonRunning(true)
      afternoonIntervalRef.current = setInterval(() => {
        // Trigger re-render to update display
        setAfternoonElapsed(prev => prev)
      }, 1000)
    }
  }
  
  const stopTimer = async (period: 'morning' | 'afternoon') => {
    let sessionDuration = 0
    let startTime: number
    let endTime: number
    
    if (period === 'morning') {
      if (morningStartTimeRef.current) {
        endTime = Date.now()
        startTime = morningStartTimeRef.current
        sessionDuration = Math.floor((endTime - startTime) / 1000)
        setMorningElapsed(prev => prev + sessionDuration)
      }
      setMorningRunning(false)
      if (morningIntervalRef.current) {
        clearInterval(morningIntervalRef.current)
        morningIntervalRef.current = null
      }
      morningStartTimeRef.current = null
    } else {
      if (afternoonStartTimeRef.current) {
        endTime = Date.now()
        startTime = afternoonStartTimeRef.current
        sessionDuration = Math.floor((endTime - startTime) / 1000)
        setAfternoonElapsed(prev => prev + sessionDuration)
      }
      setAfternoonRunning(false)
      if (afternoonIntervalRef.current) {
        clearInterval(afternoonIntervalRef.current)
        afternoonIntervalRef.current = null
      }
      afternoonStartTimeRef.current = null
    }
    
    // Save session to database
    if (sessionDuration > 0) {
      try {
        await fetch('/api/study-sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            date: currentDate,
            period,
            startTime: new Date(startTime!).toISOString(),
            endTime: new Date(endTime!).toISOString(),
            duration: sessionDuration
          })
        })
        
        // Reload data to update session list
        await loadTodayData()
      } catch (error) {
        console.error('Error saving session:', error)
      }
    }
  }
  
  const clearAllData = async () => {
    if (!confirm('確定要清除今日所有學習紀錄嗎？')) {
      return
    }
    
    try {
      await fetch(`/api/study-sessions?date=${currentDate}`, {
        method: 'DELETE'
      })
      
      // Stop all timers
      setMorningRunning(false)
      setAfternoonRunning(false)
      if (morningIntervalRef.current) {
        clearInterval(morningIntervalRef.current)
        morningIntervalRef.current = null
      }
      if (afternoonIntervalRef.current) {
        clearInterval(afternoonIntervalRef.current)
        afternoonIntervalRef.current = null
      }
      morningStartTimeRef.current = null
      afternoonStartTimeRef.current = null
      
      // Reset state
      setMorningElapsed(0)
      setAfternoonElapsed(0)
      setSessions([])
    } catch (error) {
      console.error('Error clearing data:', error)
    }
  }
  
  const handleLeaveDay = async () => {
    try {
      await fetch('/api/leave-days', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: currentDate,
          reason: leaveReason || null
        })
      })
      
      await loadTodayData()
      setShowLeaveModal(false)
      setLeaveReason('')
    } catch (error) {
      console.error('Error setting leave day:', error)
    }
  }
  
  const removeLeaveDay = async () => {
    try {
      await fetch(`/api/leave-days?date=${currentDate}`, {
        method: 'DELETE'
      })
      
      await loadTodayData()
    } catch (error) {
      console.error('Error removing leave day:', error)
    }
  }
  
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-white text-xl">載入中...</div>
      </div>
    )
  }
  
  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">📚 每日讀書時間紀錄</h1>
            <p className="text-gray-600 mb-8">請登入以開始使用雲端同步功能</p>
            <button
              onClick={() => signIn('google')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 transform hover:-translate-y-1"
            >
              使用 Google 帳號登入
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  const formatDate = () => {
    const now = new Date()
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    }
    return now.toLocaleDateString('zh-TW', options)
  }
  
  const getMorningSessions = () => sessions.filter(s => s.period === 'morning')
  const getAfternoonSessions = () => sessions.filter(s => s.period === 'afternoon')
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-5">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-8 text-center">
          <div className="flex justify-between items-center mb-4">
            <div></div>
            <h1 className="text-4xl font-bold">📚 每日讀書時間紀錄</h1>
            <button
              onClick={() => signOut()}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full text-sm transition-all"
            >
              登出
            </button>
          </div>
          <div className="text-xl opacity-90">
            {formatDate()}
          </div>
          <div className="text-sm opacity-75 mt-2">
            歡迎，{session.user?.name}
          </div>
        </div>
        
        <div className="p-8">
          {/* Leave Day Section */}
          {leaveDay ? (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-6 mb-6 rounded-r-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-yellow-800">🏖️ 今日請假</h3>
                  {leaveDay.reason && (
                    <p className="text-yellow-700 mt-1">原因：{leaveDay.reason}</p>
                  )}
                </div>
                <button
                  onClick={removeLeaveDay}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-all"
                >
                  取消請假
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center mb-6">
              <button
                onClick={() => setShowLeaveModal(true)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg transition-all"
              >
                🏖️ 設定請假
              </button>
            </div>
          )}
          
          {/* Morning Section */}
          <div className="bg-gray-50 border-l-4 border-orange-500 rounded-r-lg p-6 mb-6">
            <div className="flex items-center mb-5">
              <span className="text-2xl mr-3">🌅</span>
              <h2 className="text-2xl font-bold">上午時段 (8:00 - 12:00)</h2>
            </div>
            
            <div className="text-5xl font-mono font-bold text-center my-6 text-gray-800">
              {getCurrentDisplayTime('morning')}
            </div>
            
            <div className="text-center mb-6">
              <button
                onClick={() => startTimer('morning')}
                disabled={morningRunning || !!leaveDay}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-full mr-4 transition-all transform hover:-translate-y-1 disabled:transform-none"
              >
                開始
              </button>
              <button
                onClick={() => stopTimer('morning')}
                disabled={!morningRunning}
                className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-full transition-all transform hover:-translate-y-1 disabled:transform-none"
              >
                停止
              </button>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">今日上午時段紀錄：</h4>
              <div className="space-y-2">
                {getMorningSessions().map((session) => (
                  <div key={session.id} className="bg-white p-3 rounded-lg flex justify-between items-center border">
                    <span>
                      {new Date(session.startTime).toLocaleTimeString('zh-TW')} - {new Date(session.endTime).toLocaleTimeString('zh-TW')}
                    </span>
                    <span className="font-semibold">
                      {formatTimeChinese(session.duration)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Afternoon Section */}
          <div className="bg-gray-50 border-l-4 border-blue-500 rounded-r-lg p-6 mb-6">
            <div className="flex items-center mb-5">
              <span className="text-2xl mr-3">☀️</span>
              <h2 className="text-2xl font-bold">下午時段 (13:00 - 19:00)</h2>
            </div>
            
            <div className="text-5xl font-mono font-bold text-center my-6 text-gray-800">
              {getCurrentDisplayTime('afternoon')}
            </div>
            
            <div className="text-center mb-6">
              <button
                onClick={() => startTimer('afternoon')}
                disabled={afternoonRunning || !!leaveDay}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-full mr-4 transition-all transform hover:-translate-y-1 disabled:transform-none"
              >
                開始
              </button>
              <button
                onClick={() => stopTimer('afternoon')}
                disabled={!afternoonRunning}
                className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-full transition-all transform hover:-translate-y-1 disabled:transform-none"
              >
                停止
              </button>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">今日下午時段紀錄：</h4>
              <div className="space-y-2">
                {getAfternoonSessions().map((session) => (
                  <div key={session.id} className="bg-white p-3 rounded-lg flex justify-between items-center border">
                    <span>
                      {new Date(session.startTime).toLocaleTimeString('zh-TW')} - {new Date(session.endTime).toLocaleTimeString('zh-TW')}
                    </span>
                    <span className="font-semibold">
                      {formatTimeChinese(session.duration)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Summary Section */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-6 text-center">
            <h2 className="text-2xl font-bold mb-6">📊 今日學習統計</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white/10 p-4 rounded-lg">
                <div className="text-sm opacity-80 mb-2">上午總時數</div>
                <div className="text-2xl font-bold">{formatTimeChinese(morningElapsed)}</div>
              </div>
              <div className="bg-white/10 p-4 rounded-lg">
                <div className="text-sm opacity-80 mb-2">下午總時數</div>
                <div className="text-2xl font-bold">{formatTimeChinese(afternoonElapsed)}</div>
              </div>
              <div className="bg-white/10 p-4 rounded-lg">
                <div className="text-sm opacity-80 mb-2">全日總計</div>
                <div className="text-2xl font-bold">{formatTimeChinese(morningElapsed + afternoonElapsed)}</div>
              </div>
            </div>
            
            <button
              onClick={clearAllData}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-full transition-all transform hover:-translate-y-1"
            >
              清除今日紀錄
            </button>
          </div>
        </div>
      </div>
      
      {/* Leave Day Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">設定請假</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                請假原因（可選）
              </label>
              <textarea
                value={leaveReason}
                onChange={(e) => setLeaveReason(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="例如：身體不適、家庭事務等..."
              />
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleLeaveDay}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg transition-all"
              >
                確認請假
              </button>
              <button
                onClick={() => {
                  setShowLeaveModal(false)
                  setLeaveReason('')
                }}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-all"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}