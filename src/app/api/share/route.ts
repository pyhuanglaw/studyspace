import { NextRequest, NextResponse } from 'next/server'
import { createShareLink, initializeDatabase } from '@/lib/database-mock'

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase()
    
    const { sessions } = await request.json()
    
    if (!sessions || Object.keys(sessions).length === 0) {
      return NextResponse.json({ error: 'No sessions data provided' }, { status: 400 })
    }
    
    const shareCode = await createShareLink(sessions)
    
    return NextResponse.json({ shareCode })
  } catch (error) {
    console.error('Error creating share link:', error)
    return NextResponse.json({ error: 'Failed to create share link' }, { status: 500 })
  }
}