'use client'

import { useState, useEffect } from 'react'

interface HistoryItem {
  inspection_id: string
  timestamp: string
  site_id?: string
  violations_count: number
  risk_level: string
  inspector_notes?: string
  report_sent: boolean
}

export function InspectionHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await fetch('http://localhost:8000/inspections/history?limit=10')
      if (response.ok) {
        const data = await response.json()
        setHistory(data.inspections || [])
      }
    } catch (error) {
      console.error('Failed to fetch history:', error)
      // Mock data for demo
      setHistory([
        {
          inspection_id: 'INS-20250125-001',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          site_id: 'Site-A-Building-3',
          violations_count: 3,
          risk_level: 'HIGH',
          report_sent: true
        },
        {
          inspection_id: 'INS-20250125-002',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          site_id: 'Site-B-Foundation',
          violations_count: 1,
          risk_level: 'LOW',
          report_sent: true
        },
        {
          inspection_id: 'INS-20250124-003',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          site_id: 'Site-C-Roofing',
          violations_count: 5,
          risk_level: 'CRITICAL',
          report_sent: true
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-red-100 text-red-700'
      case 'medium':
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date()
    const date = new Date(timestamp)
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Recent Inspections</h3>
          <button
            onClick={fetchHistory}
            className="text-sm text-blue-600 hover:text-blue-700"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading inspection history...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm text-gray-500">No inspections yet</p>
            <p className="text-xs text-gray-400 mt-1">Upload an image to start your first inspection</p>
          </div>
        ) : (
          <div className="divide-y">
            {history.map((item) => (
              <div key={item.inspection_id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        {item.site_id || 'Unknown Site'}
                      </h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${getRiskColor(item.risk_level)}`}>
                        {item.risk_level}
                      </span>
                    </div>
                    
                    <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                      <span>{formatRelativeTime(item.timestamp)}</span>
                      <span>{item.violations_count} violations</span>
                      {item.report_sent && (
                        <span className="flex items-center space-x-1 text-green-600">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Report sent</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {item.violations_count > 0 && (
                      <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-medium">
                        {item.violations_count}
                      </div>
                    )}
                    
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {item.inspector_notes && (
                  <p className="mt-2 text-xs text-gray-600 italic">
                    &ldquo;{item.inspector_notes}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 bg-gray-50 border-t">
        <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium">
          View All Inspections
        </button>
      </div>
    </div>
  )
}
