# /mnt/c/Users/lviva/Documents/TRAINING/AI/GenAI_Bootcamp/free-genai-bootcamp-2025/thai-streamlit-app/ocr_utils.py
from typing import Optional, Tuple
import easyocr
import numpy as np
from PIL import Image
import io
import torch
import streamlit as st
import cv2
import os
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

class ThaiOCR:
    _instance = None
    
    def __new__(cls):
        """Singleton pattern to ensure only one OCR instance."""
        if cls._instance is None:
            cls._instance = super(ThaiOCR, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        """Initialize the OCR reader for Thai language."""
        if self._initialized:
            return
            
        try:
            # Set CUDA device if available
            if torch.cuda.is_available():
                torch.cuda.set_device(0)
            
            self.reader = easyocr.Reader(['th'], gpu=torch.cuda.is_available())
            self._initialized = True
            
            # Create image logs directory if it doesn't exist
            self.image_logs_dir = 'image-logs'
            os.makedirs(self.image_logs_dir, exist_ok=True)
            logging.info(f"Image logs directory: {os.path.abspath(self.image_logs_dir)}")
            
        except Exception as e:
            st.error(f"Error initializing OCR: {str(e)}")
            self.reader = None
            self._initialized = False
    
    def save_image(self, image: Image.Image, target_char: str, confidence: float) -> str:
        """
        Save the image to the logs directory with character and confidence in filename.
        
        Args:
            image: PIL Image to save
            target_char: The target Thai character
            confidence: Recognition confidence
            
        Returns:
            str: Path to the saved image
        """
        try:
            # Create filename with timestamp to ensure uniqueness
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{target_char}-{confidence:.2f}-{timestamp}.png"
            filepath = os.path.join(self.image_logs_dir, filename)
            
            # Save the image
            image.save(filepath)
            logging.info(f"Saved image to: {os.path.abspath(filepath)}")
            
            return filepath
        except Exception as e:
            logging.error(f"Error saving image: {str(e)}")
            return ""
    
    def preprocess_image(self, image_data: np.ndarray) -> np.ndarray:
        """
        Preprocess the image for better OCR recognition.
        
        Args:
            image_data: Raw image data from canvas
            
        Returns:
            Preprocessed image data
        """
        # Convert to grayscale
        if len(image_data.shape) > 2:
            gray = cv2.cvtColor(image_data, cv2.COLOR_RGB2GRAY)
        else:
            gray = image_data
            
        # Apply thresholding to get binary image
        _, binary = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)
        
        # Find contours
        contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if not contours:
            return image_data
            
        # Find the main character contour (largest one)
        main_contour = max(contours, key=cv2.contourArea)
        
        # Get bounding box
        x, y, w, h = cv2.boundingRect(main_contour)
        
        # Add padding
        padding = 20
        x = max(0, x - padding)
        y = max(0, y - padding)
        w = min(binary.shape[1] - x, w + 2 * padding)
        h = min(binary.shape[0] - y, h + 2 * padding)
        
        # Crop to the character
        cropped = binary[y:y+h, x:x+w]
        
        # Resize to a standard size
        target_size = (200, 200)
        resized = cv2.resize(cropped, target_size, interpolation=cv2.INTER_AREA)
        
        return resized
    
    def process_image(self, image_data: np.ndarray, target_char: str) -> Tuple[str, float]:
        """
        Process the image and return the recognized Thai character.
        
        Args:
            image_data: numpy array of the image
            target_char: The target Thai character for logging
            
        Returns:
            tuple: (recognized character, confidence score)
        """
        if not self._initialized or self.reader is None:
            return "", 0.0
            
        try:
            # Preprocess the image
            processed_image = self.preprocess_image(image_data)
            
            # Convert to PIL Image
            image = Image.fromarray(processed_image.astype('uint8'))
            
            # Convert to bytes
            img_byte_arr = io.BytesIO()
            image.save(img_byte_arr, format='PNG')
            img_byte_arr = img_byte_arr.getvalue()
            
            # Get OCR results
            results = self.reader.readtext(img_byte_arr)
            
            if not results:
                confidence = 0.0
                text = ""
            else:
                # Get the first result with highest confidence
                text = results[0][1]  # Get the recognized text
                confidence = float(results[0][2])  # Get the confidence score
                
                # If multiple characters were detected, take only the first one
                if len(text) > 1:
                    text = text[0]
                
                # Ensure confidence is between 0 and 1
                confidence = max(0.0, min(1.0, confidence))
            
            # Save the image and log the results
            image_path = self.save_image(image, target_char, confidence)
            logging.info(f"OCR Log - Path: {image_path}, Target: {target_char}, Confidence: {confidence:.2f}")
                
            return text, confidence
            
        except Exception as e:
            st.error(f"Error processing image: {str(e)}")
            logging.error(f"OCR Error - Target: {target_char}, Error: {str(e)}")
            return "", 0.0

    def compare_characters(self, detected_char: str, target_char: str, strict: bool = True) -> bool:
        """
        Compare the detected character with the target character.
        
        Args:
            detected_char: Character detected by OCR
            target_char: Target Thai character to match
            strict: If True, requires exact match. If False, allows for some variation.
            
        Returns:
            bool: True if characters match according to the strictness setting
        """
        if not detected_char or not target_char:
            return False
            
        if strict:
            return detected_char.strip() == target_char.strip()
        else:
            # TODO: Implement more flexible matching using character similarity
            # For now, just strip and compare
            return detected_char.strip() == target_char.strip()
