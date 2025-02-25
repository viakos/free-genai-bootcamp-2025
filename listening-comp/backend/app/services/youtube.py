from typing import List, Dict
from youtube_transcript_api import YouTubeTranscriptApi
import re

class YouTubeTranscriptDownloader:
    def __init__(self, languages: List[str] = ["ja", "en"]):
        self.languages = languages

    def extract_video_id(self, url: str) -> str:
        """
        Extract video ID from YouTube URL.
        """
        # Regular expressions for different YouTube URL formats
        patterns = [
            r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)',
            r'youtube\.com\/shorts\/([^&\n?#]+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        
        raise ValueError("Invalid YouTube URL format")

    def get_transcript(self, video_id: str) -> List[Dict]:
        """
        Download YouTube Transcript.
        """
        try:
            transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=self.languages)
            return transcript
        except Exception as e:
            raise Exception(f"Error fetching transcript: {str(e)}")
