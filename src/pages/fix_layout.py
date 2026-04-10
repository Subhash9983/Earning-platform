import re

def fix_featured_projects():
    file_path = r"c:\Users\aranw\OneDrive\Desktop\student\src\pages\StudentProfile.jsx"
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()

    # Move the closing div of Left Column from ABOVE Featured Projects to BELOW Featured Projects
    # Current text structure:
    #                     <p className='text-xs text-gray-500 font-medium' style={{ color: 'var(--c-muted)' }}>Start working to build reliability</p>
    #                  </div>
    #               )}
    #            </div>
    #         </div>
    # 
    # {/* Featured Projects */}

    # we will replace:
    bad_part = """               </div>
            </div>

{/* Featured Projects */}"""

    good_part = """               </div>

{/* Featured Projects */}"""

    text = text.replace(bad_part, good_part)

    # And we need to add the closing div below it:
    #               </div>
    # 
    # 
    #            {/* Right Column (Resume, Work History, Projects) */}
    
    bad_part2 = """              </div>


           {/* Right Column (Resume, Work History, Projects) */}"""

    good_part2 = """              </div>
           </div>

           {/* Right Column (Resume, Work History, Projects) */}"""

    text = text.replace(bad_part2, good_part2)

    # Make the grid 1 column since it's now in the narrow left column
    text = text.replace("grid grid-cols-1 sm:grid-cols-2 gap-4", "grid grid-cols-1 gap-4")

    # In case there's another occurrence in work proof:
    # Work proof has: <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'> -> Keep this alone.

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(text)

    print("Fixed layout")

if __name__ == "__main__":
    fix_featured_projects()
