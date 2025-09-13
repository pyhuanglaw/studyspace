import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!date) {
      return NextResponse.json({ error: 'Date parameter required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const studySessions = await prisma.studySession.findMany({
      where: {
        userId: user.id,
        date: date
      },
      orderBy: { startTime: 'asc' }
    })

    return NextResponse.json(studySessions)
  } catch (error) {
    console.error('Error fetching study sessions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { date, period, startTime, endTime, duration } = await request.json()

    const studySession = await prisma.studySession.create({
      data: {
        userId: user.id,
        date,
        period,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        duration
      }
    })

    return NextResponse.json(studySession)
  } catch (error) {
    console.error('Error creating study session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!date) {
      return NextResponse.json({ error: 'Date parameter required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    await prisma.studySession.deleteMany({
      where: {
        userId: user.id,
        date: date
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting study sessions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}