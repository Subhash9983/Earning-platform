import re

def move_featured_projects():
    file_path = r"c:\Users\aranw\OneDrive\Desktop\student\src\pages\StudentProfile.jsx"
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()

    start_idx = text.find("{/* Featured Projects */}")
    
    end_pattern = "           </div>\n        </div>\n      </div>"
    end_idx = text.find(end_pattern, start_idx)
    
    featured_projects_block = text[start_idx:end_idx]
    
    if not featured_projects_block.strip():
        print("Failed to extract block.")
        return

    text_without_featured = text[:start_idx] + text[end_idx:]

    # The Left Column ends right before the Right Column marker
    target_insert_pattern = "           {/* Right Column (Resume, Work History, Projects) */}"
    insert_idx = text_without_featured.find(target_insert_pattern)

    final_text = text_without_featured[:insert_idx] + featured_projects_block + "\n" + text_without_featured[insert_idx:]

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(final_text)

    print("Success")

if __name__ == "__main__":
    move_featured_projects()
