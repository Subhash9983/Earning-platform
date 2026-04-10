import re

def fix_divs():
    file_path = r"c:\Users\aranw\OneDrive\Desktop\student\src\pages\StudentProfile.jsx"
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()

    # 1. Remove the closing div above Featured Projects.
    # Current:
    # 632:               </div>
    # 633:            </div>
    # 634: 
    # 635: {/* Featured Projects */}
    text = text.replace("              </div>\n           </div>\n\n{/* Featured Projects */}", "              </div>\n\n{/* Featured Projects */}")

    # Ensure it's correctly replaced, just using regex for whitespace safety:
    text = re.sub(r'              </div>\s+</div>\s+\{/\* Featured Projects', r'              </div>\n\n{/* Featured Projects', text)

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(text)

    print("Divs fixed")

if __name__ == "__main__":
    fix_divs()
