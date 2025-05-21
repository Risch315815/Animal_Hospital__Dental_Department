import os
import shutil
from datetime import datetime
import json

#------------------------------------------------------------------

# Set your theme and character status here
THEME = "CaptainFrontalLobotomy"  # Change this to your character name
IS_NEW_CHARACTER = True           # Set to False if it's an existing character
TITLE_ZH = "前額葉切除隊長"  # Chinese title
TITLE_EN = "Captain Frontal Lobotomy"  # English title
IMG1 = "E:/Social_Project/發文/各色FB發文/牙醫仙子/Characters/20230826_111341823_iOS.png"
IMG2 = "E:/Social_Project/發文/各色FB發文/牙醫仙子/Characters/20230826_111623435_iOS.png"
IMG3 = ""
IMG4 = ""
IMG5 = ""



#------------------------------------------------------------------

class PostCreator:
    def __init__(self, theme, is_new_character=True):
        self.theme = theme
        self.is_new_character = is_new_character
        self.date = datetime.now().strftime("%Y-%m-%d")
        self.base_dir = "D:/Coding/GitHubTranslation/Risch315815.github.io"
        
    def create_directory_structure(self):
        """Create necessary directories"""
        directories = [
            f"{self.base_dir}/_layouts",
            f"{self.base_dir}/_posts",
            f"{self.base_dir}/data/Comics/{self.theme}_BS"
        ]
        for directory in directories:
            os.makedirs(directory, exist_ok=True)

#------------------------------------------------------------------

    def create_layout_file(self):
        """Create the HTML layout file"""
        layout_content = f"""---
layout: default
---
<div class="post-header">
    <h1>{{{{ page.title_zh }}}} / {{{{ page.title_en }}}}</h1>
    <br>
</div>

<hr>
<br>

<!-- Character Introduction -->
<div class="character-story">
    <h2>Background Story</h2>
    <p>
        [Character background story here]
    </p>
</div>

<div class="comic-container">
    {self.scenes_html if hasattr(self, 'scenes_html') else '<!-- No scenes -->'}
</div>
"""
        if self.is_new_character:
            layout_content += """
<div class="character-description">
    <h2>Character Profile</h2>
    <ul>
        <li><strong>Chinese Name:</strong> [Chinese name]</li>
        <li><strong>English Name:</strong> [English name]</li>
        <li><strong>Specialty:</strong> [Specialty]</li>
        <li><strong>Catchphrase:</strong> "[Catchphrase]"</li>
    </ul>
</div>
"""

        layout_file = f"{self.base_dir}/_layouts/{self.date}-{self.theme}-BS-post.html"
        with open(layout_file, 'w', encoding='utf-8') as f:
            f.write(layout_content)

#------------------------------------------------------------------

    def create_post_file(self):
        """Create the markdown post file"""
        post_content = f"""---
layout: {self.date}-{self.theme}-BS-post
title: "{TITLE_ZH} / {TITLE_EN}"
title_zh: "{TITLE_ZH}"
title_en: "{TITLE_EN}"
date: {self.date}
description: "Description of the post"
---
"""
        post_file = f"{self.base_dir}/_posts/{self.date}-{self.theme.lower()}.md"
        with open(post_file, 'w', encoding='utf-8') as f:
            f.write(post_content)

#------------------------------------------------------------------

    def create_json_template(self):
        """Create JSON template for text overlays"""
        json_template = self.json_scenes if hasattr(self, 'json_scenes') else {
            f"{self.theme}_BS01": {
                "textbox1": {
                    "x": "50%",
                    "y": "50%",
                    "width": "auto",
                    "height": "auto",
                    "fontSize": "40px",
                    "backgroundColor": "rgba(0,0,0,0.02)",
                    "border": "2px solid black",
                    "text": {
                        "en": "[English text]",
                        "zh-hant": "[Chinese text]",
                        "ja": "[Japanese text]",
                        "es": "[Spanish text]",
                        "fr": "[French text]",
                        "th": "[Thai text]"
                    }
                }
            }
        }
        
        json_file = f"{self.base_dir}/data/Comics/{self.theme}_BS/{self.theme}_BS.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(json_template, f, ensure_ascii=False, indent=2)

