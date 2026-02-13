import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST - Record connection attempt and return session credentials
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const session = await db.sSHSession.findUnique({
      where: { id }
    })
    
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }
    
    // Update last connected and increment count
    await db.sSHSession.update({
      where: { id },
      data: {
        lastConnected: new Date(),
        connectionCount: { increment: 1 }
      }
    })
    
    // Create history entry
    await db.connectionHistory.create({
      data: {
        sessionId: id,
        connectedAt: new Date(),
        success: true
      }
    })
    
    // Return session with credentials (for connection)
    return NextResponse.json({ 
      session: {
        id: session.id,
        name: session.name,
        host: session.host,
        port: session.port,
        username: session.username,
        authType: session.authType,
        password: session.password,
        privateKey: session.privateKey,
        passphrase: session.passphrase,
        timeout: session.timeout,
        terminalType: session.terminalType,
        cols: session.cols,
        rows: session.rows,
        fontSize: session.fontSize,
        fontFamily: session.fontFamily,
        theme: session.theme,
      }
    })
  } catch (error) {
    console.error('Error connecting to session:', error)
    return NextResponse.json({ error: 'Failed to connect to session' }, { status: 500 })
  }
}
