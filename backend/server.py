from fastapi import FastAPI, APIRouter, File, UploadFile, HTTPException, Form
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
import base64
import io
import asyncio
import json
from emergentintegrations.llm.chat import LlmChat, UserMessage, FileContentWithMimeType

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="SaDA AI - Smart Document Analysis & Customer Support")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Gemini API Key
GEMINI_API_KEY = "AIzaSyB_Mdb2IqoDFc3Eiuqn7is7Hoe7fQFQdIo"

# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class DocumentAnalysis(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    filename: str
    content_type: str
    file_size: int
    analysis_type: str
    summary: str
    key_insights: List[str]
    sentiment_score: Optional[float] = None
    entities: List[dict] = []
    file_content: str  # base64 encoded
    session_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class DocumentAnalysisCreate(BaseModel):
    filename: str
    content_type: str
    file_size: int
    analysis_type: str
    file_content: str  # base64 encoded
    session_id: str

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    user_message: str
    ai_response: str
    message_type: str = "text"  # text, image, audio, video
    file_content: Optional[str] = None  # base64 encoded
    file_type: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ChatMessageCreate(BaseModel):
    session_id: str
    user_message: str
    message_type: str = "text"
    file_content: Optional[str] = None
    file_type: Optional[str] = None

class ChatSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_name: str
    session_type: str  # document_analysis, customer_support
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ChatSessionCreate(BaseModel):
    session_name: str
    session_type: str

