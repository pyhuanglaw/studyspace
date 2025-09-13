import { sql } from '@vercel/postgres'

export interface StudySession {
  start: string
  end: string
  duration: number
}

export interface DailySessions {
  morning: StudySession[]
  afternoon: StudySession[]
}

export interface ShareData {
  id: string
  share_code: string
  sessions_data: { [key: string]: DailySessions }
  created_at: Date
  is_active: boolean
}

export async function initializeDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS shared_sessions (
        id SERIAL PRIMARY KEY,
        share_code VARCHAR(255) UNIQUE NOT NULL,
        sessions_data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT true
      )
    `
  } catch (error) {
    console.error('Database initialization error:', error)
  }
}

export async function createShareLink(sessionsData: { [key: string]: DailySessions }): Promise<string> {
  const shareCode = generateShareCode()
  
  await sql`
    INSERT INTO shared_sessions (share_code, sessions_data)
    VALUES (${shareCode}, ${JSON.stringify(sessionsData)})
  `
  
  return shareCode
}

export async function getSharedSessions(shareCode: string): Promise<{ [key: string]: DailySessions } | null> {
  const result = await sql`
    SELECT sessions_data 
    FROM shared_sessions 
    WHERE share_code = ${shareCode} AND is_active = true
  `
  
  if (result.rows.length === 0) {
    return null
  }
  
  return result.rows[0].sessions_data as { [key: string]: DailySessions }
}

export async function deactivateShareLink(shareCode: string): Promise<boolean> {
  const result = await sql`
    UPDATE shared_sessions 
    SET is_active = false 
    WHERE share_code = ${shareCode}
  `
  
  return result.rowCount !== null && result.rowCount > 0
}

function generateShareCode(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}