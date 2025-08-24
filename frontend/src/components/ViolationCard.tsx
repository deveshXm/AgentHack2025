'use client'

interface Violation {
  violation_type: string
  description: string
  severity: string // Allow any severity string (High, Medium, Low, Critical, Moderate)
  osha_code?: string
  corrective_action: string
  fine_estimate?: number | string // Can be number or string like "$5,000"
  location?: string
  confidence: number
}

interface ViolationCardProps {
  violations: Violation[]
}

export function ViolationCard({ violations }: ViolationCardProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'CRITICAL': 
      case 'HIGH': return 'bg-red-50 border-red-200 text-red-800'
      case 'MODERATE': 
      case 'MEDIUM': return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'LOW': return 'bg-green-50 border-green-200 text-green-800'
      default: return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'CRITICAL': 
      case 'HIGH':
        return (
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        )
      case 'MODERATE':
      case 'MEDIUM':
        return (
          <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'LOW':
        return (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      default:
        return null
    }
  }

  if (!violations || violations.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium text-green-800">No Safety Violations Detected</span>
        </div>
        <p className="text-sm text-green-700 mt-1">This site appears to be following proper safety protocols.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">Safety Violations Detected</h4>
        <span className="text-sm text-gray-500">{violations.length} violation{violations.length !== 1 ? 's' : ''}</span>
      </div>
      
      {violations.map((violation, index) => (
        <div key={index} className={`border rounded-lg p-4 ${getSeverityColor(violation.severity)}`}>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              {getSeverityIcon(violation.severity)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-gray-900">{violation.violation_type}</h5>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(violation.severity)}`}>
                  {violation.severity.toUpperCase()}
                </span>
              </div>
              
              <p className="text-sm text-gray-700 mb-3">{violation.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {violation.osha_code && (
                  <div>
                    <span className="font-medium text-gray-600">OSHA Code:</span>
                    <span className="ml-2 text-gray-800">{violation.osha_code}</span>
                  </div>
                )}
                
                {violation.fine_estimate && (
                  <div>
                    <span className="font-medium text-gray-600">Est. Fine:</span>
                    <span className="ml-2 text-gray-800">
                      {typeof violation.fine_estimate === 'string' 
                        ? violation.fine_estimate 
                        : `$${violation.fine_estimate.toLocaleString()}`}
                    </span>
                  </div>
                )}
                
                {violation.location && (
                  <div className="md:col-span-2">
                    <span className="font-medium text-gray-600">Location:</span>
                    <span className="ml-2 text-gray-800">{violation.location}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-3 p-3 bg-white bg-opacity-50 rounded border-l-4 border-blue-400">
                <span className="font-medium text-gray-600">Corrective Action:</span>
                <p className="text-sm text-gray-800 mt-1">{violation.corrective_action}</p>
              </div>
              
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Confidence:</span>
                  <div className="bg-white rounded-full h-2 w-16">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${violation.confidence * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">{Math.round(violation.confidence * 100)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
