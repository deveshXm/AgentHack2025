'use client'

import { useState } from 'react'

interface OAuthModalProps {
  isOpen: boolean
  onClose: () => void
  oauthUrl: string
  message: string
}

export function OAuthModal({ isOpen, onClose, oauthUrl, message }: OAuthModalProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  const handleAuthenticate = () => {
    setIsAuthenticating(true)
    // Open OAuth URL in new window
    const authWindow = window.open(oauthUrl, 'oauth', 'width=600,height=600')
    
    // Poll for window closure (user completed auth)
    const pollTimer = setInterval(() => {
      if (authWindow?.closed) {
        clearInterval(pollTimer)
        setIsAuthenticating(false)
        onClose()
        // Trigger a refresh or callback to resume the process
        window.location.reload()
      }
    }, 1000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Gmail Authentication Required</h3>
            <p className="text-sm text-gray-500">Connect your Gmail account to send reports</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-4">{message}</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>What happens next:</strong>
            </p>
            <ul className="text-sm text-blue-700 mt-1 space-y-1">
              <li>• You'll be redirected to Google's secure login</li>
              <li>• Grant permission to send emails via Gmail</li>
              <li>• Return here to continue generating reports</li>
            </ul>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleAuthenticate}
            disabled={isAuthenticating}
            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isAuthenticating ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Authenticating...
              </span>
            ) : (
              'Connect Gmail Account'
            )}
          </button>
          
          <button
            onClick={onClose}
            disabled={isAuthenticating}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
