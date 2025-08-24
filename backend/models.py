from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class OAuthRequiredException(Exception):
    """Exception raised when OAuth authentication is required"""
    def __init__(self, message: str, oauth_url: str, plan_run_id: str):
        self.message = message
        self.oauth_url = oauth_url
        self.plan_run_id = plan_run_id
        super().__init__(message)

class SafetyViolation(BaseModel):
    """Safety violation detected in construction site image"""
    violation_type: str = Field(..., description="Type of safety violation")
    description: str = Field(..., description="Detailed description of the violation")
    severity: str = Field(..., description="Severity level: CRITICAL, MODERATE, or LOW")
    osha_code: Optional[str] = Field(None, description="Relevant OSHA regulation code")
    corrective_action: str = Field(..., description="Recommended corrective action")
    fine_estimate: Optional[int] = Field(None, description="Estimated OSHA fine in USD")
    location: Optional[str] = Field(None, description="Location in image where violation was detected")
    confidence: float = Field(..., description="Confidence score (0.0 to 1.0)")

class InspectionRequest(BaseModel):
    """Request for safety inspection analysis"""
    image_data: str = Field(..., description="Base64 encoded image data")
    site_id: Optional[str] = Field(None, description="Construction site identifier")
    inspector_id: Optional[str] = Field(None, description="Inspector identifier")
    inspection_type: str = Field(default="routine", description="Type of inspection")

class InspectionResult(BaseModel):
    """Result of safety inspection analysis"""
    inspection_id: str = Field(default_factory=lambda: f"inspection_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
    timestamp: datetime = Field(default_factory=datetime.now)
    image_filename: str = Field(..., description="Original image filename")
    violations: List[SafetyViolation] = Field(default_factory=list, description="Detected safety violations")
    total_violations: int = Field(..., description="Total number of violations detected")
    critical_count: int = Field(default=0, description="Number of critical violations")
    moderate_count: int = Field(default=0, description="Number of moderate violations") 
    low_count: int = Field(default=0, description="Number of low severity violations")
    overall_risk_level: str = Field(default="LOW", description="Overall site risk level")
    recommendations: List[str] = Field(default_factory=list, description="AI agent recommendations")
    estimated_total_fines: Optional[int] = Field(None, description="Total estimated OSHA fines")

class ChatMessage(BaseModel):
    """Chat message with AI Safety Assistant"""
    message: str = Field(..., description="User message")
    context: Dict[str, Any] = Field(default_factory=dict, description="Conversation context")
    timestamp: datetime = Field(default_factory=datetime.now)

class ChatResponse(BaseModel):
    """Response from AI Safety Assistant"""
    response: str = Field(..., description="Agent response")
    message_type: str = Field(default="text", description="Type of message: text, oauth, report, violations, image_analysis")
    actions: List[str] = Field(default_factory=list, description="Suggested actions")
    needs_clarification: bool = Field(default=False, description="Whether agent needs clarification")
    clarification_url: Optional[str] = Field(None, description="OAuth or clarification URL")
    data: Optional[Dict[str, Any]] = Field(None, description="Additional structured data for special message types")

class ReportRequest(BaseModel):
    """Request to generate safety report"""
    inspection_result: InspectionResult = Field(..., description="Inspection data")
    recipients: List[str] = Field(..., description="Email recipients")
    priority: str = Field(default="normal", description="Report priority: urgent, normal, low")
    include_images: bool = Field(default=True, description="Include images in report")

class ReportStatus(BaseModel):
    """Status of generated safety report"""
    report_id: str = Field(..., description="Generated report identifier")
    status: str = Field(..., description="Report status: sent, pending, failed")
    recipients: List[str] = Field(..., description="Email recipients")
    timestamp: datetime = Field(default_factory=datetime.now)
    gmail_message_id: Optional[str] = Field(None, description="Gmail message ID if sent")

class SafetyMetrics(BaseModel):
    """Safety metrics and analytics"""
    total_inspections: int = Field(default=0, description="Total inspections conducted")
    total_violations: int = Field(default=0, description="Total violations detected")
    critical_violations: int = Field(default=0, description="Critical violations count")
    violation_trends: Dict[str, int] = Field(default_factory=dict, description="Violation type trends")
    most_common_violations: List[str] = Field(default_factory=list, description="Most common violation types")
    average_violations_per_inspection: float = Field(default=0.0, description="Average violations per inspection")
    estimated_fines_prevented: int = Field(default=0, description="Total estimated fines prevented")
    last_updated: datetime = Field(default_factory=datetime.now)

class InspectionHistory(BaseModel):
    """Historical inspection record"""
    inspection_id: str = Field(..., description="Inspection identifier")
    timestamp: datetime = Field(..., description="Inspection timestamp")
    site_id: Optional[str] = Field(None, description="Site identifier")
    violations_count: int = Field(..., description="Number of violations found")
    risk_level: str = Field(..., description="Overall risk level")
    inspector_notes: Optional[str] = Field(None, description="Inspector notes")
    report_sent: bool = Field(default=False, description="Whether report was sent")
