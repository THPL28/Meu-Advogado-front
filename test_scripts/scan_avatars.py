import os
import re

FRONT_SRC = r"C:\Users\Dell\Documents\Raquel e Mirtes\front\src"
IMG_REGEX = re.compile(r"<img[^>]*>", re.IGNORECASE)
AVATAR_REGEX = re.compile(r"avatar|avatarUrl|profilePicture|photo", re.IGNORECASE)

def scan_avatars():
    matches = []
    for root, _, files in os.walk(FRONT_SRC):
        for file in files:
            if not (file.endswith(".ts") or file.endswith(".tsx")):
                continue
            path = os.path.join(root, file)
            rel = os.path.relpath(path, FRONT_SRC)
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                lines = f.readlines()
            for line_no, line in enumerate(lines, 1):
                if IMG_REGEX.search(line) or AVATAR_REGEX.search(line):
                    matches.append((rel, line_no, line.strip()))
                    
    print(f"Found {len(matches)} avatar/img occurrences:")
    for rel, line_no, line in matches:
        print(f"  [{rel}:{line_no}] {line}")

if __name__ == "__main__":
    scan_avatars()
