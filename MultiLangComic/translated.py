import pandas as pd
import json
from typing import Dict, List

excel_file_path = r"D://Coding//GitHubTranslation//Risch315815.github.io//MultiLangComic//Excel翻譯_QuestionableCharacter.xlsx"


def get_translations_by_image_id(excel_file_path):
    try:
        # Read the Excel file from specific sheet
        df = pd.read_excel(excel_file_path, sheet_name="工作表2")
        
        # Initialize the main dictionary
        translations = {}
        
        # Process each row in the dataframe
        for _, row in df.iterrows():
            img_path = row['IMGPath']
            textbox_no = row['textboxNo']
            
            # Initialize nested dictionaries if they don't exist
            if img_path not in translations:
                translations[img_path] = {}
            if textbox_no not in translations[img_path]:
                translations[img_path][textbox_no] = {}
            
            # Add translations for each language
            for column in df.columns[5:11]:  # Assuming columns F-K are the language columns
                translations[img_path][textbox_no][column.lower()] = str(row[column])
        
        return translations
    
    except FileNotFoundError:
        print(f"Error: Excel file not found at {excel_file_path}")
        return {}
    except Exception as e:
        print(f"Error processing Excel file: {str(e)}")
        return {}

# Example usage
if __name__ == "__main__":
    translations = get_translations_by_image_id(excel_file_path)
    
    # Print the dictionary as formatted JSON
    print(json.dumps(translations, ensure_ascii=False, indent=2))
    
    # Save translations to a JSON file
    output_file = "D://Coding//GitHubTranslation//Risch315815.github.io//MultiLangComic//QuestionableCharacters.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(translations, f, ensure_ascii=False, indent=2)
    
    print(f"\nTranslations have been saved to {output_file}")