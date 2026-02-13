# 🖥️ SSH Terminal - Web-based SSH Client

A modern, feature-rich web-based SSH terminal client built with Next.js, xterm.js, and WebSocket. Connect to your servers securely from anywhere with a beautiful, responsive interface.

![SSH Terminal](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## ✨ Features

### 🖥️ Terminal
- **Full Terminal Emulation** - Powered by xterm.js with complete ANSI support
- **Multiple Tabs** - Open multiple SSH sessions simultaneously
- **Auto-resize** - Terminal automatically adjusts to window size
- **Copy/Paste Support** - Full clipboard integration

### 🔐 SSH Features
- **Password Authentication** - Secure password-based login
- **SSH Key Authentication** - Support for private key authentication
- **Passphrase Support** - Keys can be protected with passphrases
- **Session Management** - Save and organize your connections

### 🎨 User Interface
- **Modern Dark Theme** - Beautiful, eye-friendly interface
- **Multiple Color Themes** - Choose from 6 built-in themes (Default, Dracula, Monokai, Nord, Solarized, Gruvbox)
- **Responsive Design** - Works on desktop and mobile devices
- **Collapsible Sidebar** - Maximize terminal space

### 💾 Session Management
- **Save Connections** - Store your SSH sessions securely
- **Groups** - Organize sessions into groups
- **Favorites** - Quick access to frequently used servers
- **Connection History** - Track your connection history

### 📊 Monitoring
- **Connection Status** - Real-time status indicators
- **Active Sessions** - See which sessions are connected
- **Error Handling** - Clear error messages and reconnection options

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or Bun
- SQLite (included)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/ssh-terminal.git
cd ssh-terminal

# Install dependencies
bun install

# Initialize database
bun run db:push

# Start development server
bun run dev
```

### Starting SSH Service

The SSH service runs as a separate mini-service:

```bash
# Start SSH WebSocket service
cd mini-services/ssh-service
bun install
bun run dev
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
ssh-terminal/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API endpoints
│   │   │   ├── sessions/      # Session CRUD
│   │   │   └── themes/        # Theme management
│   │   ├── page.tsx           # Main application
│   │   └── layout.tsx         # Root layout
│   ├── components/
│   │   ├── terminal/          # Terminal components
│   │   │   ├── xterm-terminal.tsx    # xterm.js wrapper
│   │   │   ├── terminal-panel.tsx    # Terminal panel
│   │   │   ├── terminal-tabs.tsx     # Tab management
│   │   │   ├── session-sidebar.tsx   # Session list
│   │   │   ├── quick-connect-dialog.tsx
│   │   │   ├── settings-dialog.tsx
│   │   │   └── theme-preview.tsx
│   │   └── ui/               # shadcn/ui components
│   ├── hooks/
│   │   └── use-ssh-socket.ts  # WebSocket hook
│   ├── store/
│   │   └── ssh-store.ts       # Zustand store
│   ├── types/
│   │   └── ssh.ts             # TypeScript types
│   └── lib/
│       └── db.ts              # Prisma client
├── mini-services/
│   └── ssh-service/           # SSH WebSocket service
│       ├── index.ts           # Main service
│       └── package.json
├── prisma/
│   └── schema.prisma          # Database schema
└── package.json
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./db/custom.db"
```

### Database Schema

The application uses Prisma with SQLite. Main models:

- **SSHSession** - Stored SSH connections
- **TerminalTheme** - Terminal color themes
- **ConnectionHistory** - Connection history records
- **SSHKey** - SSH key management

## 📖 Usage Guide

### Creating a New Connection

1. Click **"Quick Connect"** button
2. Fill in connection details:
   - **Name**: Display name for the session
   - **Host**: Server hostname or IP address
   - **Port**: SSH port (default: 22)
   - **Username**: SSH username
   - **Authentication**: Choose password or SSH key
3. Click **"Create Session"**

### Connecting to a Server

1. Click on any saved session in the sidebar
2. The terminal will open in a new tab
3. Status indicator shows connection state:
   - 🔄 Connecting
   - 🟢 Connected
   - 🔴 Error
   - ⚪ Disconnected

### Managing Tabs

- **Switch Tabs**: Click on the tab
- **Close Tab**: Click X button on tab
- **Multiple Sessions**: Open as many tabs as needed

### Changing Themes

1. Click **"Settings"** button
2. Go to **"Themes"** tab
3. Click on any theme to apply it

## 🎨 Available Themes

| Theme | Description |
|-------|-------------|
| Default | VS Code-like dark theme |
| Dracula | Popular purple-tinted dark theme |
| Monokai | Classic Monokai color scheme |
| Nord | Arctic, bluish color palette |
| Solarized Dark | Precision color scheme |
| Gruvbox | Retro groove color scheme |

## 🔌 API Reference

### Sessions

```typescript
// List all sessions
GET /api/sessions

// Create session
POST /api/sessions
Body: { name, host, port, username, authType, password?, privateKey?, ... }

// Get session by ID
GET /api/sessions/[id]

// Update session
PUT /api/sessions/[id]

// Delete session
DELETE /api/sessions/[id]

// Connect to session (returns credentials)
POST /api/sessions/[id]/connect
```

### Themes

```typescript
// List all themes
GET /api/themes

// Create custom theme
POST /api/themes
```

### Groups

```typescript
// List all groups
GET /api/sessions/groups
```

## 🔒 Security Considerations

1. **Password Storage**: Passwords are stored in the database. In production, consider encrypting them at rest.

2. **SSH Keys**: Private keys are stored in the database. Consider using a secrets manager for production.

3. **Network Security**: The SSH service runs on a separate port. Ensure proper firewall rules.

4. **HTTPS**: Always use HTTPS in production to protect credentials in transit.

## 🚀 Deployment

### Docker (Recommended)

```dockerfile
# Dockerfile coming soon
```

### Manual Deployment

1. Build the application:
```bash
bun run build
```

2. Start the production server:
```bash
bun start
```

3. Start the SSH service:
```bash
cd mini-services/ssh-service
bun run start
```

### Environment Setup

For production, ensure:
- Set `NODE_ENV=production`
- Use a proper database (PostgreSQL/MySQL)
- Configure HTTPS
- Set up proper authentication for the web interface

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [xterm.js](https://xtermjs.org/) - Terminal emulator for the web
- [ssh2](https://github.com/mscdex/ssh2) - SSH2 client and server modules
- [Socket.io](https://socket.io/) - Real-time bidirectional communication
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful React components
- [Next.js](https://nextjs.org/) - The React Framework

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

Built with ❤️ using Next.js, xterm.js, and Socket.io
