# __init__.py (Root of Project)

import boto3
import os
from backend.utils import load_settings
from dotenv import load_dotenv

load_dotenv()

# Initialize Bedrock Client and Make It Globally Available
bedrock_client = boto3.client(
    'bedrock-runtime',
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name="us-east-1"
)



settings = load_settings("settings.yaml")


