'use client'

import { useState, useEffect } from 'react'

interface SafetyMetrics {
  total_inspections: number
  total_violations: number
  critical_violations: number
  violation_trends: Record<string, number>
  most_common_violations: string[]
  average_violations_per_inspection: number
  estimated_fines_prevented: number
  last_updated: string
}

export function SafetyMetrics() {
  const [metrics, setMetrics] = useState<SafetyMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    try {
      const response = await fetch('http://localhost:8000/metrics/safety')
      if (response.ok) {
        const data = await response.json()
        setMetrics(data)
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error)
      // Mock data for demo
      setMetrics({
        total_inspections: 47,
        total_violations: 156,
        critical_violations: 23,
        violation_trends: {
          'Missing PPE': 45,
          'Fall Protection': 38,
          'Scaffolding Safety': 29,
          'Equipment Safety': 44
        },
        most_common_violations: ['Missing PPE', 'Equipment Safety', 'Fall Protection'],
        average_violations_per_inspection: 3.3,
        estimated_fines_prevented: 487500,
        last_updated: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <p className="text-sm text-gray-500">Unable to load safety metrics</p>
      </div>
    )
  }

  const criticalRate = metrics.total_violations > 0 
    ? (metrics.critical_violations / metrics.total_violations * 100).toFixed(1)
    : '0.0'

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Safety Dashboard</h3>
          <button
            onClick={fetchMetrics}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{metrics.total_inspections}</div>
            <div className="text-sm text-blue-700">Inspections</div>
          </div>
          
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{metrics.total_violations}</div>
            <div className="text-sm text-red-700">Violations</div>
          </div>
        </div>

        {/* Critical Rate */}
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold text-yellow-800">{criticalRate}%</div>
              <div className="text-sm text-yellow-700">Critical Rate</div>
            </div>
            <div className="text-yellow-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Fines Prevented */}
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold text-green-800">
                ${(metrics.estimated_fines_prevented || 0).toLocaleString()}
              </div>
              <div className="text-sm text-green-700">Fines Prevented</div>
            </div>
            <div className="text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        {/* Violation Trends */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Common Violations</h4>
          <div className="space-y-2">
            {Object.entries(metrics.violation_trends || {}).map(([type, count]) => {
              const percentage = metrics.total_violations > 0 
                ? (count / metrics.total_violations * 100).toFixed(0)
                : '0'
              
              return (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{type}</span>
                      <span className="text-gray-500">{count}</span>
                    </div>
                    <div className="mt-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Average */}
        <div className="text-center p-3 border border-gray-200 rounded-lg">
          <div className="text-lg font-semibold text-gray-900">
            {(metrics.average_violations_per_inspection || 0).toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">Avg violations per inspection</div>
        </div>

        {/* Last Updated */}
        <div className="text-xs text-gray-400 text-center">
          Last updated: {metrics.last_updated ? new Date(metrics.last_updated).toLocaleString() : 'Never'}
        </div>
      </div>
    </div>
  )
}
