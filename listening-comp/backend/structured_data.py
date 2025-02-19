import sys
import os
import boto3
import json
from typing import Optional

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend import bedrock_client
from backend import settings

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
        self.model_id = settings['aws bedrock']['text structurer']['model_id']
        self.max_tokens = settings['aws bedrock']['text structurer']['max_tokens']
        self.temperature = settings['aws bedrock']['text structurer']['temperature']
        self.top_p = settings['aws bedrock']['text structurer']['top_p']


    def invoke_llm(self, text_chunk: str) -> str:
        """
        Use Amazon Bedrock to extract Introduction, Conversation, and Question patterns.

        Args:
            text_chunk (str): The input text to process.

        Returns:
            str: The extracted patterns in plain text.
        """
        prompt = f"""
        Extract all repeating patterns from the following text. Each pattern should be formatted as follows:
        - Introduction: ...
        - Conversation: ...
        - Question: ...

        Text:
        {text_chunk}

        Output the result as plain text with each pattern separated by a blank line.
        Use the exact words from the input without rephrasing.
        """
        messages = [
            {
                "role": "user",
                "content": prompt
            }
        ]

        # payload = {
        #     "inputText": prompt,
        #     "maxTokens": 2048,     # Increased for large text
        #     "temperature": 0.3,    # Lower temperature for deterministic output
        #     "topP": 0.9
        # }

        # Invoke Bedrock Model
        response = self.bedrock_client.converse(
            modelId=self.model_id,
            messages=messages)

        # Parse response
        bedrock_output = response['output']['message']['content'][0]['text']
        print(bedrock_output)
        return bedrock_output


    def parse_transcript(self, input_file: str) -> str:
        """
        Process a text file using Amazon Bedrock and save the extracted patterns.

        Args:
            input_file (str): Path to the input text file.
            output_file (str): Path to save the extracted output.
        """
        print("Processing file...")

        # Read input text
        with open(input_file, 'r', encoding='utf-8') as file:
            text = file.read()

        # Extract patterns using Amazon Bedrock
        parsed_text = self.invoke_llm(text)

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

if __name__ == "__main__":

    extractor = TextPatternExtractor()
    parsed_text = extractor.parse_transcript(input_file= "./transcripts/CQ82yk3BC6c.txt")
    print(parsed_text)