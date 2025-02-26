from typing import Optional, Dict, Any
from openai import OpenAI
import os
from ..core.config import settings
from . import bedrock_client

class TextPatternExtractor:
    """
    Extracts repeating patterns of Introduction, Conversation, and Question from text files
    using Amazon Bedrock (amazon.nova-micro-v1:0).
    """

    def __init__(self):
        """
        Initialize the extractor.
        """
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
        - Wrap each question in `<item>` tags with a global <items> tag.  
        - Use XML formatting. Example: `<introduction>`, `<conversation>`, `<question>`  
        - All text must be taken directly from the source without modifications or additions.
        
        4. **Spatial Placement Restriction:**  
        - **Exclude all questions that include spatial relationships** such as left, right, above, below, behind, in front of, between, across, or next to.  
        - Exclude questions referring to directions like north, south, east, or west.  
        - Exclude questions that involve interpreting maps, diagrams, or pointing to specific locations.  
        - Only include questions that differ by actions, visual details, or contextual elements (not relative positioning).  

        ## **Example:**
        <item>
        <ntroduction>my introduction</instroduction>

        <conversation>my conversation</conversation>

        <question>my question</question>
        </item>
        

        ## **Process:**  
        0. **Remove any text that talk about a test or proficiency or mention N5**
        1. **Identify Each Question:** Break the source text into individual questions using contextual breaks.  
        2. **Extract Elements:** Extract the introduction, conversation, and question for each element.  
        3. **Apply Spatial Restriction:** Exclude any questions with spatial references as per the rules.  
        4. **Format Output:** Use proper XML formatting with clear line breaks and consistent indentation.  
        

        
        ## **Verification:**  
        - Verify that each `<item>` element is correctly structured with the three required sections.  
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

        response = self.bedrock_client.converse(
            modelId=self.model_id,
            messages=messages,
            inferenceConfig={
                "temperature": self.temperature,
                "maxTokens": self.max_tokens,
            }
        )

        return response

    def invoke_gpt4o_llm(self, text: str) -> str:
        """
        Use OpenAI GPT-4 to extract Introduction, Conversation, and Question patterns.
        """
        try:
            client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
            openai_settings = settings['openai']['text_structurer']['gpt4o']
            
            prompt = f"""
            ## **Role:**  
            You are a text processing expert specialized in transforming Japanese listening comprehension transcripts into structured `<question>` elements.

            ## **Guidelines:**  
            - **Input:** Japanese listening comprehension transcript  
            - **Output:** Individual `<question>` elements with:
               - **Introduction:** Setting and participants (exact from input)
               - **Conversation:** Exact conversation text
               - **Question:** Extracted main question
            - **Format:**
               - Wrap each question in `<question>` tags with no parent elements.
               - Use capitalized section labels followed by a colon
               - Text must be taken verbatim from the source.

            - **Spatial Restrictions:**
               - Exclude questions with spatial references
               - No directional references
               - No map, diagram, or location-based questions
               - Exclude any questions with an Introduction that talk about lessons or tests

            Text to process:
            {text}
            """

            response = client.chat.completions.create(
                model=openai_settings['model_id'],
                messages=[
                    {"role": "system", "content": "You are a text processing expert."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=2048
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            raise Exception(f"Error in GPT-4 processing: {str(e)}")

    def invoke_llm(self, text: str, llm: str) -> str:
        """
        Use LLM to extract Introduction, Conversation, and Question patterns.
        """
        if llm == "gpt4o":
            output = self.invoke_gpt4o_llm(text)
        elif llm == "nova-micro":
            response = self.invoke_nova_llm(text)
            output = response["output"]["message"]["content"][0]["text"] 
        else:
            raise ValueError(f"Unsupported LLM: {llm}")
        
        return output
