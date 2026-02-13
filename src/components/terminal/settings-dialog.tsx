'use client'

import { useEffect } from 'react'
import { useSSHStore } from '@/store/ssh-store'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Settings, Palette, Monitor, Info } from 'lucide-react'
import { ThemePreview } from './theme-preview'

export function SettingsDialog() {
  const { settingsOpen, setSettingsOpen, themes, setThemes, setCurrentTheme } = useSSHStore()
  
  // Fetch themes on mount
  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const res = await fetch('/api/themes')
        const data = await res.json()
        setThemes(data.themes)
      } catch (error) {
        console.error('Failed to fetch themes:', error)
      }
    }
    fetchThemes()
  }, [setThemes])
  
  return (
    <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
      <DialogContent className="sm:max-w-[700px] bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Settings
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="themes" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="themes">
              <Palette className="w-4 h-4 mr-2" />
              Themes
            </TabsTrigger>
            <TabsTrigger value="general">
              <Monitor className="w-4 h-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="about">
              <Info className="w-4 h-4 mr-2" />
              About
            </TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[400px]">
            <div className="p-4">
              <TabsContent value="themes" className="mt-0">
                <div className="grid grid-cols-2 gap-4">
                  {themes.map(theme => (
                    <ThemePreview
                      key={theme.id}
                      theme={theme}
                      onSelect={() => setCurrentTheme(theme.name)}
                    />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="general" className="space-y-4 mt-0">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">General Settings</h3>
                  <p className="text-sm text-gray-400">
                    General application settings will be available here.
                  </p>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Keyboard Shortcuts</h4>
                    <div className="space-y-1 text-sm text-gray-400">
                      <div className="flex justify-between py-1 border-b border-gray-800">
                        <span>New Connection</span>
                        <kbd className="px-2 py-0.5 bg-gray-800 rounded text-xs">Ctrl+N</kbd>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-800">
                        <span>Close Tab</span>
                        <kbd className="px-2 py-0.5 bg-gray-800 rounded text-xs">Ctrl+W</kbd>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-800">
                        <span>Toggle Sidebar</span>
                        <kbd className="px-2 py-0.5 bg-gray-800 rounded text-xs">Ctrl+B</kbd>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-800">
                        <span>Next Tab</span>
                        <kbd className="px-2 py-0.5 bg-gray-800 rounded text-xs">Ctrl+Tab</kbd>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="about" className="space-y-4 mt-0">
                <div className="text-center py-8">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Monitor className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">SSH Terminal</h2>
                  <p className="text-gray-400 mb-4">Web-based SSH Terminal Application</p>
                  
                  <div className="space-y-2 text-sm text-gray-500">
                    <p>Version 1.0.0</p>
                    <p>Built with Next.js, xterm.js, and Socket.io</p>
                    <p className="pt-4">
                      <a 
                        href="https://github.com/your-repo/ssh-terminal"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        View on GitHub
                      </a>
                    </p>
                  </div>
                </div>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
