import os
import re

FRONT_SRC = r"C:\Users\Dell\Documents\Raquel e Mirtes\front\src"

PATTERNS = {
    "rodrigo": re.compile(r"rodrigo", re.IGNORECASE),
    "camila": re.compile(r"camila", re.IGNORECASE),
    "fernando": re.compile(r"fernando", re.IGNORECASE),
    "viana": re.compile(r"viana", re.IGNORECASE),
    "silveira": re.compile(r"silveira", re.IGNORECASE),
    "techcorp": re.compile(r"techcorp", re.IGNORECASE),
    "unsplash": re.compile(r"unsplash", re.IGNORECASE),
    "conv_501": re.compile(r"conv_501", re.IGNORECASE),
    "job_101": re.compile(r"job_101", re.IGNORECASE),
    "cli_1": re.compile(r"cli_1", re.IGNORECASE),
    "prop_201": re.compile(r"prop_201", re.IGNORECASE),
}

def scan_all():
    findings = {k: [] for k in PATTERNS}
    for root, _, files in os.walk(FRONT_SRC):
        for file in files:
            path = os.path.join(root, file)
            rel = os.path.relpath(path, FRONT_SRC)
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                for line_no, line in enumerate(f, 1):
                    for k, pat in PATTERNS.items():
                        if pat.search(line):
                            findings[k].append({
                                "file": rel,
                                "line": line_no,
                                "text": line.strip()
                            })
                            
    print("COMPREHENSIVE ADVERSARIAL SCAN RESULTS:")
    print("=" * 80)
    for k, matches in findings.items():
        print(f"\nPattern '{k}': {len(matches)} match(es)")
        for m in matches:
            print(f"  [{m['file']}:{m['line']}] {m['text']}")
    print("=" * 80)

if __name__ == "__main__":
    scan_all()
