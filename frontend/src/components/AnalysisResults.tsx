'use client'

interface SafetyViolation {
  violation_type: string
  description: string
  severity: 'CRITICAL' | 'MODERATE' | 'LOW'
  osha_code?: string
  corrective_action: string
  fine_estimate?: number
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

interface AnalysisResultsProps {
  inspection: InspectionResult
  onGenerateReport: () => void
}

export function AnalysisResults({ inspection, onGenerateReport }: AnalysisResultsProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'MODERATE':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'LOW':
        return 'text-green-600 bg-green-50 border-green-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        )
      case 'MODERATE':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'LOW':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      default:
        return null
    }
  }

  const totalFines = inspection.violations.reduce((sum, v) => sum + (v.fine_estimate || 0), 0)

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Analysis Results</h3>
            <p className="text-sm text-gray-500">
              {inspection.image_filename} • {new Date(inspection.timestamp).toLocaleString()}
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            inspection.overall_risk_level === 'HIGH' ? 'bg-red-100 text-red-800' :
            inspection.overall_risk_level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {inspection.overall_risk_level} RISK
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="p-6 border-b">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-red-600">{inspection.critical_count}</div>
            <div className="text-sm text-gray-500">Critical</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">{inspection.moderate_count}</div>
            <div className="text-sm text-gray-500">Moderate</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{inspection.low_count}</div>
            <div className="text-sm text-gray-500">Low</div>
          </div>
        </div>
        
        {totalFines > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-sm font-medium text-red-800">
              Estimated OSHA Fines: ${totalFines.toLocaleString()}
            </div>
            <div className="text-xs text-red-600 mt-1">
              These violations could result in significant penalties if not addressed
            </div>
          </div>
        )}
      </div>

      {/* Violations List */}
      <div className="max-h-64 overflow-y-auto">
        {inspection.violations.map((violation, index) => (
          <div key={index} className="p-4 border-b last:border-b-0">
            <div className="flex items-start space-x-3">
              <div className={`flex-shrink-0 p-1 rounded border ${getSeverityColor(violation.severity)}`}>
                {getSeverityIcon(violation.severity)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-medium text-gray-900">
                    {violation.violation_type}
                  </h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(violation.severity)}`}>
                    {violation.severity}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mt-1">
                  {violation.description}
                </p>
                
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-500">
                    <strong>Action:</strong> {violation.corrective_action}
                  </p>
                  
                  {violation.osha_code && (
                    <p className="text-xs text-gray-500">
                      <strong>OSHA Code:</strong> {violation.osha_code}
                    </p>
                  )}
                  
                  {violation.location && (
                    <p className="text-xs text-gray-500">
                      <strong>Location:</strong> {violation.location}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    {violation.fine_estimate && (
                      <p className="text-xs text-red-600 font-medium">
                        Est. Fine: ${violation.fine_estimate.toLocaleString()}
                      </p>
                    )}
                    
                    <p className="text-xs text-gray-400">
                      Confidence: {Math.round(violation.confidence * 100)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="p-4 bg-gray-50 rounded-b-lg">
        <div className="flex space-x-3">
          <button
            onClick={onGenerateReport}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            🚨 Generate Urgent Report
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
            Save Inspection
          </button>
        </div>
        
        <p className="text-xs text-gray-500 mt-2 text-center">
          Report will be sent to site managers, safety officers, and OSHA compliance team
        </p>
      </div>
    </div>
  )
}