#------------------------------------------------------------------

    def update_lang_display(self):
        """Add path to lang_display.js"""
        js_file = f"{self.base_dir}/assets/js/lang_display.js"
        
        with open(js_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Add new condition before the final else
        new_condition = f"""}} else if (path.includes('{self.date}/{self.theme.lower()}')) {{
            translationFile = '/data/Comics/{self.theme}_BS/{self.theme}_BS.json';
            console.log('Loading <{self.theme}> translations');"""
            
        content = content.replace('} else {', new_condition + '\n        } else {')
        
        with open(js_file, 'w', encoding='utf-8') as f:
            f.write(content)

#------------------------------------------------------------------

    def handle_images(self):
        """Copy and rename images, update layout and JSON accordingly"""
        image_sources = [IMG1, IMG2, IMG3, IMG4, IMG5]
        valid_images = [img for img in image_sources if img]  # Filter out empty strings
        num_images = len(valid_images)
        
        if num_images == 0:
            return
        
        # 1. Copy and rename images
        target_dir = f"{self.base_dir}/data/Comics/{self.theme}_BS"
        for i, src_path in enumerate(valid_images, 1):
            if src_path:
                # Get file extension from source
                _, ext = os.path.splitext(src_path)
                new_name = f"{self.theme}_BS{str(i).zfill(2)}{ext.lower()}"
                dst_path = os.path.join(target_dir, new_name)
                shutil.copy2(src_path, dst_path)
                print(f"Copied {src_path} to {dst_path}")

        # 2. Update layout file to include all scenes
        def create_scene_html(scene_num):
            return f"""
    <!-- Scene {scene_num} -->
    <div class="comic-panel">
        <div class="image-container">
            <img src="{{{{ '/data/Comics/{self.theme}_BS/{self.theme}_BS{str(scene_num).zfill(2)}.png' | relative_url }}}}" alt="Scene {scene_num}">
            <div class="text-overlays" data-image-id="{self.theme}_BS{str(scene_num).zfill(2)}">
            </div>
        </div>
    </div>"""

        # 3. Create JSON template with entries for all scenes
        def create_scene_json(scene_num):
            return {
                f"{self.theme}_BS{str(scene_num).zfill(2)}": {
                    "textbox1": {
                        "x": "50%",
                        "y": "50%",
                        "width": "auto",
                        "height": "auto",
                        "fontSize": "40px",
                        "backgroundColor": "rgba(0,0,0,0.02)",
                        "border": "2px solid black",
                        "text": {
                            "en": "[English text]",
                            "zh-hant": "[Chinese text]",
                            "ja": "[Japanese text]",
                            "es": "[Spanish text]",
                            "fr": "[French text]",
                            "th": "[Thai text]"
                        }
                    }
                }
            }

        # Update the layout creation method
        self.scenes_html = "\n".join(create_scene_html(i) for i in range(1, num_images + 1))
        
        # Update the JSON template creation method
        self.json_scenes = {}
        for i in range(1, num_images + 1):
            self.json_scenes.update(create_scene_json(i))

#------------------------------------------------------------------

    def create_post(self):
        """Execute all steps to create the post"""
        self.create_directory_structure()
        self.handle_images()
        self.create_layout_file()
        self.create_post_file()
        self.create_json_template()
        self.update_lang_display()
        print(f"Created post structure for {self.theme}")
        print(f"Don't forget to:")
        print("1. Add your images to the created directory")
        print("2. Update the text content in the JSON file")
        print("3. Fill in the character details in the HTML template")

#------------------------------------------------------------------

# Manual configuration
if __name__ == "__main__":

    creator = PostCreator(THEME, IS_NEW_CHARACTER)
    creator.create_post() 