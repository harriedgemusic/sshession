'use client'

import { useState, useEffect } from 'react'
import { useSSHStore } from '@/store/ssh-store'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, Save, Plug } from 'lucide-react'
import type { SSHSession } from '@/types/ssh'

interface QuickConnectDialogProps {
  editSession?: SSHSession | null
  onClose?: () => void
}

export function QuickConnectDialog({ editSession, onClose }: QuickConnectDialogProps) {
  const { 
    quickConnectOpen, 
    setQuickConnectOpen, 
    addSession, 
    updateSession,
    themes
  } = useSSHStore()
  
  const [formData, setFormData] = useState({
    name: '',
    host: '',
    port: 22,
    username: '',
    authType: 'password' as 'password' | 'key',
    password: '',
    privateKey: '',
    passphrase: '',
    group: '',
    isFavorite: false,
    theme: 'default',
    fontSize: 14,
    fontFamily: "Menlo, Monaco, 'Courier New', monospace",
  })
  
  const [loading, setLoading] = useState(false)
  
  // Reset form when dialog opens/closes
  useEffect(() => {
    if (quickConnectOpen || editSession) {
      if (editSession) {
        setFormData({
          name: editSession.name,
          host: editSession.host,
          port: editSession.port,
          username: editSession.username,
          authType: editSession.authType,
          password: '',
          privateKey: '',
          passphrase: '',
          group: editSession.group || '',
          isFavorite: editSession.isFavorite,
          theme: editSession.theme,
          fontSize: editSession.fontSize,
          fontFamily: editSession.fontFamily,
        })
      } else {
        setFormData({
          name: '',
          host: '',
          port: 22,
          username: '',
          authType: 'password',
          password: '',
          privateKey: '',
          passphrase: '',
          group: '',
          isFavorite: false,
          theme: 'default',
          fontSize: 14,
          fontFamily: "Menlo, Monaco, 'Courier New', monospace",
        })
      }
    }
  }, [quickConnectOpen, editSession])
  
  const handleSave = async () => {
    if (!formData.name || !formData.host || !formData.username) {
      return
    }
    
    setLoading(true)
    try {
      if (editSession) {
        // Update existing session
        const res = await fetch(`/api/sessions/${editSession.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
        const data = await res.json()
        updateSession(editSession.id, data.session)
      } else {
        // Create new session
        const res = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
        const data = await res.json()
        addSession(data.session)
      }
      
      setQuickConnectOpen(false)
      onClose?.()
    } catch (error) {
      console.error('Failed to save session:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const isOpen = quickConnectOpen || !!editSession
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setQuickConnectOpen(false)
        onClose?.()
      }
    }}>
      <DialogContent className="sm:max-w-[600px] bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {editSession ? (
              <>
                <Save className="w-5 h-5" />
                Edit Session
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                New SSH Connection
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="connection" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="connection">Connection</TabsTrigger>
            <TabsTrigger value="authentication">Auth</TabsTrigger>
            <TabsTrigger value="terminal">Terminal</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[350px]">
            <div className="p-4">
              <TabsContent value="connection" className="space-y-4 mt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Session Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="My Server"
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="group">Group</Label>
                    <Input
                      id="group"
                      value={formData.group}
                      onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                      placeholder="Production"
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="host">Host</Label>
                    <Input
                      id="host"
                      value={formData.host}
                      onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                      placeholder="192.168.1.1 or server.example.com"
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="port">Port</Label>
                    <Input
                      id="port"
                      type="number"
                      value={formData.port}
                      onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) || 22 })}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="root"
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="favorite">Add to Favorites</Label>
                  <Switch
                    id="favorite"
                    checked={formData.isFavorite}
                    onCheckedChange={(checked) => setFormData({ ...formData, isFavorite: checked })}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="authentication" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <Label>Authentication Method</Label>
                  <Select
                    value={formData.authType}
                    onValueChange={(value: 'password' | 'key') => 
                      setFormData({ ...formData, authType: value })
                    }
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="password">Password</SelectItem>
                      <SelectItem value="key">SSH Key</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {formData.authType === 'password' ? (
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="privateKey">Private Key</Label>
                      <Textarea
                        id="privateKey"
                        value={formData.privateKey}
                        onChange={(e) => setFormData({ ...formData, privateKey: e.target.value })}
                        placeholder="-----BEGIN OPENSSH PRIVATE KEY-----"
                        className="bg-gray-800 border-gray-700 font-mono text-xs min-h-[150px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="passphrase">Key Passphrase (optional)</Label>
                      <Input
                        id="passphrase"
                        type="password"
                        value={formData.passphrase}
                        onChange={(e) => setFormData({ ...formData, passphrase: e.target.value })}
                        placeholder="••••••••"
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                  </>
                )}
              </TabsContent>
              
              <TabsContent value="terminal" className="space-y-4 mt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select
                      value={formData.theme}
                      onValueChange={(value) => setFormData({ ...formData, theme: value })}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {themes.map(theme => (
                          <SelectItem key={theme.name} value={theme.name}>
                            {theme.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fontSize">Font Size</Label>
                    <Input
                      id="fontSize"
                      type="number"
                      value={formData.fontSize}
                      onChange={(e) => setFormData({ ...formData, fontSize: parseInt(e.target.value) || 14 })}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fontFamily">Font Family</Label>
                  <Input
                    id="fontFamily"
                    value={formData.fontFamily}
                    onChange={(e) => setFormData({ ...formData, fontFamily: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setQuickConnectOpen(false)
              onClose?.()
            }}
            className="border-gray-700 text-gray-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!formData.name || !formData.host || !formData.username || loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Saving...' : editSession ? 'Save Changes' : 'Create Session'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
