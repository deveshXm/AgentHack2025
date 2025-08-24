'use client'

import { useState } from 'react'

interface ReportMessageProps {
  reportId: string
  recipients: string[]
  status: string
  fullReportContent?: string
}

export function ReportMessage({ reportId, recipients, status, fullReportContent }: ReportMessageProps) {
  const [showFullReport, setShowFullReport] = useState(false)
  const getStatusIcon = () => {
    switch (status) {
      case 'sent':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'pending':
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'failed':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      default:
        return null
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'sent': return 'bg-green-50 border-green-200'
      case 'pending': return 'bg-yellow-50 border-yellow-200'
      case 'failed': return 'bg-red-50 border-red-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className={`border rounded-lg p-4 ${getStatusColor()}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          {getStatusIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">Safety Compliance Report</h4>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
              status === 'sent' ? 'bg-green-100 text-green-800' :
              status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {status.toUpperCase()}
            </span>
          </div>
          
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-gray-600">Report ID:</span>
              <span className="ml-2 text-gray-800 font-mono text-xs">{reportId}</span>
            </div>
            
            <div>
              <span className="font-medium text-gray-600">Recipients:</span>
              <div className="mt-1 space-y-1">
                {recipients.map((recipient, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-700">{recipient}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {status === 'sent' && (
            <div className="mt-3 p-2 bg-white bg-opacity-50 rounded border-l-4 border-green-400">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-sm font-medium text-green-700">Report delivered successfully!</span>
              </div>
              <p className="text-xs text-green-600 mt-1">
                All stakeholders have been notified about the safety violations and required actions.
              </p>
            </div>
          )}
          
          {status === 'failed' && (
            <div className="mt-3 p-2 bg-white bg-opacity-50 rounded border-l-4 border-red-400">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-red-700">Report delivery failed</span>
              </div>
              <p className="text-xs text-red-600 mt-1">
                Please check your email configuration and try again.
              </p>
            </div>
          )}
          
          {/* Show Report Content */}
          {fullReportContent && (
            <div className="mt-3">
              <button
                onClick={() => setShowFullReport(!showFullReport)}
                className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showFullReport ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                </svg>
                <span>{showFullReport ? 'Hide' : 'View'} Full Report</span>
              </button>

              {showFullReport && (
                <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">📋 Complete Safety Compliance Report:</h4>
                  <div className="bg-white border rounded p-3 max-h-96 overflow-y-auto">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
                      {fullReportContent}
                    </pre>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    This is the complete report that would be sent via email. The report includes all violation details, financial impact analysis, and action plans.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
