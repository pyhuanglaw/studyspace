'use client'

interface StudySession {
  start: string
  end: string
  duration: number
}

interface DailySessions {
  morning: StudySession[]
  afternoon: StudySession[]
}

interface SharedStudyViewProps {
  sessionsData: { [key: string]: DailySessions }
  shareCode: string
}

export default function SharedStudyView({ sessionsData, shareCode }: SharedStudyViewProps) {
  // Format time in Chinese
  function formatTimeChinese(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}小時${minutes}分`
  }

  // Get total time for a day
  function getDayTotal(sessions: DailySessions): number {
    const morningTotal = sessions.morning.reduce((total, session) => total + session.duration, 0)
    const afternoonTotal = sessions.afternoon.reduce((total, session) => total + session.duration, 0)
    return morningTotal + afternoonTotal
  }

  // Sort dates
  const sortedDates = Object.keys(sessionsData).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-8 text-center">
          <h1 className="text-4xl font-bold mb-3">📚 讀書時間紀錄 (分享檢視)</h1>
          <div className="text-lg opacity-90">🔗 分享代碼: {shareCode}</div>
          <div className="text-sm opacity-80 mt-2">此為唯讀檢視，無法修改紀錄</div>
        </div>

        <div className="p-8">
          {sortedDates.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h2 className="text-2xl font-bold text-gray-600 mb-2">尚無學習紀錄</h2>
              <p className="text-gray-500">還沒有任何學習時間紀錄</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Overall Statistics */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-6 text-center">
                <h2 className="text-2xl font-bold mb-4">📊 總學習統計</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <div className="text-sm opacity-80 mb-1">總學習天數</div>
                    <div className="text-xl font-bold">{sortedDates.length} 天</div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <div className="text-sm opacity-80 mb-1">累計學習時間</div>
                    <div className="text-xl font-bold">
                      {formatTimeChinese(
                        sortedDates.reduce((total, date) => total + getDayTotal(sessionsData[date]), 0)
                      )}
                    </div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <div className="text-sm opacity-80 mb-1">平均每日學習</div>
                    <div className="text-xl font-bold">
                      {formatTimeChinese(
                        Math.floor(sortedDates.reduce((total, date) => total + getDayTotal(sessionsData[date]), 0) / sortedDates.length)
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Daily Records */}
              {sortedDates.map((date) => {
                const sessions = sessionsData[date]
                const morningTotal = sessions.morning.reduce((total, session) => total + session.duration, 0)
                const afternoonTotal = sessions.afternoon.reduce((total, session) => total + session.duration, 0)
                const dayTotal = morningTotal + afternoonTotal
                
                return (
                  <div key={date} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Date Header */}
                    <div className="bg-gray-50 px-6 py-4 border-b">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-800">
                          {new Date(date).toLocaleDateString('zh-TW', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            weekday: 'long'
                          })}
                        </h3>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">當日總計</div>
                          <div className="text-lg font-bold text-blue-600">{formatTimeChinese(dayTotal)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Morning Sessions */}
                        <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-400">
                          <div className="flex items-center mb-3">
                            <span className="text-xl mr-2">🌅</span>
                            <h4 className="font-bold text-gray-800">上午時段</h4>
                            <span className="ml-auto text-orange-600 font-semibold">
                              {formatTimeChinese(morningTotal)}
                            </span>
                          </div>
                          
                          {sessions.morning.length > 0 ? (
                            <div className="space-y-2">
                              {sessions.morning.map((session, index) => (
                                <div key={index} className="bg-white p-3 rounded flex justify-between items-center text-sm">
                                  <span>{session.start} - {session.end}</span>
                                  <span className="font-semibold text-orange-600">{formatTimeChinese(session.duration)}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-gray-500 text-sm">無學習紀錄</div>
                          )}
                        </div>

                        {/* Afternoon Sessions */}
                        <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
                          <div className="flex items-center mb-3">
                            <span className="text-xl mr-2">☀️</span>
                            <h4 className="font-bold text-gray-800">下午時段</h4>
                            <span className="ml-auto text-blue-600 font-semibold">
                              {formatTimeChinese(afternoonTotal)}
                            </span>
                          </div>
                          
                          {sessions.afternoon.length > 0 ? (
                            <div className="space-y-2">
                              {sessions.afternoon.map((session, index) => (
                                <div key={index} className="bg-white p-3 rounded flex justify-between items-center text-sm">
                                  <span>{session.start} - {session.end}</span>
                                  <span className="font-semibold text-blue-600">{formatTimeChinese(session.duration)}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-gray-500 text-sm">無學習紀錄</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>這是一個分享的學習紀錄檢視頁面</p>
            <p>如需編輯或管理紀錄，請回到原始應用程式</p>
          </div>
        </div>
      </div>
    </div>
  )
}