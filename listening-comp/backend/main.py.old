import json
import os
from fastapi import FastAPI, HTTPException
from typing import Optional
from backend import bedrock_client
from dotenv import load_dotenv
from typing import Optional, Dict, Any, List, Union
from fastapi import FastAPI, HTTPException, Request, Depends, Query
from youtube_transcript_api import YouTubeTranscriptApi
from backend import settings
from openai import OpenAI
import os

load_dotenv()


# Initialize FastAPI app
app = FastAPI()

MODEL_ID = settings["aws_bedrock"]["text_structurer"]["model_id"] #"amazon.nova-micro-v1:0"

class TextPatternExtractor:
    """
    Extracts repeating patterns of Introduction, Conversation, and Question from text files
    using Amazon Bedrock (amazon.nova-micro-v1:0).
    """

    def __init__(self):
        """
        Initialize the extractor.
        """
        # Initialize Amazon Bedrock client
        self.bedrock_client = bedrock_client
        self.model_id = settings['aws_bedrock']['text_structurer']['model_id']
        self.max_tokens = settings['aws_bedrock']['text_structurer']['max_tokens']
        self.temperature = settings['aws_bedrock']['text_structurer']['temperature']
        self.top_p = settings['aws_bedrock']['text_structurer']['top_p']

    def invoke_nova_llm(self, text: str) -> str:
        """
        Use Amazon Bedrock to extract Introduction, Conversation, and Question patterns.
        """
        prompt = f"""
        ## **Role:**  
        You are a text processing AI specialized in transforming Japanese listening comprehension scripts into structured XML `<question>` elements.

        ## **Guidelines:**  
        1. **Input:** The input is a transcript of a listening comprehension exercise in Japanese.  
        2. **Output:** Convert the input into individual `<question>` elements with the following sections:  
        - **Introduction:** Summarize the setting and participants (use text exactly from the input).  
        - **Conversation:** Use the exact conversation text from the input.  
        - **Question:** Extract the main question posed after the conversation.  
        3. **Formatting Rules:**  
        - Wrap each question in `<question>` tags without any parent elements.  
        - Use exact formatting with capitalized section names followed by a colon. Example: `Introduction:`, `Conversation:`, `Question:`  
        - All text must be taken directly from the source without modifications or additions.
        
        4. **Spatial Placement Restriction:**  
        - **Exclude all questions that include spatial relationships** such as left, right, above, below, behind, in front of, between, across, or next to.  
        - Exclude questions referring to directions like north, south, east, or west.  
        - Exclude questions that involve interpreting maps, diagrams, or pointing to specific locations.  
        - Only include questions that differ by actions, visual details, or contextual elements (not relative positioning).  

        ## **Example:**
        <question>
        Introduction: 朝会の練習でN5の試験模試をしている

        Conversation: 朝会これからN5の懲戒試験を始めますメモを取ってもいいです問題用紙を開けてください問題1問題1では初めに質問を聞いてくださいそれから話を聞いて問題用紙の1から4の中から1番いいものを1つ選んでくださいでは練習しましょう例家で女の人が男の人と話しています女の人は男の人に何を出しますか今日は寒いですね温かいものを飲みませんかありがとうございませんコーヒー紅茶あとお茶もありますですけどじゃあ紅茶をお願いします砂糖やミルクは入れますかはい

        Question: 女の人は男の人に何を出しますか
        </question>
        

        ## **Process:**  
        0. **Remove any text that talk about a test or proficiency or mention N5**
        1. **Identify Each Question:** Break the source text into individual questions using contextual breaks.  
        2. **Extract Elements:** Extract the introduction, conversation, and question for each element.  
        3. **Apply Spatial Restriction:** Exclude any questions with spatial references as per the rules.  
        4. **Format Output:** Use proper XML formatting with clear line breaks and consistent indentation.  
        

        
        ## **Verification:**  
        - Verify that each `<question>` element is correctly structured with the three required sections.  
        - Confirm that the text is taken directly from the source without modifications or additions.  
        - Ensure no spatial references are present in the selected questions.  
        - Validate that the formatting is consistent and free of syntax errors.
        - ** If one of the <question> elements is an example question then remove the whole <question> element.**


        Text:
        {text}
        """
        messages = [
            {
                "role": "user",
                "content": [{'text': prompt}]
            }
        ]

        # Invoke Bedrock Model
        response = self.bedrock_client.converse(
            modelId=self.model_id,
            messages=messages,
            inferenceConfig={
                "temperature": self.temperature,
                "maxTokens": self.max_tokens,
            }
        )

        return response

    def invoke_llm(self, text: str, llm: str) -> str:
        """
        Use LLM to extract Introduction, Conversation, and Question patterns.

        Args:
            text (str): The input text to process.

        Returns:
            str: The extracted patterns in plain text.
        """
        output = None
        if llm == "gpt4o":
            print("==== Invoking GPT-4o")
            output = self.invoke_gpt4o_llm(text)
        
        elif llm == "nova-micro":
            response = self.invoke_nova_llm(text)
            output = response["output"]["message"]["content"][0]["text"] 
        
        return output

    def invoke_gpt4o_llm(self, text: str) -> str:
        """
        Use OpenAI GPT-4 to extract Introduction, Conversation, and Question patterns.
        
        Args:
            text (str): The input text to process.
            
        Returns:
            str: The extracted patterns in XML format.
        """
        try:
            # Initialize OpenAI client with API key from environment
            client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
            
            # Get OpenAI settings from config
            openai_settings = settings['openai']['text_structurer']['gpt4o']
            
            prompt = f"""
            ## **Role:**  
            You are a text processing expert specialized in transforming Japanese listening comprehension transcripts into structured `<question>` elements. Your goal is to extract and format the text exactly as provided, following the defined structure.

            ## **Instruction:**  
            Transform Japanese listening comprehension transcripts into structured `<question>` elements using the exact text from the source.

            ## **Guidelines:**  
            - **Input:** Japanese listening comprehension transcript  
            - **Output:** Individual `<question>` elements with:
               - **Introduction:** Setting and participants (exact from input)
               - **Conversation:** Exact conversation text
               - **Question:** Extracted main question
            - **Format:**
               - Wrap each question in `<question>` tags with no parent elements.
               - Use capitalized section labels followed by a colon: `Introduction:`, `Conversation:`, `Question:`
               - Text must be taken verbatim from the source.

            - **Spatial Restrictions:**
               - Exclude questions with spatial references (left, right, above, below, behind, next to, etc.)
               - No directional references (north, south, east, west)
               - No map, diagram, or location-based questions
               - Exclude any questions with an Introduction that talk about lessons or tests or mention "N5"

            ## **Example:**
            <question>
            Introduction: 朝会の練習でN5の試験模試をしている

            Conversation: 朝会これからN5の懲戒試験を始めますメモを取ってもいいです問題用紙を開けてください問題1問題1では初めに質問を聞いてくださいそれから話を聞いて問題用紙の1から4の中から1番いいものを1つ選んでくださいでは練習しましょう例家で女の人が男の人と話しています女の人は男の人に何を出しますか今日は寒いですね温かいものを飲みませんかありがとうございませんコーヒー紅茶あとお茶もありますですけどじゃあ紅茶をお願いします砂糖やミルクは入れますかはい

            Question: 女の人は男の人に何を出しますか
            </question>

            ## **Process:**  
            1. **Identify:** Break the source into individual questions.  
            2. **Extract:** Copy introduction, conversation, and question exactly from the source.  
            3. **Filter:** Exclude questions with spatial or directional references.  
            4. **Format:** Output each question using the provided structure.

            ## **Verification:**  
            - Ensure each `<question>` element has Introduction, Conversation, and Question.
            - Verify that the text is copied verbatim from the source.
            - Confirm no spatial or directional references are included.

            Text to process:
            {text}
            """

            response = client.chat.completions.create(
                model=openai_settings['model_id'],
                messages=[
                    {"role": "system", "content": "You are a text processing AI that extracts and structures Japanese listening comprehension content."},
                    {"role": "user", "content": prompt}
                ],
                temperature=openai_settings['temperature'],
                max_tokens=openai_settings['max_tokens']
            )
            
            content = response.choices[0].message.content

            return content
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error generating response with GPT-4: {str(e)}")

    def parse_transcript(self, text: str) -> str:
        """
        Process a text file using Amazon Bedrock and save the extracted patterns.

        Args:
            input_file (str): Path to the input text file.
            output_file (str): Path to save the extracted output.
        """
        print("Processing file...")

        # Read input text
        # with open(input_file, 'r', encoding='utf-8') as file:
        #     text = file.read()

        # Extract patterns using Amazon Bedrock
        parsed_text = self.invoke_llm(text, "gpt4o")
        print(f"==== Parsed text: {parsed_text}")
        return parsed_text


    def extract_from_text(self, text: str) -> str:
        """
        Extract patterns from a text string using Amazon Bedrock.

        Args:
            text (str): The input text.

        Returns:
            str: The extracted patterns in plain text.
        """
        return self.invoke_bedrock(text)

