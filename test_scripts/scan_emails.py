import os
import re

FRONT_SRC = r"C:\Users\Dell\Documents\Raquel e Mirtes\front\src"
EMAIL_REGEX = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")

def scan_emails():
    matches = []
    for root, _, files in os.walk(FRONT_SRC):
        for file in files:
            if not (file.endswith(".ts") or file.endswith(".tsx")):
                continue
            path = os.path.join(root, file)
            rel = os.path.relpath(path, FRONT_SRC)
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                for line_no, line in enumerate(f, 1):
                    # Ignore comment lines if pure comment, but show all found emails
                    found = EMAIL_REGEX.findall(line)
                    if found:
                        matches.append((rel, line_no, found, line.strip()))
                        
    print(f"Found {len(matches)} hardcoded email occurrences across front/src:")
    for rel, line_no, emails, line in matches:
        print(f"  [{rel}:{line_no}] {emails} -> {line}")

if __name__ == "__main__":
    scan_emails()
