import os
import json
from typing import List, Dict

def process_and_save_questions(text: str, filename: str) -> str:
    """
    Process transcript text and save structured questions to file
    
    Args:
        text (str): Combined transcript text to process
        filename (str): Name of the file to save the processed questions
        
    Returns:
        str: The processed and parsed text
    """
    try:
        # Get the backend directory path
        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        
        # Create directory if it doesn't exist
        filename = os.path.join(backend_dir, filename)
        os.makedirs(os.path.dirname(filename), exist_ok=True)
        
        # Save the processed text
        print(f"Saving processed questions to {filename}")
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(text)
            
        return text
    except Exception as e:
        raise Exception(f"Error saving processed questions: {str(e)}")

def save_transcript(transcript: List[Dict], video_id: str) -> bool:
    """
    Save transcript to file
    
    Args:
        transcript (List[Dict]): List of transcript entries, each containing 'text' key
        video_id (str): Video ID used to name the output file
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Get the backend directory path
        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        
        # Create data directory if it doesn't exist
        data_dir = os.path.join(backend_dir, 'data', 'transcripts')
        os.makedirs(data_dir, exist_ok=True)
        
        # Combine all transcript text
        combined_text = ' '.join(entry['text'] for entry in transcript)
        
        # Save combined text to file
        filename = os.path.join(data_dir, f"{video_id}.txt")
        print(f"Saving transcript to {filename}")
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(combined_text)
            
        return True
    except Exception as e:
        print(f"Error saving transcript: {str(e)}")
        return False