class YouTubeTranscriptDownloader:
    def __init__(self, languages: List[str] = ["ja", "en"]):
        self.languages = languages

    def extract_video_id(self, url: str) -> Optional[str]:
        """Extract video ID from YouTube URL."""
        if "v=" in url:
            return url.split("v=")[1][:11]
        elif "youtu.be/" in url:
            return url.split("youtu.be/")[1][:11]
        return None

    def get_transcript(self, video_id: str) -> Optional[List[Dict]]:
        """Download YouTube Transcript."""
        if "youtube.com" in video_id or "youtu.be" in video_id:
            video_id = self.extract_video_id(video_id)

        if not video_id:
            return None

        try:
            transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=self.languages)
            # print(f"****** Transcript: {transcript}")
            return transcript
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

class BedrockChat:
    def __init__(self, model_id: str = MODEL_ID):
        """Initialize Bedrock chat client"""
        self.bedrock_client = bedrock_client
        self.model_id = model_id

    def generate_response(self, message: str, inference_config: Optional[Dict[str, Any]] = None) -> Optional[str]:
        """Generate a response using Amazon Bedrock"""
        if inference_config is None:
            inference_config = {"temperature": 0.7}

        messages = [{
            "role": "user",
            "content": [{"text": message}]
        }]

        try:
            response = self.bedrock_client.converse(
                modelId=self.model_id,
                messages=messages,
                inferenceConfig=inference_config
            )
            return response['output']['message']['content'][0]['text']
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")

