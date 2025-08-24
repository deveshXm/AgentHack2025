'use client'

import { useState, useEffect } from 'react'

interface ReportStatus {
  report_id: string
  status: 'sent' | 'pending' | 'failed'
  recipients: string[]
  timestamp: string
  gmail_message_id?: string
}

export function ReportStatus() {
  const [reports, setReports] = useState<ReportStatus[]>([])

  // Mock data for demo - in real app this would come from backend
  useEffect(() => {
    // Simulate recent reports
    setReports([
      {
        report_id: 'RPT-20250125-001',
        status: 'sent',
        recipients: ['site.manager@construction.com', 'safety.officer@construction.com'],
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        gmail_message_id: 'gmail-msg-123'
      },
      {
        report_id: 'RPT-20250125-002',
        status: 'sent',
        recipients: ['project.manager@construction.com', 'osha.compliance@construction.com'],
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        gmail_message_id: 'gmail-msg-124'
      }
    ])
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'text-green-600 bg-green-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'failed':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case 'pending':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'failed':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      default:
        return null
    }
  }

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date()
    const date = new Date(timestamp)
    const diffMs = now.getTime() - date.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMinutes / 60)

    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString()
  }

  const addNewReport = (newReport: ReportStatus) => {
    setReports(prev => [newReport, ...prev].slice(0, 5)) // Keep only latest 5
  }

  // Simulate receiving new report updates
  useEffect(() => {
    const handleNewReport = (event: CustomEvent) => {
      addNewReport(event.detail)
    }

    window.addEventListener('newReport', handleNewReport as EventListener)
    return () => window.removeEventListener('newReport', handleNewReport as EventListener)
  }, [])

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Report Status</h3>
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>Via Gmail</span>
          </div>
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto">
        {reports.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-gray-500">No reports sent yet</p>
            <p className="text-xs text-gray-400 mt-1">Reports will appear here when generated</p>
          </div>
        ) : (
          <div className="divide-y">
            {reports.map((report) => (
              <div key={report.report_id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        {report.report_id}
                      </span>
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 text-xs rounded-full ${getStatusColor(report.status)}`}>
                        {getStatusIcon(report.status)}
                        <span className="capitalize">{report.status}</span>
                      </span>
                    </div>
                    
                    <div className="mt-1">
                      <p className="text-xs text-gray-500">
                        To: {report.recipients.length} recipient{report.recipients.length !== 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatRelativeTime(report.timestamp)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {report.gmail_message_id && (
                      <button
                        className="text-blue-600 hover:text-blue-700"
                        title="View in Gmail"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </button>
                    )}
                    
                    <button
                      className="text-gray-400 hover:text-gray-600"
                      title="View details"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Recipients list (expandable) */}
                <div className="mt-2">
                  <details className="group">
                    <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-700 select-none">
                      View recipients ({report.recipients.length})
                    </summary>
                    <div className="mt-1 pl-2 border-l-2 border-gray-100">
                      {report.recipients.map((email, index) => (
                        <div key={index} className="text-xs text-gray-600 py-1">
                          {email}
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* OAuth Status */}
      <div className="p-4 bg-blue-50 border-t">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-blue-800">Gmail OAuth connected via Portia</span>
          <button className="text-xs text-blue-600 hover:text-blue-700 underline">
            Settings
          </button>
        </div>
      </div>
    </div>
  )
}
