from fastapi import APIRouter, HTTPException, Request, Depends, Query
from typing import Dict, Any
import os

from ..services.chat import BedrockChat
from ..services.youtube import YouTubeTranscriptDownloader
from ..services.text_extractor import TextPatternExtractor
from ..utils.file_handlers import process_and_save_questions, save_transcript

router = APIRouter()

def get_bedrock_chat():
    return BedrockChat()

@router.post("/invoke-llm")
async def invoke_llm(request: Request, chat: BedrockChat = Depends(get_bedrock_chat)) -> Dict[str, Any]:
    """API endpoint to generate a response using Amazon Bedrock"""
    try:
        data = await request.json()
        message = data.get("message")
        inference_config = data.get("inference_config")
        
        if not message:
            raise HTTPException(status_code=400, detail="Message is required")
            
        response = chat.generate_response(message, inference_config)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/get-transcript")
async def get_transcript(video_url: str = Query(..., description="YouTube video URL")) -> Dict[str, Any]:
    """API Endpoint to get the transcript of a YouTube video."""
    try:
        # Initialize downloader
        downloader = YouTubeTranscriptDownloader()
        
        # Extract video ID
        video_id = downloader.extract_video_id(video_url)
        
        # Get transcript
        transcript = downloader.get_transcript(video_id)
        
        # Save transcript
        save_success = save_transcript(transcript, video_id)
        if not save_success:
            raise HTTPException(status_code=500, detail="Failed to save transcript")
            
        # Process text with LLM
        combined_text = ' '.join(entry['text'] for entry in transcript)
        
        # Initialize text extractor
        extractor = TextPatternExtractor()
        
        # Process with Nova LLM
        processed_text = extractor.invoke_llm(combined_text, "nova-micro")
        
        # Save processed questions
        questions_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "questions", f"{video_id}.txt")
        processed_text = process_and_save_questions(processed_text, questions_file)
        
        return {
            "video_id": video_id,
            "transcript": transcript,
            "processed_text": processed_text
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
