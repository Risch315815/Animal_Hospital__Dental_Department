import os
import shutil
import json
from datetime import datetime, date

# 1. Designate names
#--------------------------------
theme = "PedoRabbit_BS"

source_image_path = [
    "E:/Social_Project/發文/各色FB發文/牙醫仙子/New folder/20230818_144849484_iOS.png",
    "E:/Social_Project/發文/各色FB發文/牙醫仙子/New folder/20230818_144827221_iOS.png",
    "E:/Social_Project/發文/各色FB發文/牙醫仙子/New folder/20230818_144811542_iOS.png",
    "E:/Social_Project/發文/各色FB發文/牙醫仙子/New folder/20230818_144759706_iOS.png",
    "E:/Social_Project/發文/各色FB發文/牙醫仙子/New folder/20230818_144742895_iOS.png",
    "E:/Social_Project/發文/各色FB發文/牙醫仙子/New folder/20230818_144652914_iOS.png"
]
#--------------------------------

general_file_name = f"{date.today().strftime('%Y-%m-%d')}-{theme}"
html_file = f"{general_file_name}.html"
md_file = "2025-01-02-pedo-rabbit.md" 


#----------------------------------------------------------------------
#----------------------------------------------------------------------

# 2. Create directory for comic images
comic_path = f"D:/Coding/GitHubTranslation/Risch315815.github.io/data/Comics/{theme}"
json_file_path = f"{comic_path}/{theme}.json"
os.makedirs(comic_path, exist_ok=True)

# 3. Copy images to directory
num_image = 0

post_image_path = []

for i in range(len(source_image_path)):
    if source_image_path[i]:
        try:
            source = source_image_path[i]
            destination = os.path.join(comic_path, f"{theme}0{i+1}.png")
            
            # Check if source exists
            if not os.path.exists(source):
                print(f"Warning: Source file not found: {source}")
                continue
                
            shutil.copy2(source, destination)
            post_image_path.append(destination)
            num_image += 1
            print(f"Successfully copied: {source} -> {destination}")
            
        except Exception as e:
            print(f"Error copying file {source}: {str(e)}")

#----------------------------------------------------------------------
#----------------------------------------------------------------------

# 4. Create HTML file

def create_html_content(theme, post_image_path):
    html_content = ""

    html_content_header = f"""
<!DOCTYPE html>
---
layout: default
---
<div class="post-header">
    <h1 data-story-id="character_title"></h1>
</div>

<hr>

<div class="character-story">
    <div class="story-content" data-story-id="character_story">
        <!-- Story paragraphs will be inserted here by JavaScript -->
    </div>
</div>

<hr>
"""
    
    html_content += """<div class="comic-container">"""
    base_path = "D:/Coding/GitHubTranslation/Risch315815.github.io"
    for index in range(len(post_image_path)):
        target_path = post_image_path[index].replace(base_path, "")
        # Convert Windows path separators to web URL format
        target_path = target_path.replace("\\", "/")
        html_content += f"""
    <!-- Scene {index+1} -->
    <div class="comic-panel">
        <div class="image-container">
            <img src="{{'{target_path}' | relative_url}}" alt="Scene {index+1}">
            <div class="text-overlays" data-image-id="{theme}0{index+1}">
            </div>
        </div>
    </div>"""
    
    html_content += """
</div>"""

    html_content01 = html_content_header + html_content
    html_content02 = html_content01.replace("{'", "{{'")
    html_content03 = html_content02.replace("url}", "url}}")
    return html_content03

#-------------------------------------

with open(os.path.join("_layouts", html_file), "w") as f:
    f.write(create_html_content(theme, post_image_path))


#----------------------------------------------------------------------
#----------------------------------------------------------------------

# 5. Create JSON file
json_content = {}
json_content_header = {

    "character_title": {
        "text": {
            "zh-hant": "",
            "en": "",
            "ja": "",
            "es": "",
            "fr": "",
            "th": ""
        }
    },
    "character_story": {
        "text": {
            "en": [
            ""
            ],
            "zh-hant": [
            ""
            ],
            "ja": [
            ""
            ],
            "es": [
            ""
            ],
            "fr": [
            ""
            ],
            "th": [
            ""
            ]
        }
    }
}

json_content.update(json_content_header)

for i in range(len(post_image_path)):
    json_content_body = {
        f"{theme}0{i+1}": {
            "textbox1": {
                "x": "50%",
                "y": "50%",
                "width": "auto",
                "height": "auto",
                "fontSize": "40px",
                "backgroundColor": "rgba(0,0,0,0)",
                "border": "0px solid black",
                "fontWeight": "normal",
                "text": {
                    "en": "",
                    "zh-hant": "",
                    "ja": "",
                    "es": "",
                    "fr": "",
                    "th": ""
                }
            }
        }
    }

    json_content.update(json_content_body)

#-------------------------------
with open(os.path.join("_data", json_file_path), "w", encoding="utf-8") as f:
    json.dump(json_content, f, ensure_ascii=False, indent=4)


#----------------------------------------------------------------------
#----------------------------------------------------------------------

# 6. Add condition to lang_display.js
# Note: This should be added manually to lang_display.js:
add_condition = f"""
    else if (currentPath.includes('{theme}')) 
        translationFile = '/data/Comics/{theme}/{theme}.json';
        console.log('Loading <{theme}> translations:', translationFile);
"""

print("Please add the following condition to lang_display.js:")
print("--------------------------------")
print(add_condition)
print("--------------------------------")

#----------------------------------------------------------------------
#----------------------------------------------------------------------

# 7. Create MD file
md_content = f"""---
layout: {general_file_name}
title: {theme}
date: 2025-01-02
description: "Meet PedoRabbit, the pediatric dentist"
---
"""

with open(os.path.join("_posts", md_file), "w") as f:
    f.write(md_content)


#----------------------------------------------------------------------
#----------------------------------------------------------------------
# 8. Print completion message
print("Post creation completed successfully!")

