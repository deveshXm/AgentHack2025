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

interface ProactiveAlertsProps {
  currentInspection: InspectionResult | null
}

export function ProactiveAlerts({ currentInspection }: ProactiveAlertsProps) {
  // Generate proactive suggestions based on current inspection
  const getProactiveSuggestions = () => {
    if (!currentInspection) {
      return [
        {
          type: 'info',
          icon: '💡',
          title: 'Ready for Inspection',
          message: 'Upload a construction site image to begin safety analysis',
          action: 'Upload Image'
        }
      ]
    }

    const suggestions = []

    // Critical violations alert
    if (currentInspection.critical_count > 0) {
      suggestions.push({
        type: 'critical',
        icon: '🚨',
        title: 'Immediate Action Required',
        message: `${currentInspection.critical_count} critical safety violation${currentInspection.critical_count > 1 ? 's' : ''} detected. Work should stop immediately.`,
        action: 'Send Urgent Alert'
      })
    }

    // Report generation suggestion
    if (currentInspection.total_violations > 0) {
      suggestions.push({
        type: 'warning',
        icon: '📋',
        title: 'Generate Compliance Report',
        message: 'Safety violations found. Generate and send report to stakeholders?',
        action: 'Create Report'
      })
    }

    // Follow-up inspection suggestion
    if (currentInspection.critical_count > 0 || currentInspection.moderate_count >= 3) {
      suggestions.push({
        type: 'info',
        icon: '📅',
        title: 'Schedule Follow-up',
        message: 'Consider scheduling a follow-up inspection within 24-48 hours',
        action: 'Schedule'
      })
    }

    // Pattern recognition (mock)
    if (currentInspection.violations.some(v => v.violation_type === 'Missing PPE')) {
      suggestions.push({
        type: 'insight',
        icon: '🎯',
        title: 'Pattern Detected',
        message: 'PPE violations are common at this site. Consider additional safety training.',
        action: 'View Trends'
      })
    }

    // Positive reinforcement
    if (currentInspection.total_violations === 0) {
      suggestions.push({
        type: 'success',
        icon: '✅',
        title: 'Excellent Safety Compliance',
        message: 'No violations detected! This site is following proper safety protocols.',
        action: 'Share Success'
      })
    }

    // Cost impact awareness
    const totalFines = currentInspection.violations.reduce((sum, v) => sum + (v.fine_estimate || 0), 0)
    if (totalFines > 10000) {
      suggestions.push({
        type: 'financial',
        icon: '💰',
        title: 'High Financial Risk',
        message: `Potential OSHA fines: $${totalFines.toLocaleString()}. Immediate correction could save significant costs.`,
        action: 'Calculate ROI'
      })
    }

    return suggestions.slice(0, 4) // Limit to 4 suggestions
  }

  const suggestions = getProactiveSuggestions()

  const getAlertStyle = (type: string) => {
    switch (type) {
      case 'critical':
        return 'border-red-200 bg-red-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'financial':
        return 'border-purple-200 bg-purple-50'
      case 'insight':
        return 'border-blue-200 bg-blue-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  const getTextStyle = (type: string) => {
    switch (type) {
      case 'critical':
        return 'text-red-800'
      case 'warning':
        return 'text-yellow-800'
      case 'success':
        return 'text-green-800'
      case 'financial':
        return 'text-purple-800'
      case 'insight':
        return 'text-blue-800'
      default:
        return 'text-gray-800'
    }
  }

  const getButtonStyle = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-red-600 hover:bg-red-700 text-white'
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white'
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white'
      case 'financial':
        return 'bg-purple-600 hover:bg-purple-700 text-white'
      case 'insight':
        return 'bg-blue-600 hover:bg-blue-700 text-white'
      default:
        return 'bg-gray-600 hover:bg-gray-700 text-white'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
        <p className="text-sm text-gray-500">Proactive safety suggestions</p>
      </div>

      <div className="p-4 space-y-3">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border ${getAlertStyle(suggestion.type)}`}
          >
            <div className="flex items-start space-x-3">
              <div className="text-lg">{suggestion.icon}</div>
              
              <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-medium ${getTextStyle(suggestion.type)}`}>
                  {suggestion.title}
                </h4>
                <p className={`text-sm mt-1 ${getTextStyle(suggestion.type)} opacity-90`}>
                  {suggestion.message}
                </p>
                
                <button
                  className={`mt-2 px-3 py-1 text-xs rounded-md transition-colors ${getButtonStyle(suggestion.type)}`}
                  onClick={() => {
                    // Handle different actions
                    console.log(`Action clicked: ${suggestion.action}`)
                  }}
                >
                  {suggestion.action}
                </button>
              </div>
            </div>
          </div>
        ))}

        {suggestions.length === 0 && (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p className="text-sm text-gray-500">No recommendations at this time</p>
          </div>
        )}
      </div>

      {/* Learning Section */}
      <div className="p-4 bg-gray-50 border-t">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>AI learns from your preferences and site patterns</span>
        </div>
      </div>
    </div>
  )
}
