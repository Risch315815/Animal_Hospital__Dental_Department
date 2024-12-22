import pandas as pd
import json
from typing import Dict, List

excel_file_path = r"D://Coding//GitHubTranslation//Risch315815.github.io//ComicTranslate//data//Excel翻譯_TerribleDad.xlsx"

def get_translations_by_image_id(excel_file_path):
    """
    Read Excel file and create dictionaries based on '圖片id' column from '工作表1'.
    Each dictionary contains language codes as keys and translations as values.
    
    Args:
        excel_file_path (str): Path to the Excel file
        
    Returns:
        List[Dict[str, str]]: List of dictionaries containing translations
    """
    try:
        # Read the Excel file from specific sheet
        df = pd.read_excel(excel_file_path, sheet_name="工作表1")
        
        # Group the dataframe by '圖片id'
        grouped = df.groupby('圖片id')
        
        # Initialize list to store dictionaries
        translation_dicts = []
        
        # Create a dictionary for each row
        for image_id, group in grouped:
            # Process each row in the group
            for _, row in group.iterrows():
                # Create dictionary using column names as keys
                translation_dict = {}
                # Skip the first three columns and only include language columns
                language_columns = df.columns[3:]
                
                # Add translations from the row
                for column in language_columns:
                    translation_dict[column.lower()] = str(row[column])
                
                translation_dicts.append(translation_dict)
            
        return translation_dicts
    
    except FileNotFoundError:
        print(f"Error: Excel file not found at {excel_file_path}")
        return []
    except Exception as e:
        print(f"Error processing Excel file: {str(e)}")
        return []

# Example usage
if __name__ == "__main__":
    translations = get_translations_by_image_id(excel_file_path)
    
    # Print each dictionary as formatted JSON
    for i, translation_dict in enumerate(translations, 1):
        print(f"\nDictionary {i}:")
        print(json.dumps(translation_dict, ensure_ascii=False, indent=2))
    
    # Save translations to a JSON file
    output_file = "D:\\Coding\\GitHubTranslation\\Risch315815.github.io\\ComicTranslate\\data\\translated.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(translations, f, ensure_ascii=False, indent=2)
    
    print(f"\nTranslations have been saved to {output_file}")