# Basic routes
@api_router.get("/")
async def root():
    return {"message": "SaDA AI - Smart Document Analysis & Customer Support API"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Chat Session Management
@api_router.post("/chat/sessions", response_model=ChatSession)
async def create_chat_session(session_data: ChatSessionCreate):
    session_dict = session_data.dict()
    session_obj = ChatSession(**session_dict)
    await db.chat_sessions.insert_one(session_obj.dict())
    return session_obj

@api_router.get("/chat/sessions", response_model=List[ChatSession])
async def get_chat_sessions():
    sessions = await db.chat_sessions.find().sort("updated_at", -1).to_list(100)
    return [ChatSession(**session) for session in sessions]

@api_router.get("/chat/sessions/{session_id}", response_model=ChatSession)
async def get_chat_session(session_id: str):
    session = await db.chat_sessions.find_one({"id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return ChatSession(**session)

# Document Analysis Endpoints
@api_router.post("/documents/analyze", response_model=DocumentAnalysis)
async def analyze_document(document_data: DocumentAnalysisCreate):
    try:
        # Decode base64 content
        file_content = base64.b64decode(document_data.file_content)
        
        # Create temporary file for analysis
        temp_file_path = f"/tmp/{document_data.filename}"
        with open(temp_file_path, "wb") as f:
            f.write(file_content)
        
        # Initialize Gemini chat
        chat = LlmChat(
            api_key=GEMINI_API_KEY,
            session_id=document_data.session_id,
            system_message="You are SaDA AI, an expert document analyzer. Analyze documents thoroughly and provide detailed insights, summaries, and extract key information. Always provide structured responses with clear summaries, key insights, and identify any entities or important data points."
        ).with_model("gemini", "gemini-2.0-flash")
        
        # Create file content for analysis
        file_content_obj = FileContentWithMimeType(
            file_path=temp_file_path,
            mime_type=document_data.content_type
        )
        
        # Analysis prompts based on type
        analysis_prompts = {
            "summary": "Provide a comprehensive summary of this document. Extract the main points and key information.",
            "insights": "Analyze this document and provide detailed insights. What are the key themes, important data points, and actionable information?",
            "entities": "Extract all named entities from this document including people, organizations, locations, dates, and other important entities. Format as JSON.",
            "sentiment": "Analyze the sentiment and tone of this document. Provide a sentiment score between -1 (negative) and 1 (positive)."
        }
        
        prompt = analysis_prompts.get(document_data.analysis_type, analysis_prompts["summary"])
        
        # Send message to Gemini
        user_message = UserMessage(
            text=prompt,
            file_contents=[file_content_obj]
        )
        
        response = await chat.send_message(user_message)
        
        # Parse response for structured data
        summary = response[:500] if len(response) > 500 else response
        key_insights = [insight.strip() for insight in response.split('\n') if insight.strip() and len(insight.strip()) > 10][:5]
        
        # Extract sentiment score (simplified)
        sentiment_score = None
        if "sentiment" in document_data.analysis_type.lower():
            try:
                # Simple sentiment extraction from response
                if "positive" in response.lower():
                    sentiment_score = 0.7
                elif "negative" in response.lower():
                    sentiment_score = -0.7
                else:
                    sentiment_score = 0.0
            except:
                sentiment_score = 0.0
        
        # Clean up temp file
        os.remove(temp_file_path)
        
        # Create analysis result
        analysis_result = DocumentAnalysis(
            filename=document_data.filename,
            content_type=document_data.content_type,
            file_size=document_data.file_size,
            analysis_type=document_data.analysis_type,
            summary=summary,
            key_insights=key_insights,
            sentiment_score=sentiment_score,
            entities=[],
            file_content=document_data.file_content,
            session_id=document_data.session_id
        )
        
        # Store in database
        await db.document_analyses.insert_one(analysis_result.dict())
        
        return analysis_result
        
    except Exception as e:
        logger.error(f"Document analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@api_router.get("/documents/analyses", response_model=List[DocumentAnalysis])
async def get_document_analyses():
    analyses = await db.document_analyses.find().sort("timestamp", -1).to_list(100)
    return [DocumentAnalysis(**analysis) for analysis in analyses]

@api_router.get("/documents/analyses/{session_id}", response_model=List[DocumentAnalysis])
async def get_session_analyses(session_id: str):
    analyses = await db.document_analyses.find({"session_id": session_id}).sort("timestamp", -1).to_list(100)
    return [DocumentAnalysis(**analysis) for analysis in analyses]

# Multimodal Chat Endpoints
@api_router.post("/chat/message", response_model=ChatMessage)
async def send_chat_message(message_data: ChatMessageCreate):
    try:
        # Initialize Gemini chat
        chat = LlmChat(
            api_key=GEMINI_API_KEY,
            session_id=message_data.session_id,
            system_message="You are SaDA AI, an advanced customer support assistant. You can analyze text, images, audio, and video content. Provide helpful, detailed responses and assist with customer inquiries. For product defects or technical issues, analyze any provided media and offer solutions."
        ).with_model("gemini", "gemini-2.0-flash")
        
        # Create user message
        user_message_content = UserMessage(text=message_data.user_message)
        
        # Handle file content if provided
        if message_data.file_content and message_data.file_type:
            try:
                # Decode base64 content
                file_content = base64.b64decode(message_data.file_content)
                
                # Create temporary file
                temp_file_path = f"/tmp/chat_file_{uuid.uuid4()}.{message_data.file_type.split('/')[-1]}"
                with open(temp_file_path, "wb") as f:
                    f.write(file_content)
                
                # Create file content object
                file_content_obj = FileContentWithMimeType(
                    file_path=temp_file_path,
                    mime_type=message_data.file_type
                )
                
                # Add file to message
                user_message_content = UserMessage(
                    text=message_data.user_message,
                    file_contents=[file_content_obj]
                )
                
            except Exception as e:
                logger.error(f"File processing error: {str(e)}")
                # Continue with text-only message
                pass
        
        # Send message to Gemini
        response = await chat.send_message(user_message_content)
        
        # Clean up temp file if created
        try:
            if 'temp_file_path' in locals():
                os.remove(temp_file_path)
        except:
            pass
        
        # Create chat message record
        chat_message = ChatMessage(
            session_id=message_data.session_id,
            user_message=message_data.user_message,
            ai_response=response,
            message_type=message_data.message_type,
            file_content=message_data.file_content,
            file_type=message_data.file_type
        )
        
        # Store in database
        await db.chat_messages.insert_one(chat_message.dict())
        
        # Update session timestamp
        await db.chat_sessions.update_one(
            {"id": message_data.session_id},
            {"$set": {"updated_at": datetime.utcnow()}}
        )
        
        return chat_message
        
    except Exception as e:
        logger.error(f"Chat message error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

@api_router.get("/chat/messages/{session_id}", response_model=List[ChatMessage])
async def get_chat_messages(session_id: str):
    messages = await db.chat_messages.find({"session_id": session_id}).sort("timestamp", 1).to_list(1000)
    return [ChatMessage(**message) for message in messages]

# File Upload Endpoint
@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        # Read file content
        content = await file.read()
        
        # Encode to base64
        file_base64 = base64.b64encode(content).decode('utf-8')
        
        return {
            "filename": file.filename,
            "content_type": file.content_type,
            "size": len(content),
            "file_content": file_base64
        }
        
    except Exception as e:
        logger.error(f"File upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()