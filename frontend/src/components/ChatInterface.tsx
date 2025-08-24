'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { ViolationCard } from './ViolationCard'
import { ReportMessage } from './ReportMessage'
import { OAuthModal } from './OAuthModal'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  message_type?: string
  data?: any
  clarification_url?: string
  image_name?: string
}

interface ChatInterfaceProps {
  messages: Message[]
  onSendMessage: (message: string, image?: File) => void
  isLoading?: boolean
}

export function ChatInterface({ messages, onSendMessage, isLoading = false }: ChatInterfaceProps) {
  const [inputMessage, setInputMessage] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [showOAuthModal, setShowOAuthModal] = useState(false)
  const [oauthData, setOauthData] = useState<{url: string, message: string} | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if ((inputMessage.trim() || selectedImage) && !isLoading) {
      onSendMessage(inputMessage.trim(), selectedImage || undefined)
      setInputMessage('')
      setSelectedImage(null)
      setImagePreview(null)
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setSelectedImage(file)
      // Create preview
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    maxFiles: 1,
    disabled: isLoading,
    noClick: true, // Disable click to open file dialog
    noKeyboard: true
  })

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }



  // Handle OAuth messages
  const handleOAuthMessage = (message: Message) => {
    if (message.clarification_url) {
      setOauthData({
        url: message.clarification_url,
        message: message.content
      })
      setShowOAuthModal(true)
    }
  }

  const renderMessageContent = (message: Message) => {
    switch (message.message_type) {
      case 'oauth':
        return (
          <div className="space-y-3">
            <p className="text-sm">{message.content}</p>
            <button
              onClick={() => handleOAuthMessage(message)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-sm"
            >
              🔗 Connect Gmail Account
            </button>
          </div>
        )
      
      case 'image_analysis':
        return (
          <div className="space-y-3">
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            {message.data?.inspection_result?.violations && (
              <ViolationCard violations={message.data.inspection_result.violations} />
            )}
            {message.data?.inspection_result?.violations?.length > 0 && (
              <div className="mt-4">
                <button
                  onClick={() => {
                    const emails = prompt("Enter recipient email addresses (comma-separated):\n\nExample: manager@site.com, safety@company.com")
                    if (emails) {
                      // Send report generation request with specific emails
                      fetch('http://localhost:8000/generate-report', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          inspection_data: message.data.inspection_result,
                          recipients: emails.split(',').map(email => email.trim())
                        })
                      })
                      .then(res => res.json())
                      .then(result => {
                        // Add the response as a new message
                        const assistantMessage = {
                          role: 'assistant' as const,
                          content: result.response,
                          timestamp: new Date().toISOString(),
                          message_type: result.message_type,
                          data: result.data,
                          clarification_url: result.clarification_url
                        }
                        // This is a bit hacky but we'll add it to messages
                        window.location.reload() // Temporary solution
                      })
                    }
                  }}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-600 transition-colors font-medium"
                >
                  📧 Send Report via Email
                </button>
              </div>
            )}
          </div>
        )
      
      case 'report':
        return (
          <div className="space-y-3">
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            {message.data && (
              <ReportMessage 
                reportId={message.data.report_id}
                recipients={message.data.recipients || []}
                status={message.data.status || 'sent'}
                fullReportContent={message.data.full_report_content}
              />
            )}
          </div>
        )
      
      default:
        return <p className="text-sm whitespace-pre-wrap">{message.content}</p>
    }
  }

  return (
    <>
      <div 
        {...getRootProps()} 
        className={`bg-white rounded-lg shadow-sm border h-[1200px] flex flex-col ${
          isDragActive ? 'border-blue-400 bg-blue-50' : ''
        }`}
      >
        <input {...getInputProps()} />
        
        {/* Chat Header */}
        <div className="p-4 border-b bg-blue-50 rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4v-4z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI Safety Assistant</h3>
              <p className="text-sm text-gray-500">
                {isLoading ? 'Analyzing...' : 'Online • Drop images to analyze'}
              </p>
            </div>
          </div>
        </div>

        {/* Drag overlay */}
        {isDragActive && (
          <div className="absolute inset-0 bg-blue-500 bg-opacity-20 border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center z-10">
            <div className="text-center">
              <svg className="w-12 h-12 text-blue-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-lg font-medium text-blue-700">Drop construction site image here</p>
              <p className="text-sm text-blue-600">I'll analyze it for safety violations</p>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.role === 'user' ? (
                  <div className="space-y-2">
                    {message.image_name && (
                      <div className="flex items-center space-x-2 text-blue-100">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm">{message.image_name}</span>
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                ) : (
                  renderMessageContent(message)
                )}
                <p className={`text-xs mt-2 ${
                  message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {formatTimestamp(message.timestamp)}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>



        {/* Message Input */}
        <div className="p-4 border-t">
          {/* Image Preview */}
          {imagePreview && (
            <div className="mb-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Selected Image:</span>
                <button
                  onClick={removeImage}
                  className="text-red-500 hover:text-red-700"
                  type="button"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <img
                src={imagePreview}
                alt="Selected construction site"
                className="max-w-full max-h-32 rounded border"
              />
              <p className="text-xs text-gray-500 mt-1">{selectedImage?.name}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={selectedImage ? "Add a message about this image..." : "Ask about safety inspections, drop an image, or request reports..."}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              
              <label className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 cursor-pointer transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      onDrop([file])
                    }
                  }}
                  className="hidden"
                />
              </label>
              
              <button
                type="submit"
                disabled={(!inputMessage.trim() && !selectedImage) || isLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* OAuth Modal */}
      {showOAuthModal && oauthData && (
        <OAuthModal
          isOpen={showOAuthModal}
          onClose={() => setShowOAuthModal(false)}
          oauthUrl={oauthData.url}
          message={oauthData.message}
        />
      )}
    </>
  )
}
