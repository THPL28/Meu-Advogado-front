import os
import re

FRONT_SRC = r"C:\Users\Dell\Documents\Raquel e Mirtes\front\src"
IMPORT_REGEX = re.compile(r"from\s+['\"].*mock.*['\"]|require\(['\"].*mock.*['\"]\)", re.IGNORECASE)

def scan_mock_imports():
    matches = []
    for root, _, files in os.walk(FRONT_SRC):
        for file in files:
            if not (file.endswith(".ts") or file.endswith(".tsx")):
                continue
            path = os.path.join(root, file)
            rel = os.path.relpath(path, FRONT_SRC)
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                for line_no, line in enumerate(f, 1):
                    if IMPORT_REGEX.search(line):
                        matches.append((rel, line_no, line.strip()))
                        
    print(f"Found {len(matches)} mock imports across front/src:")
    for rel, line_no, line in matches:
        print(f"  [{rel}:{line_no}] {line}")

if __name__ == "__main__":
    scan_mock_imports()
