import { getSharedSessions } from '@/lib/database-mock'
import SharedStudyView from '@/components/SharedStudyView'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ shareCode: string }>
}

export default async function SharedPage({ params }: PageProps) {
  const { shareCode } = await params
  
  try {
    const sessionsData = await getSharedSessions(shareCode)
    
    if (!sessionsData) {
      notFound()
    }
    
    return <SharedStudyView sessionsData={sessionsData} shareCode={shareCode} />
  } catch (error) {
    console.error('Error loading shared sessions:', error)
    notFound()
  }
}