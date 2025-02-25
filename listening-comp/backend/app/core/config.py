from dotenv import load_dotenv
import os

load_dotenv()

settings = {
    "aws_bedrock": {
        "text_structurer": {
            "model_id": "amazon.nova-micro-v1:0",
            "max_tokens": 2048,
            "temperature": 0.7,
            "top_p": 0.9
        }
    },
    "openai": {
        "text_structurer": {
            "gpt4o": {
                "model_id": "gpt-4"
            }
        }
    }
}
