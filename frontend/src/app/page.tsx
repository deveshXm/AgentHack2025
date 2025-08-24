'use client'

import { useState, useCallback } from 'react'
import { ChatInterface } from '@/components/ChatInterface'

interface SafetyViolation {
  violation_type: string
  description: string
  severity: string // Allow any severity string from AI response
  osha_code?: string
  corrective_action: string
  fine_estimate?: number | string // Can be number or formatted string
  location?: string
  confidence: number
}

interface InspectionResult {
  inspection_id: string
  timestamp: string
  image_filename: string
  violations: SafetyViolation[]
  total_violations: number
  critical_count: number
  moderate_count: number
  low_count: number
  overall_risk_level: string
  recommendations: string[]
  estimated_total_fines?: number
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  message_type?: string
  data?: any
  clarification_url?: string
  image_name?: string
}

export default function SafetyInspectorDashboard() {
  const [isLoading, setIsLoading] = useState(false)
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your AI Safety Assistant for construction site inspections. I can:\n\n✅ **Analyze Images**: Examine construction photos for OSHA safety violations using GPT-5-mini vision\n✅ **Access History**: Review past inspection records and identify patterns\n✅ **Generate Reports**: Create and automatically send compliance reports via Gmail to stakeholders\n\n🖼️ **Drag & drop images directly here** or type your questions about safety compliance!",
      timestamp: new Date().toISOString(),
      message_type: 'text'
    }
  ])

  const handleChatMessage = useCallback(async (message: string, image?: File) => {
    setIsLoading(true)
    
    // Add user message to chat
    const userMessage: Message = {
      role: 'user',
      content: message || (image ? `[Uploaded: ${image.name}]` : ''),
      timestamp: new Date().toISOString(),
      message_type: 'text',
      image_name: image?.name
    }
    setChatMessages(prev => [...prev, userMessage])

    try {
      // Prepare form data for API call
      const formData = new FormData()
      formData.append('message', message)
      formData.append('context', JSON.stringify({}))
      if (image) {
        formData.append('image', image)
      }

      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Chat failed: ${response.statusText}`)
      }

      const result = await response.json()
      
      // Add assistant response to chat
      const assistantMessage: Message = {
        role: 'assistant',
        content: result.response,
        timestamp: new Date().toISOString(),
        message_type: result.message_type || 'text',
        data: result.data,
        clarification_url: result.clarification_url
      }
      setChatMessages(prev => [...prev, assistantMessage])

    } catch (error) {
      console.error('Chat error:', error)
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: `I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date().toISOString(),
        message_type: 'text'
      }])
    } finally {
      setIsLoading(false)
    }
  }, [])



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-orange-500 p-2 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Safety Inspector AI</h1>
                <p className="text-sm text-gray-500">Construction Site Safety Compliance Agent</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Powered by Portia AI
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <ChatInterface
          messages={chatMessages}
          onSendMessage={handleChatMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}