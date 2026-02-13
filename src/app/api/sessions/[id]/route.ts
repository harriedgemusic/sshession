import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Get session by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const session = await db.sSHSession.findUnique({
      where: { id },
      include: {
        history: {
          take: 10,
          orderBy: { connectedAt: 'desc' }
        }
      }
    })
    
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }
    
    // Remove sensitive data
    const safeSession = {
      ...session,
      password: session.password ? '••••••••' : null,
      privateKey: session.privateKey ? '••••••••' : null,
      passphrase: session.passphrase ? '••••••••' : null,
    }
    
    return NextResponse.json({ session: safeSession })
  } catch (error) {
    console.error('Error fetching session:', error)
    return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 })
  }
}

// PUT - Update session
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // Build update data
    const updateData: any = {}
    
    if (body.name !== undefined) updateData.name = body.name
    if (body.host !== undefined) updateData.host = body.host
    if (body.port !== undefined) updateData.port = body.port
    if (body.username !== undefined) updateData.username = body.username
    if (body.authType !== undefined) updateData.authType = body.authType
    if (body.password !== undefined && body.password !== '••••••••') updateData.password = body.password
    if (body.privateKey !== undefined && body.privateKey !== '••••••••') updateData.privateKey = body.privateKey
    if (body.passphrase !== undefined && body.passphrase !== '••••••••') updateData.passphrase = body.passphrase
    if (body.timeout !== undefined) updateData.timeout = body.timeout
    if (body.keepAlive !== undefined) updateData.keepAlive = body.keepAlive
    if (body.terminalType !== undefined) updateData.terminalType = body.terminalType
    if (body.cols !== undefined) updateData.cols = body.cols
    if (body.rows !== undefined) updateData.rows = body.rows
    if (body.fontSize !== undefined) updateData.fontSize = body.fontSize
    if (body.fontFamily !== undefined) updateData.fontFamily = body.fontFamily
    if (body.theme !== undefined) updateData.theme = body.theme
    if (body.group !== undefined) updateData.group = body.group
    if (body.isFavorite !== undefined) updateData.isFavorite = body.isFavorite
    
    const session = await db.sSHSession.update({
      where: { id },
      data: updateData
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
    console.error('Error updating session:', error)
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 })
  }
}

// DELETE - Delete session
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    await db.sSHSession.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting session:', error)
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 })
  }
}
