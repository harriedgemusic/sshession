import { createServer } from 'http'
import { Server } from 'socket.io'
import { Client } from 'ssh2'
import { v4 as uuidv4 } from 'uuid'

const httpServer = createServer()
const io = new Server(httpServer, {
  path: '/',
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})

// Store active SSH connections
interface SSHConnection {
  id: string
  client: Client
  stream: any
  sessionId: string
  tabId: string
  socketId: string
}

const connections = new Map<string, SSHConnection>()

interface SSHConfig {
  host: string
  port: number
  username: string
  password?: string
  privateKey?: string
  passphrase?: string
  timeout?: number
  terminalType?: string
  cols?: number
  rows?: number
}

// Create SSH connection
function createSSHConnection(config: SSHConfig, socketId: string, tabId: string): Promise<{ connectionId: string }> {
  return new Promise((resolve, reject) => {
    const conn = new Client()
    const connectionId = uuidv4()

    const connectionConfig: any = {
      host: config.host,
      port: config.port || 22,
      username: config.username,
      readyTimeout: config.timeout || 30000,
      keepaliveInterval: 30000,
      keepaliveCountMax: 3,
    }

    // Set authentication method
    if (config.privateKey) {
      connectionConfig.privateKey = config.privateKey
      if (config.passphrase) {
        connectionConfig.passphrase = config.passphrase
      }
    } else if (config.password) {
      connectionConfig.password = config.password
    } else {
      // Try default SSH key
      connectionConfig.agent = process.env.SSH_AUTH_SOCK
    }

    conn.on('ready', () => {
      const termType = config.terminalType || 'xterm-256color'
      const cols = config.cols || 80
      const rows = config.rows || 24

      conn.shell({
        term: termType,
        cols: cols,
        rows: rows,
      }, (err, stream) => {
        if (err) {
          conn.end()
          reject(new Error(`Failed to create shell: ${err.message}`))
          return
        }

        // Store the connection
        const sshConn: SSHConnection = {
          id: connectionId,
          client: conn,
          stream: stream,
          sessionId: '',
          tabId: tabId,
          socketId: socketId,
        }
        connections.set(connectionId, sshConn)

        // Handle incoming data from SSH stream
        stream.on('data', (data: Buffer) => {
          io.to(socketId).emit('ssh:data', {
            connectionId,
            data: data.toString('utf-8')
          })
        })

        // Handle stream close
        stream.on('close', () => {
          io.to(socketId).emit('ssh:closed', { connectionId })
          conn.end()
          connections.delete(connectionId)
        })

        // Handle stream error
        stream.stderr.on('data', (data: Buffer) => {
          io.to(socketId).emit('ssh:error', {
            connectionId,
            error: data.toString('utf-8')
          })
        })

        resolve({ connectionId })
      })
    })

    conn.on('error', (err) => {
      reject(new Error(`SSH connection error: ${err.message}`))
    })

    conn.on('close', () => {
      const connData = connections.get(connectionId)
      if (connData) {
        io.to(socketId).emit('ssh:closed', { connectionId })
        connections.delete(connectionId)
      }
    })

    try {
      conn.connect(connectionConfig)
    } catch (err: any) {
      reject(new Error(`Failed to connect: ${err.message}`))
    }
  })
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`)
  
  // Join a room for this socket (for targeted messages)
  socket.join(socket.id)

  // Handle SSH connection request
  socket.on('ssh:connect', async (data: { config: SSHConfig; tabId: string }) => {
    try {
      const { config, tabId } = data
      console.log(`SSH connect request: ${config.username}@${config.host}:${config.port}`)
      
      socket.emit('ssh:connecting', { tabId, host: config.host })
      
      const result = await createSSHConnection(config, socket.id, tabId)
      
      socket.emit('ssh:connected', {
        connectionId: result.connectionId,
        tabId,
        host: config.host,
        username: config.username,
        port: config.port
      })
    } catch (err: any) {
      console.error('SSH connection error:', err.message)
      socket.emit('ssh:error', {
        tabId: data.tabId,
        error: err.message
      })
    }
  })

  // Handle terminal input
  socket.on('ssh:input', (data: { connectionId: string; input: string }) => {
    const conn = connections.get(data.connectionId)
    if (conn && conn.stream) {
      conn.stream.write(data.input)
    }
  })

  // Handle terminal resize
  socket.on('ssh:resize', (data: { connectionId: string; cols: number; rows: number }) => {
    const conn = connections.get(data.connectionId)
    if (conn && conn.stream) {
      conn.stream.setWindow(data.rows, data.cols, 480, 640)
    }
  })

  // Handle SSH disconnect request
  socket.on('ssh:disconnect', (data: { connectionId: string }) => {
    const conn = connections.get(data.connectionId)
    if (conn) {
      conn.stream?.end()
      conn.client.end()
      connections.delete(data.connectionId)
      socket.emit('ssh:closed', { connectionId: data.connectionId })
    }
  })

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`)
    
    // Clean up all connections for this socket
    for (const [connectionId, conn] of connections.entries()) {
      if (conn.socketId === socket.id) {
        try {
          conn.stream?.end()
          conn.client.end()
        } catch (e) {
          // Ignore errors during cleanup
        }
        connections.delete(connectionId)
      }
    }
  })

  // Handle errors
  socket.on('error', (error) => {
    console.error(`Socket error (${socket.id}):`, error)
  })

  // Send connection status
  socket.emit('ssh:ready', { 
    message: 'SSH service ready',
    activeConnections: connections.size 
  })
})

// Health check endpoint
httpServer.on('request', (req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ 
      status: 'ok', 
      connections: connections.size,
      uptime: process.uptime()
    }))
  }
})

const PORT = 3003
httpServer.listen(PORT, () => {
  console.log(`SSH WebSocket service running on port ${PORT}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM signal, shutting down...')
  
  // Close all SSH connections
  for (const [id, conn] of connections.entries()) {
    try {
      conn.stream?.end()
      conn.client.end()
    } catch (e) {
      // Ignore errors during shutdown
    }
  }
  connections.clear()
  
  httpServer.close(() => {
    console.log('SSH WebSocket service closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('Received SIGINT signal, shutting down...')
  
  for (const [id, conn] of connections.entries()) {
    try {
      conn.stream?.end()
      conn.client.end()
    } catch (e) {
      // Ignore errors during shutdown
    }
  }
  connections.clear()
  
  httpServer.close(() => {
    console.log('SSH WebSocket service closed')
    process.exit(0)
  })
})
