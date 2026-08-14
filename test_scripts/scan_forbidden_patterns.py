import os
import re

FRONT_SRC = r"C:\Users\Dell\Documents\Raquel e Mirtes\front\src"

PATTERNS = {
    # Forbidden mock identifiers / constants
    "MOCK_LAWYERS": re.compile(r"\bMOCK_LAWYERS\b"),
    "INITIAL_JOBS": re.compile(r"\bINITIAL_JOBS\b"),
    "INITIAL_PROPOSALS": re.compile(r"\bINITIAL_PROPOSALS\b"),
    "INITIAL_CONTRACTS": re.compile(r"\bINITIAL_CONTRACTS\b"),
    "INITIAL_PAYMENTS": re.compile(r"\bINITIAL_PAYMENTS\b"),
    "INITIAL_CHAT_CONVERSATIONS": re.compile(r"\bINITIAL_CHAT_CONVERSATIONS\b"),
    "INITIAL_CHAT_MESSAGES": re.compile(r"\bINITIAL_CHAT_MESSAGES\b"),
    "INITIAL_DOCUMENTS": re.compile(r"\bINITIAL_DOCUMENTS\b"),
    "INITIAL_NOTIFICATIONS": re.compile(r"\bINITIAL_NOTIFICATIONS\b"),
    "MOCK_DASHBOARD_METRICS": re.compile(r"\bMOCK_DASHBOARD_METRICS\b"),
    
    # Specific Mock IDs
    "conv_501": re.compile(r"conv_501"),
    "job_101": re.compile(r"job_101"),
    "cli_1": re.compile(r"cli_1"),
    "prop_201": re.compile(r"prop_201"),
    
    # Specific Mock Names / Slugs
    "dr-rodrigo-silveira": re.compile(r"dr-rodrigo-silveira|rodrigo[ -]silveira", re.IGNORECASE),
    "dra-camila-santos": re.compile(r"dra-camila-santos|camila[ -]santos", re.IGNORECASE),
    "dr-fernando-viana": re.compile(r"dr-fernando-viana|fernando[ -]viana", re.IGNORECASE),
    "TechCorp Soluções": re.compile(r"TechCorp Soluções|TechCorp Brasil|TechCorp", re.IGNORECASE),
    
    # Unsplash image URLs
    "images.unsplash.com": re.compile(r"images\.unsplash\.com|unsplash\.com", re.IGNORECASE),
}

def scan():
    results = {k: [] for k in PATTERNS}
    total_files = 0
    
    for root, _, files in os.walk(FRONT_SRC):
        for file in files:
            if not (file.endswith(".ts") or file.endswith(".tsx") or file.endswith(".js") or file.endswith(".jsx") or file.endswith(".json") or file.endswith(".css")):
                continue
            total_files += 1
            file_path = os.path.join(root, file)
            rel_path = os.path.relpath(file_path, FRONT_SRC)
            
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                lines = f.readlines()
                
            for line_no, line in enumerate(lines, start=1):
                for pattern_name, pattern_regex in PATTERNS.items():
                    if pattern_regex.search(line):
                        results[pattern_name].append({
                            "file": rel_path,
                            "line": line_no,
                            "content": line.strip()
                        })

    print(f"Scanned {total_files} files in {FRONT_SRC}")
    print("=" * 80)
    
    total_matches = 0
    for pattern_name, matches in results.items():
        print(f"Pattern '{pattern_name}': {len(matches)} match(es)")
        total_matches += len(matches)
        for m in matches:
            print(f"  [{m['file']}:{m['line']}] {m['content']}")
            
    print("=" * 80)
    print(f"TOTAL MATCHES: {total_matches}")

if __name__ == "__main__":
    scan()
