import { NextRequest, NextResponse } from 'next/server'
import { deactivateShareLink } from '@/lib/database-mock'

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ shareCode: string }> }
) {
  try {
    const params = await context.params
    const shareCode = params.shareCode
    
    if (!shareCode) {
      return NextResponse.json({ error: 'Share code is required' }, { status: 400 })
    }
    
    const success = await deactivateShareLink(shareCode)
    
    if (!success) {
      return NextResponse.json({ error: 'Share link not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deactivating share link:', error)
    return NextResponse.json({ error: 'Failed to deactivate share link' }, { status: 500 })
  }
}