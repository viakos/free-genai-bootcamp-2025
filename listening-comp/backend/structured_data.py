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
        ## **Role:**
        You are a text processing expert specialized in transforming Japanese listening comprehension scripts into structured XML items.

        ## **Instruction:**  
        Follow the exact format, structure, and phrasing demonstrated in the provided examples. Your output must replicate the hierarchical XML structure, using correct tags and logical formatting.

        ## **Guidelines:**  
        1. **Input:** The input is a transcript of a listening comprehension exercise in Japanese.  
        2. **Output:** Convert the input into XML items using the following tags: `<items>`, `<item>`, `<introduction>`, `<conversation>`, `<question>`, and `<propositions>`.  
        3. **Item Structure:**  
        - `<introduction>`: Briefly summarize the setting and participants.  
        - `<conversation>`: Use the exact conversation text from the input.  
        - `<question>`: Extract the main question posed after the conversation.  
        - `<propositions>`: Provide four propositions using `<proposition id="X">`, each describing a visual scene based on the conversation.  
        4. **Formatting Rules:**  
        - Use exact formatting and spacing as shown in the example.  
        - Each `<item>` must contain exactly one `<introduction>`, one `<conversation>`, one `<question>`, and four `<proposition>` elements.  
        - Ensure each `<proposition>` is detailed, mentioning character appearance, environment, and mood.  

        ## **Examples:**  
        For each conversation in the input, produce output as follows:

        ```xml
        <items>
            <item>
                <introduction>料理のクラスで女の先生と男の学生が話しています</introduction>
                <conversation>ではこれからカレーを作りましょう先生私は野菜を切りましょうか いえ野菜じゃなくて肉を切ってください はい</conversation>
                <question>男の学生はこの後すぐ何をしますか</question>
                <propositions>
                    <proposition id="1">A young male student cutting vegetables in a cooking class, with a female teacher nearby, modern kitchen setting, anime style</proposition>
                    <proposition id="2">A young male student cutting meat in a cooking class, with a female teacher supervising, modern kitchen setting, anime style</proposition>
                    <proposition id="3">A young male student cooking rice in a pot, focused expression, modern kitchen setting, anime style</proposition>
                    <proposition id="4">A young male student washing dishes at a sink in a cooking class, stainless steel kitchen, anime style</proposition>
                </propositions>
            </item>
        </items>
        ```

        ## **Process:**  
        1. **Identify Items:** Divide the source text into separate items using contextual breaks.  
        2. **Extract Elements:** For each item, extract the introduction, conversation, question, and propositions.  
        3. **Translate Propositions:** Convert each proposition into a visual description for text-to-image generation.  
        4. **Format Output:** Ensure the output uses proper XML formatting and indentation.  

        ## **Important Notes:**  
        - Use concise but clear language for `<introduction>`.  
        - Keep `<conversation>` exactly as provided in the source text, without alterations.  
        - Write `<question>` as a direct question extracted from the source.  
        - Ensure `<proposition>` elements are descriptive, mentioning key visual details.  
        - Maintain the realistic style in all visual descriptions.  

        ## **Final Check:**  
        - Verify that each `<item>` is correctly structured.  
        - Confirm that all four propositions are visually distinct but related to the conversation.  
        - Ensure no elements are missing or misformatted.  



        Text:
        {text_chunk}
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
                "temperature": 0
            }
        )
        print(response)

        # Parse response
        bedrock_output = response["output"]["message"]["content"][0]["text"] 
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