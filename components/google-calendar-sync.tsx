'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Link, RefreshCw, AlertCircle } from 'lucide-react'

interface GoogleCalendarSyncProps {
  onSync?: () => void
}

export function GoogleCalendarSync({ onSync }: GoogleCalendarSyncProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)

  const handleConnect = async () => {
    setIsLoading(true)
    try {
      // Check if Google Calendar sync status
      const response = await fetch('/api/business/calendar/sync')
      if (response.ok) {
        const data = await response.json()
        // Simulate connection process
        await new Promise(resolve => setTimeout(resolve, 1500))
        setIsConnected(true)
        setLastSync(new Date())
        onSync?.()
      }
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error)
      alert('Failed to connect to Google Calendar. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSync = async () => {
    if (!isConnected) return
    
    setIsLoading(true)
    try {
      // Sync bookings with Google Calendar
      const response = await fetch('/api/business/calendar/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        setLastSync(new Date())
        onSync?.()
      }
    } catch (error) {
      console.error('Error syncing with Google Calendar:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setLastSync(null)
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-glam-pink" />
            <CardTitle className="text-glam-charcoal">Google Calendar</CardTitle>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs ${
            isConnected 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-gray-100 text-gray-800 border border-gray-200'
          }`}>
            {isConnected ? 'Connected' : 'Not Connected'}
          </div>
        </div>
        <CardDescription>
          Sync your bookings with Google Calendar to keep everything organized
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!isConnected ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-glam-pink/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Link className="w-8 h-8 text-glam-pink" />
              </div>
              <p className="text-gray-600 mb-4">
                Connect your Google Calendar to automatically sync appointments
              </p>
              <Button 
                onClick={handleConnect}
                disabled={isLoading}
                className="glam-gradient text-white"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Link className="w-4 h-4 mr-2" />
                    Connect Google Calendar
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-green-800">Google Calendar Connected</p>
                    <p className="text-sm text-green-600">
                      {lastSync ? `Last synced: ${lastSync.toLocaleString()}` : 'Ready to sync'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button 
                  onClick={handleSync}
                  disabled={isLoading}
                  variant="outline"
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Sync Now
                    </>
                  )}
                </Button>
                <Button 
                  onClick={handleDisconnect}
                  variant="outline"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Disconnect
                </Button>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">Auto-sync enabled</p>
                    <p>New bookings will automatically appear in your Google Calendar.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
