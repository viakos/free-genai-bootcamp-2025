from typing import Dict, Any, Optional
from . import bedrock_client
from ..core.config import settings

MODEL_ID = settings["aws_bedrock"]["text_structurer"]["model_id"]

class BedrockChat:
    def __init__(self, model_id: str = MODEL_ID):
        """Initialize Bedrock chat client"""
        self.bedrock_client = bedrock_client
        self.model_id = model_id

    def generate_response(self, message: str, inference_config: Optional[Dict[str, Any]] = None) -> Dict:
        """
        Generate a response using Amazon Bedrock
        """
        if inference_config is None:
            inference_config = {
                "temperature": 0.7,
                "maxTokens": 512,
            }

        messages = [
            {
                "role": "user",
                "content": [{"text": message}]
            }
        ]

        response = self.bedrock_client.converse(
            modelId=self.model_id,
            messages=messages,
            inferenceConfig=inference_config
        )

        return response
