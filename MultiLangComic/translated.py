import pandas as pd
import json
from typing import Dict, List

excel_file_path = r"D://Coding//GitHubTranslation//Risch315815.github.io//MultiLangComic//Excel翻譯_ProsthoWolf_BS.xlsx"
img_name = "ProsthoWolf_BS"
output_file = f"D://Coding//GitHubTranslation//Risch315815.github.io//data//Comics//{img_name}//{img_name}.json"

def get_translations(excel_file_path):
    try:
        # Read the Excel file from specific sheet
        df = pd.read_excel(excel_file_path, sheet_name="工作表2")
        
        # Initialize translations dictionary
        translations = {}
        
        # Get the number of rows in the dataframe
        num_rows = len(df.index)
        
        for i in range(num_rows):
            # Get text from columns C to H (indices 2 to 7)
            text = df.iloc[i, 2]  # Get text from column C
            
            # Create the structure for this text
            translations[f"{img_name}{i+1}"] = {
                "textbox1": {
                    "x": "50%",
                    "y": "50%",
                    "width": "auto",
                    "height": "auto",
                    "fontSize": "26px",
                    "backgroundColor": "rgba(0,0,0,0.02)",
                    "border": "2px solid black",
                    "text": {
                        "en": df.iloc[i, 2],      # Column C
                        "zh-hant": df.iloc[i, 3],  # Column D
                        "ja": df.iloc[i, 4],      # Column E
                        "es": df.iloc[i, 5],      # Column F
                        "fr": df.iloc[i, 6],      # Column G
                        "th": df.iloc[i, 7]       # Column H
                    }
                }
            }
            
        return translations
        
    except FileNotFoundError:
        print(f"Error: Excel file not found at {excel_file_path}")
        return {}
    except Exception as e:
        print(f"Error processing Excel file: {str(e)}")
        return {}

# Example usage
if __name__ == "__main__":
    translations = get_translations(excel_file_path)
    
    # Print the dictionary as formatted JSON
    print(json.dumps(translations, ensure_ascii=False, indent=2))
    
    # Save translations to a JSON file

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(translations, f, ensure_ascii=False, indent=2)
    
    print(f"\nTranslations have been saved to {output_file}")