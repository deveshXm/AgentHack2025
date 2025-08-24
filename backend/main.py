from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import base64
from typing import Dict, List, Any, Optional
import asyncio

from config import HOST, PORT
from portia_agent import SafetyInspectionAgent
# Direct OpenAI import removed - now using Portia-managed LLM via safety_agent
from models import InspectionRequest, InspectionResult, SafetyViolation, ChatResponse, OAuthRequiredException

# Initialize FastAPI app
app = FastAPI(
    title="Construction Safety Compliance Agent",
    description="AI Safety Assistant for professional safety inspectors",
    version="1.0.0"
)

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Portia Safety Agent
safety_agent = SafetyInspectionAgent()

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Construction Safety Compliance Agent API", "status": "active"}

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "services": {
            "portia_agent": "active",
            "portia_llm": "configured",
            "mongodb": "connected"
        }
    }

@app.post("/analyze-image", response_model=InspectionResult)
async def analyze_safety_image(file: UploadFile = File(...)):
    """
    Analyze construction site image for safety violations
    """
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read and encode image
        image_bytes = await file.read()
        image_base64 = base64.b64encode(image_bytes).decode('utf-8')
        
        # Analyze image with Portia-managed LLM (GPT-5-mini Vision)
        violations = await safety_agent.analyze_construction_image(image_base64)
        
        # Create inspection result
        inspection_result = InspectionResult(
            image_filename=file.filename,
            violations=violations,
            total_violations=len(violations),
            critical_count=len([v for v in violations if v.severity == "CRITICAL"]),
            moderate_count=len([v for v in violations if v.severity == "MODERATE"]),
            low_count=len([v for v in violations if v.severity == "LOW"])
        )
        
        return inspection_result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/chat")
async def chat_with_agent(
    message: str = Form(...),
    image: Optional[UploadFile] = File(None),
    context: str = Form("{}")
):
    """
    Conversational interface with AI Safety Assistant - supports text and image uploads
    """
    try:
        import json
        context_dict = json.loads(context) if context else {}
        
        # Handle image upload in chat
        if image:
            if not image.content_type.startswith('image/'):
                return ChatResponse(
                    response="Please upload a valid image file (JPEG, PNG, GIF, WebP).",
                    message_type="text"
                )
            
            # Read and encode image
            image_bytes = await image.read()
            image_base64 = base64.b64encode(image_bytes).decode('utf-8')
            
            # Analyze image with Portia-managed LLM
            violations = await safety_agent.analyze_construction_image(image_base64)
            
            # Create inspection result
            inspection_result = InspectionResult(
                image_filename=image.filename,
                violations=violations,
                total_violations=len(violations),
                critical_count=len([v for v in violations if v.severity == "CRITICAL"]),
                moderate_count=len([v for v in violations if v.severity == "MODERATE"]),
                low_count=len([v for v in violations if v.severity == "LOW"])
            )
            
            # Format response message
            if violations:
                response_text = f"I analyzed {image.filename} and found {len(violations)} safety violations:\n"
                response_text += f"• {inspection_result.critical_count} Critical\n"
                response_text += f"• {inspection_result.moderate_count} Moderate\n" 
                response_text += f"• {inspection_result.low_count} Low Priority\n\n"
                response_text += "Would you like me to generate a compliance report and send it to the safety team?"
            else:
                response_text = f"Great news! I analyzed {image.filename} and found no safety violations. The site appears to be following proper safety protocols."
            
            return ChatResponse(
                response=response_text,
                message_type="image_analysis",
                data={
                    "inspection_result": inspection_result.dict(),
                    "image_name": image.filename
                }
            )
        
        # Handle text-only messages
        response = await safety_agent.process_message(message, context_dict)
        
        return ChatResponse(
            response=response,
            message_type="text"
        )
        
    except Exception as e:
        return ChatResponse(
            response=f"I encountered an error: {str(e)}. Please try again.",
            message_type="text"
        )

@app.post("/generate-report")
async def generate_safety_report(request: Dict[str, Any]):
    """
    Generate and send safety compliance report via Gmail
    """
    try:
        inspection_data = request.get("inspection_data", {})
        recipients = request.get("recipients", None)
        
        # Generate report with Portia agent
        report_status = await safety_agent.generate_report(inspection_data, recipients)
        
        # Get the actual report content for display
        report_content = await safety_agent._create_report_content(inspection_data)
        
        return ChatResponse(
            response=f"✅ Safety compliance report generated and sent successfully!\n\nReport ID: {report_status.get('report_id')}\nRecipients: {', '.join(report_status.get('recipients', []))}\n\n📧 **Email Content Sent:**\n\n{report_content[:500]}..." if len(report_content) > 500 else report_content,
            message_type="report",
            data={
                "report_id": report_status.get("report_id"),
                "recipients": report_status.get("recipients", []),
                "status": "sent",
                "full_report_content": report_content
            }
        )
        
    except OAuthRequiredException as oauth_ex:
        return ChatResponse(
            response=f"I need permission to send emails via Gmail. Please click the link below to authenticate:",
            message_type="oauth",
            needs_clarification=True,
            clarification_url=oauth_ex.oauth_url,
            data={
                "oauth_message": oauth_ex.message,
                "plan_run_id": oauth_ex.plan_run_id
            }
        )
        
    except Exception as e:
        return ChatResponse(
            response=f"Failed to generate report: {str(e)}",
            message_type="text"
        )

@app.get("/inspections/history")
async def get_inspection_history(limit: int = 10):
    """
    Get recent inspection history from MongoDB
    """
    try:
        history = await safety_agent.get_inspection_history(limit)
        return {"inspections": history, "count": len(history)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch history: {str(e)}")

@app.get("/metrics/safety")
async def get_safety_metrics():
    """
    Get safety metrics and analytics
    """
    try:
        metrics = await safety_agent.get_safety_metrics()
        return metrics
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch metrics: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=HOST,
        port=PORT,
        reload=True,
        log_level="info"
    )
