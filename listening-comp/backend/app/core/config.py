from dotenv import load_dotenv
import os
import yaml

load_dotenv()

def load_settings(file_path: str) -> dict:
    """
    Load settings from a YAML file using PyYAML.
    """
    with open(file_path, 'r', encoding='utf-8') as file:
        return yaml.safe_load(file)  # Use safe_load for security

# Load settings from YAML file
settings = load_settings("backend/settings.yaml")
