import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - List all sessions
export async function GET() {
  try {
    const sessions = await db.sSHSession.findMany({
      orderBy: [
        { isFavorite: 'desc' },
        { lastConnected: 'desc' },
        { name: 'asc' }
      ],
      include: {
        _count: {
          select: { history: true }
        }
      }
    })
    
    // Remove sensitive data
    const safeSessions = sessions.map(session => ({
      ...session,
      password: session.password ? '••••••••' : null,
      privateKey: session.privateKey ? '••••••••' : null,
      passphrase: session.passphrase ? '••••••••' : null,
    }))
    
    return NextResponse.json({ sessions: safeSessions })
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
  }
}

// POST - Create new session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const session = await db.sSHSession.create({
      data: {
        name: body.name,
        host: body.host,
        port: body.port || 22,
        username: body.username,
        authType: body.authType || 'password',
        password: body.password,
        privateKey: body.privateKey,
        passphrase: body.passphrase,
        timeout: body.timeout || 30000,
        keepAlive: body.keepAlive ?? true,
        terminalType: body.terminalType || 'xterm-256color',
        cols: body.cols || 80,
        rows: body.rows || 24,
        fontSize: body.fontSize || 14,
        fontFamily: body.fontFamily || "Menlo, Monaco, 'Courier New', monospace",
        theme: body.theme || 'default',
        group: body.group,
        isFavorite: body.isFavorite || false,
      }
    })
    
    // Remove sensitive data from response
    const safeSession = {
      ...session,
      password: session.password ? '••••••••' : null,
      privateKey: session.privateKey ? '••••••••' : null,
      passphrase: session.passphrase ? '••••••••' : null,
    }
    
    return NextResponse.json({ session: safeSession })
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }
}