# Dependency to get BedrockChat instance
def get_bedrock_chat() -> BedrockChat:
    return BedrockChat()

def process_and_save_questions(text: str, filename: str) -> str:
    """
    Process transcript text and save structured questions to file
    
    Args:
        text (str): Combined transcript text to process
        filename (str): Name of the file to save the processed questions
        
    Returns:
        str: The processed and parsed text
    """
    extractor = TextPatternExtractor()
    parsed_text = extractor.parse_transcript(text)
    
    # Save to file
    questions_filename = os.path.join("backend", "data", "questions", filename)
    os.makedirs(os.path.dirname(questions_filename), exist_ok=True)
    print(parsed_text)
    with open(questions_filename, mode='w', encoding='utf-8') as f:
        f.write(parsed_text)
    
    return parsed_text

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
        combined_text = ""
        for entry in transcript:  # transcript is now a list directly
            combined_text += entry["text"] + "\n"
        
        if combined_text:
            # Save transcript text
            transcript_filename = os.path.join("backend", "data", "transcripts", f"{video_id}.txt")
            print("Saving transcript to", transcript_filename)
            os.makedirs(os.path.dirname(transcript_filename), exist_ok=True)
            with open(transcript_filename, "w", encoding="utf-8") as f:
                f.write(combined_text)
            
            # Process questions using the same text
            filename = f"{video_id}.txt"
            process_and_save_questions(combined_text, filename)
            
        return True
    except Exception as e:
        print(f"Error saving transcript: {str(e)}")
        return False

# Endpoint to generate a response
@app.post("/invoke-llm")
async def invoke_llm(request: Request, chat: BedrockChat = Depends(get_bedrock_chat)):
    """API endpoint to generate a response using Amazon Bedrock"""
    data = await request.json()  # Parse JSON directly
    message = data.get("message")
    inference_config = data.get("inference_config", None)

    if not message:
        raise HTTPException(status_code=400, detail="Message is required")

    response = chat.generate_response(message, inference_config)
    return {"response": response}

# Endpoint: /get-transcript
@app.get("/get-transcript")
def get_transcript(video_url: str = Query(..., description="YouTube video URL")):
    """API Endpoint to get the transcript of a YouTube video."""
    downloader = YouTubeTranscriptDownloader()
    transcript = downloader.get_transcript(video_url)
    video_id = downloader.extract_video_id(video_url)
    # print(f"****** Transcript: {transcript}")
    save_transcript(transcript, video_id)
    

    if transcript is None:
        raise HTTPException(status_code=404, detail="Transcript not found")

    return {"transcript": transcript}  # Just return raw data, no validation

# To run this API:
# 1. Install FastAPI and Uvicorn: pip install fastapi uvicorn
# 2. Start the server: uvicorn main:app --host 127.0.0.1 --port 8000

# Test endpoints:
# 1. http://127.0.0.1:8000/hello?name=John
# 2. http://127.0.0.1:8000/add?a=5&b=10
