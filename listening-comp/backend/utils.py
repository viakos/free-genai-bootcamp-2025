import yaml

def load_settings(file_path: str) -> dict:
    """
    Load settings from a YAML file using PyYAML.
    """
    with open(file_path, 'r', encoding='utf-8') as file:
        settings = yaml.safe_load(file)  # Use safe_load for security
    return settings
