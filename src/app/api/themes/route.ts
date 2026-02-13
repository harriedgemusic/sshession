import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Default terminal themes
const defaultThemes = [
  {
    name: 'default',
    displayName: 'Default',
    background: '#1e1e1e',
    foreground: '#d4d4d4',
    cursor: '#ffffff',
    cursorAccent: '#000000',
    selection: 'rgba(255, 255, 255, 0.3)',
    black: '#000000',
    red: '#cd3131',
    green: '#0dbc79',
    yellow: '#e5e510',
    blue: '#2472c8',
    magenta: '#bc3fbc',
    cyan: '#11a8cd',
    white: '#e5e5e5',
    brightBlack: '#666666',
    brightRed: '#f14c4c',
    brightGreen: '#23d18b',
    brightYellow: '#f5f543',
    brightBlue: '#3b8eea',
    brightMagenta: '#d670d6',
    brightCyan: '#29b8db',
    brightWhite: '#ffffff',
    isDefault: true,
  },
  {
    name: 'dracula',
    displayName: 'Dracula',
    background: '#282a36',
    foreground: '#f8f8f2',
    cursor: '#f8f8f0',
    cursorAccent: '#282a36',
    selection: 'rgba(255, 255, 255, 0.1)',
    black: '#000000',
    red: '#ff5555',
    green: '#50fa7b',
    yellow: '#f1fa8c',
    blue: '#caa9fa',
    magenta: '#ff79c6',
    cyan: '#8be9fd',
    white: '#bfbfbf',
    brightBlack: '#282a36',
    brightRed: '#ff5555',
    brightGreen: '#50fa7b',
    brightYellow: '#f1fa8c',
    brightBlue: '#caa9fa',
    brightMagenta: '#ff79c6',
    brightCyan: '#8be9fd',
    brightWhite: '#f8f8f2',
    isDefault: true,
  },
  {
    name: 'monokai',
    displayName: 'Monokai',
    background: '#272822',
    foreground: '#f8f8f2',
    cursor: '#f8f8f0',
    cursorAccent: '#272822',
    selection: 'rgba(255, 255, 255, 0.1)',
    black: '#000000',
    red: '#f92672',
    green: '#a6e22e',
    yellow: '#f4bf75',
    blue: '#66d9ef',
    magenta: '#ae81ff',
    cyan: '#a1efe4',
    white: '#f8f8f2',
    brightBlack: '#75715e',
    brightRed: '#f92672',
    brightGreen: '#a6e22e',
    brightYellow: '#f4bf75',
    brightBlue: '#66d9ef',
    brightMagenta: '#ae81ff',
    brightCyan: '#a1efe4',
    brightWhite: '#f9f8f5',
    isDefault: true,
  },
  {
    name: 'nord',
    displayName: 'Nord',
    background: '#2e3440',
    foreground: '#d8dee9',
    cursor: '#d8dee9',
    cursorAccent: '#2e3440',
    selection: 'rgba(67, 76, 94, 0.5)',
    black: '#3b4252',
    red: '#bf616a',
    green: '#a3be8c',
    yellow: '#ebcb8b',
    blue: '#81a1c1',
    magenta: '#b48ead',
    cyan: '#88c0d0',
    white: '#e5e9f0',
    brightBlack: '#4c566a',
    brightRed: '#bf616a',
    brightGreen: '#a3be8c',
    brightYellow: '#ebcb8b',
    brightBlue: '#81a1c1',
    brightMagenta: '#b48ead',
    brightCyan: '#8fbcbb',
    brightWhite: '#eceff4',
    isDefault: true,
  },
  {
    name: 'solarized-dark',
    displayName: 'Solarized Dark',
    background: '#002b36',
    foreground: '#839496',
    cursor: '#839496',
    cursorAccent: '#002b36',
    selection: 'rgba(255, 255, 255, 0.1)',
    black: '#073642',
    red: '#dc322f',
    green: '#859900',
    yellow: '#b58900',
    blue: '#268bd2',
    magenta: '#d33682',
    cyan: '#2aa198',
    white: '#eee8d5',
    brightBlack: '#002b36',
    brightRed: '#cb4b16',
    brightGreen: '#586e75',
    brightYellow: '#657b83',
    brightBlue: '#839496',
    brightMagenta: '#6c71c4',
    brightCyan: '#93a1a1',
    brightWhite: '#fdf6e3',
    isDefault: true,
  },
  {
    name: 'gruvbox',
    displayName: 'Gruvbox',
    background: '#282828',
    foreground: '#ebdbb2',
    cursor: '#ebdbb2',
    cursorAccent: '#282828',
    selection: 'rgba(255, 255, 255, 0.1)',
    black: '#282828',
    red: '#cc241d',
    green: '#98971a',
    yellow: '#d79921',
    blue: '#458588',
    magenta: '#b16286',
    cyan: '#689d6a',
    white: '#a89984',
    brightBlack: '#928374',
    brightRed: '#fb4934',
    brightGreen: '#b8bb26',
    brightYellow: '#fabd2f',
    brightBlue: '#83a598',
    brightMagenta: '#d3869b',
    brightCyan: '#8ec07c',
    brightWhite: '#ebdbb2',
    isDefault: true,
  },
]

// GET - List all themes
export async function GET() {
  try {
    let themes = await db.terminalTheme.findMany({
      orderBy: { name: 'asc' }
    })
    
    // If no themes exist, seed default themes
    if (themes.length === 0) {
      await db.terminalTheme.createMany({
        data: defaultThemes
      })
      themes = await db.terminalTheme.findMany({
        orderBy: { name: 'asc' }
      })
    }
    
    return NextResponse.json({ themes })
  } catch (error) {
    console.error('Error fetching themes:', error)
    return NextResponse.json({ error: 'Failed to fetch themes' }, { status: 500 })
  }
}

// POST - Create custom theme
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const theme = await db.terminalTheme.create({
      data: {
        name: body.name,
        displayName: body.displayName || body.name,
        background: body.background,
        foreground: body.foreground,
        cursor: body.cursor || body.foreground,
        cursorAccent: body.cursorAccent || body.background,
        selection: body.selection || 'rgba(255, 255, 255, 0.3)',
        black: body.black || '#000000',
        red: body.red || '#cd3131',
        green: body.green || '#0dbc79',
        yellow: body.yellow || '#e5e510',
        blue: body.blue || '#2472c8',
        magenta: body.magenta || '#bc3fbc',
        cyan: body.cyan || '#11a8cd',
        white: body.white || '#e5e5e5',
        brightBlack: body.brightBlack || '#666666',
        brightRed: body.brightRed || '#f14c4c',
        brightGreen: body.brightGreen || '#23d18b',
        brightYellow: body.brightYellow || '#f5f543',
        brightBlue: body.brightBlue || '#3b8eea',
        brightMagenta: body.brightMagenta || '#d670d6',
        brightCyan: body.brightCyan || '#29b8db',
        brightWhite: body.brightWhite || '#ffffff',
        isDefault: false,
      }
    })
    
    return NextResponse.json({ theme })
  } catch (error) {
    console.error('Error creating theme:', error)
    return NextResponse.json({ error: 'Failed to create theme' }, { status: 500 })
  }
}
