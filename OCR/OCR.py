import cv2
import numpy as np
import pytesseract
from PIL import Image
import json
# Add near the top of your file, before using pytesseract
import pytesseract
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'  # Adjust path as needed

IMG_with_text = r"D:\Coding\GitHubTranslation\Risch315815.github.io\OCR\MentorMeeting\o4.png"
IMG_without_text = r"D:\Coding\GitHubTranslation\Risch315815.github.io\OCR\MentorMeeting\o4C.png"
OUTPUT_JSON_PATH = r"D:\Coding\GitHubTranslation\Risch315815.github.io\OCR\MentorMeeting\character_text_config.json"


def detect_and_position_text(image_with_text, image_without_text, output_json_path):
    """
    Detect Chinese text in an image and generate JSON configuration for text boxes.
    
    Args:
        image_with_text: Path to the image containing Chinese text
        image_without_text: Path to the same image without text
        output_json_path: Path to save the generated JSON configuration
    """
    # Load images
    img_with_text = cv2.imread(image_with_text)
    img_without_text = cv2.imread(image_without_text)
    
    # Convert to grayscale
    gray = cv2.cvtColor(img_with_text, cv2.COLOR_BGR2GRAY)
    
    # Apply thresholding to isolate text
    _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY_INV)
    
    # Find contours - these will potentially be our text regions
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Image dimensions for percentage calculations
    height, width = img_with_text.shape[:2]
    
    # Dictionary to hold text box configurations
    text_config = {}
    character_id = "Character" # Replace with your character ID
    text_config[character_id] = {}
    
    # Process each potential text region
    box_counter = 1
    for i, contour in enumerate(contours):
        # Filter small contours that are likely noise
        if cv2.contourArea(contour) < 500:
            continue
            
        # Get bounding box for contour
        x, y, w, h = cv2.boundingRect(contour)
        
        # Extract region of interest
        roi = gray[y:y+h, x:x+w]
        
        # Use Tesseract to detect Chinese text
        config = '--psm 6 -l chi_tra'  # Page segmentation mode 6 and traditional Chinese language
        text = pytesseract.image_to_string(roi, config=config).strip()
        
        # If text is detected, add configuration
        if text:
            # Convert coordinates to percentages
            x_percent = f"{int(x / width * 100)}%"
            y_percent = f"{int(y / height * 100)}%"
            
            # Create text box configuration
            textbox_id = f"textbox{box_counter}"
            text_config[character_id][textbox_id] = {
                "x": x_percent,
                "y": y_percent,
                "width": "auto",
                "height": "auto",
                "fontSize": "40px",
                "backgroundColor": "rgba(0,0,0,0.02)",
                "border": "2px solid black",
                "text": {
                    "zh-hant": text,
                    "en": "",  # Empty placeholders for other languages
                    "ja": "",
                    "es": "",
                    "fr": "",
                    "th": ""
                }
            }
            box_counter += 1
    
    # Save configuration to JSON file
    with open(output_json_path, 'w', encoding='utf-8') as f:
        json.dump(text_config, f, ensure_ascii=False, indent=2)
    
    print(f"Text detection completed. Configuration saved to {output_json_path}")
    return text_config

# Example usage
detect_and_position_text(IMG_with_text, IMG_without_text, OUTPUT_JSON_PATH)