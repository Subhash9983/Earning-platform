import re

def move_activity():
    file_path = r"c:\Users\aranw\OneDrive\Desktop\student\src\pages\StudentDashboard.jsx"
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()

    # Find start of Recent Activity
    start_str = "             {/* Recent Activity */}"
    start_idx = text.find(start_str)
    
    # It ends before "          </div>\n\n        </div>\n      </div>"
    end_str = "          </div>\n\n        </div>\n      </div>"
    end_idx = text.find(end_str, start_idx)
    
    activity_block = text[start_idx:end_idx]
    
    # Remove it from right column
    text = text[:start_idx] + text[end_idx:]
    
    # Insert at bottom of Left Column
    # Left column ends right before "          {/* Right Column */}"
    target = "          {/* Right Column */}"
    insert_idx = text.find(target)
    
    # But wait! Left column div ends with:
    # 252:                     </div>
    # 253:                  )}
    # 254:              </div>
    # 255:           </div>
    # We want to insert ABOVE line 255
    target_str = "          </div>\n\n          {/* Right Column */}"
    insert_idx = text.find(target_str)
    
    final_text = text[:insert_idx] + activity_block + "\n" + text[insert_idx:]
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(final_text)
        
    print("Activity Moved")

if __name__ == "__main__":
    move_activity()
