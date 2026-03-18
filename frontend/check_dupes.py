import re

with open(r'c:\Users\INTEL\Documents\arizonalex-repo\arizonalex\frontend\src\lib\countries-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract keys in photos object
photos_match = re.search(r'const photos: Record<string, string> = \{(.*?)\};', content, re.DOTALL)
if photos_match:
    photos_content = photos_match.group(1)
    keys = re.findall(r"'(.*?)':", photos_content)
    seen = set()
    dupes = [x for x in keys if x in seen or seen.add(x)]
    print(f"Duplicates: {dupes}")
else:
    print("Could not find photos object")
