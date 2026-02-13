import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Get all session groups
export async function GET() {
  try {
    const sessions = await db.sSHSession.findMany({
      where: {
        group: { not: null }
      },
      select: {
        group: true
      },
      distinct: ['group']
    })
    
    const groups = sessions
      .map(s => s.group)
      .filter((g): g is string => g !== null)
      .sort()
    
    return NextResponse.json({ groups })
  } catch (error) {
    console.error('Error fetching groups:', error)
    return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 })
  }
}
