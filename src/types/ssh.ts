// SSH Session Types
export interface SSHSession {
  id: string
  name: string
  host: string
  port: number
  username: string
  authType: 'password' | 'key'
  password?: string | null
  privateKey?: string | null
  passphrase?: string | null
  timeout: number
  keepAlive: boolean
  terminalType: string
  cols: number
  rows: number
  fontSize: number
  fontFamily: string
  theme: string
  lastConnected?: Date | null
  connectionCount: number
  isFavorite: boolean
  group?: string | null
  createdAt: Date
  updatedAt: Date
  _count?: {
    history: number
  }
}

// Terminal Tab
export interface TerminalTab {
  id: string
  sessionId: string
  sessionName: string
  host: string
  status: 'connecting' | 'connected' | 'disconnected' | 'error'
  connectionId?: string
  error?: string
}

// Terminal Theme
export interface TerminalTheme {
  id: string
  name: string
  displayName: string
  background: string
  foreground: string
  cursor: string
  cursorAccent?: string
  selection?: string
  black: string
  red: string
  green: string
  yellow: string
  blue: string
  magenta: string
  cyan: string
  white: string
  brightBlack: string
  brightRed: string
  brightGreen: string
  brightYellow: string
  brightBlue: string
  brightMagenta: string
  brightCyan: string
  brightWhite: string
  isDefault: boolean
}

// SSH Config for connection
export interface SSHConfig {
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

// Connection History
export interface ConnectionHistory {
  id: string
  sessionId: string
  connectedAt: Date
  disconnectedAt?: Date | null
  duration?: number | null
  success: boolean
  errorMessage?: string | null
}
