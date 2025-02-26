from fastapi import APIRouter, HTTPException, Request, Depends, Query
from typing import Dict, Any
import os

from ..services.chat import BedrockChat
from ..services.youtube import YouTubeTranscriptDownloader
from ..services.text_extractor import TextPatternExtractor
from ..services.vector_store import QuestionVectorStore
from ..utils.file_handlers import process_and_save_questions, save_transcript

router = APIRouter()

# Initialize services
def get_bedrock_chat():
    return BedrockChat()

# Initialize vector store
vector_store = QuestionVectorStore(persist_directory=os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "data",
    "chroma_db"
))

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
        print(f"Processing video: {video_id}")
        
        # Get transcript
        transcript = downloader.get_transcript(video_id)
        print(f"Got transcript with {len(transcript)} entries")
        
        # Save transcript
        save_success = save_transcript(transcript, video_id)
        if not save_success:
            raise HTTPException(status_code=500, detail="Failed to save transcript")
            
        # Process text with LLM
        combined_text = ' '.join(entry['text'] for entry in transcript)
        print(f"Combined transcript length: {len(combined_text)} chars")
        
        # Initialize text extractor
        extractor = TextPatternExtractor()
        
        # Process with Nova LLM
        processed_text = extractor.invoke_llm(combined_text, "nova-micro")
        print(f"Processed text from LLM: {processed_text[:200]}...")  # Print first 200 chars
        
        # Save processed questions
        questions_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "questions", f"{video_id}.txt")
        processed_text = process_and_save_questions(processed_text, questions_file)
        
        # Add to vector store
        success = vector_store.add_questions(processed_text, video_id)
        if not success:
            print("Failed to add questions to vector store")
        else:
            print("Successfully added questions to vector store")
        
        return {
            "video_id": video_id,
            "transcript": transcript,
            "processed_text": processed_text
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/similar-questions")
async def get_similar_questions(
    query: str = Query(..., description="Question or text to find similar questions for"),
    n_results: int = Query(5, description="Number of similar questions to return")
) -> Dict[str, Any]:
    """API endpoint to find similar questions in the vector store"""
    try:
        similar_questions = vector_store.find_similar_questions(query, n_results)
        return {"questions": similar_questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/all-questions")
async def get_all_questions() -> Dict[str, Any]:
    """API endpoint to get all questions from the vector store"""
    try:
        all_questions = vector_store.get_all_questions()
        return {"questions": all_questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/api/clear-questions")
async def clear_questions() -> Dict[str, Any]:
    """API endpoint to clear all questions from the vector store"""
    try:
        vector_store.clear_questions()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/add-questions")
async def add_questions(request: Request) -> Dict[str, Any]:
    """API endpoint to add questions to the vector store"""
    try:
        data = await request.json()
        questions = data.get("questions", [])
        if not questions:
            raise HTTPException(status_code=400, detail="No questions provided")
        
        for question in questions:
            vector_store.add_question(
                question["text"],
                question["answer"],
                question.get("topic", "general")
            )
        return {"status": "success", "message": f"Added {len(questions)} questions"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
