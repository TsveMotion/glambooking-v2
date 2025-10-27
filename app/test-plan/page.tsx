'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestPlanPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const updatePlan = async (planId: string) => {
    setLoading(planId)
    setMessage('')
    
    try {
      const response = await fetch('/api/business/update-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId })
      })

      const data = await response.json()
      
      if (response.ok) {
        setMessage(`✅ ${data.message}`)
        // Refresh the page after 2 seconds
        setTimeout(() => window.location.reload(), 2000)
      } else {
        setMessage(`❌ ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ Failed to update plan')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Test Plan Updates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Use these buttons to test plan changes. This will directly update your business plan in the database.
          </p>
          
          {message && (
            <div className="p-4 bg-gray-100 rounded-lg">
              <p className="font-medium">{message}</p>
            </div>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              onClick={() => updatePlan('free')}
              disabled={loading === 'free'}
              variant="outline"
              className="h-20 flex flex-col"
            >
              {loading === 'free' ? 'Updating...' : (
                <>
                  <span className="font-bold">Free Plan</span>
                  <span className="text-sm">£0/month</span>
                </>
              )}
            </Button>
            
            <Button
              onClick={() => updatePlan('starter')}
              disabled={loading === 'starter'}
              variant="outline"
              className="h-20 flex flex-col"
            >
              {loading === 'starter' ? 'Updating...' : (
                <>
                  <span className="font-bold">Starter Plan</span>
                  <span className="text-sm">£19/month</span>
                </>
              )}
            </Button>
            
            <Button
              onClick={() => updatePlan('professional')}
              disabled={loading === 'professional'}
              variant="outline"
              className="h-20 flex flex-col"
            >
              {loading === 'professional' ? 'Updating...' : (
                <>
                  <span className="font-bold">Professional</span>
                  <span className="text-sm">£39/month</span>
                </>
              )}
            </Button>
            
            <Button
              onClick={() => updatePlan('enterprise')}
              disabled={loading === 'enterprise'}
              variant="outline"
              className="h-20 flex flex-col"
            >
              {loading === 'enterprise' ? 'Updating...' : (
                <>
                  <span className="font-bold">Enterprise</span>
                  <span className="text-sm">£79/month</span>
                </>
              )}
            </Button>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Quick Links:</h3>
            <div className="space-x-4">
              <a href="/business/manage-plan" className="text-blue-600 hover:underline">
                → Manage Plan Page
              </a>
              <a href="/business/pricing" className="text-blue-600 hover:underline">
                → Business Pricing Page
              </a>
              <a href="/pricing" className="text-blue-600 hover:underline">
                → Public Pricing Page
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
