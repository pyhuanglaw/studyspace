// Mock database implementation for development/demo purposes
// In production, this should be replaced with actual Vercel Postgres

import fs from 'fs'
import path from 'path'

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

// File-based storage for demo purposes
const dbFilePath = path.join(process.cwd(), 'tmp-share-db.json')

function readDatabase(): ShareData[] {
  try {
    if (fs.existsSync(dbFilePath)) {
      const data = fs.readFileSync(dbFilePath, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading database:', error)
  }
  return []
}

function writeDatabase(data: ShareData[]) {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing database:', error)
  }
}

export async function initializeDatabase() {
  // Mock implementation - in production this would create database tables
  console.log('Mock database initialized')
}

export async function createShareLink(sessionsData: { [key: string]: DailySessions }): Promise<string> {
  const shareCode = generateShareCode()
  
  const shareData: ShareData = {
    id: Math.random().toString(),
    share_code: shareCode,
    sessions_data: sessionsData,
    created_at: new Date(),
    is_active: true
  }
  
  const database = readDatabase()
  database.push(shareData)
  writeDatabase(database)
  
  return shareCode
}

export async function getSharedSessions(shareCode: string): Promise<{ [key: string]: DailySessions } | null> {
  const database = readDatabase()
  const shareData = database.find(data => data.share_code === shareCode && data.is_active)
  
  if (!shareData) {
    return null
  }
  
  return shareData.sessions_data
}

export async function deactivateShareLink(shareCode: string): Promise<boolean> {
  const database = readDatabase()
  const shareDataIndex = database.findIndex(data => data.share_code === shareCode)
  
  if (shareDataIndex === -1) {
    return false
  }
  
  database[shareDataIndex].is_active = false
  writeDatabase(database)
  return true
}

function generateShareCode(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}