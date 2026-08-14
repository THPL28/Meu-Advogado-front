import os
import re

FRONT_SRC = r"C:\Users\Dell\Documents\Raquel e Mirtes\front\src"

QUERIES = [
    r"MOCK_LAWYERS",
    r"INITIAL_JOBS",
    r"INITIAL_PROPOSALS",
    r"INITIAL_CONTRACTS",
    r"INITIAL_PAYMENTS",
    r"INITIAL_CHAT_CONVERSATIONS",
    r"INITIAL_CHAT_MESSAGES",
    r"INITIAL_DOCUMENTS",
    r"INITIAL_NOTIFICATIONS",
    r"MOCK_DASHBOARD_METRICS",
    r"conv_501",
    r"job_101",
    r"cli_1",
    r"prop_201",
    r"rodrigo[\-_ ]silveira",
    r"camila[\-_ ]santos",
    r"fernando[\-_ ]viana",
    r"techcorp",
    r"unsplash",
]

def detailed_search():
    results = {q: [] for q in QUERIES}
    
    for root, _, files in os.walk(FRONT_SRC):
        for file in files:
            path = os.path.join(root, file)
            rel = os.path.relpath(path, FRONT_SRC)
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
                
            for q in QUERIES:
                rx = re.compile(q, re.IGNORECASE)
                for m in rx.finditer(content):
                    # compute line number
                    start = m.start()
                    line_no = content[:start].count("\n") + 1
                    line_str = content.splitlines()[line_no - 1]
                    results[q].append({
                        "file": rel,
                        "line": line_no,
                        "match": m.group(0),
                        "snippet": line_str.strip()
                    })
                    
    print("DETAILED SCAN RESULTS:")
    print("=" * 80)
    for q, matches in results.items():
        print(f"\n[Pattern: {q}] => {len(matches)} match(es)")
        for item in matches:
            print(f"  {item['file']}:{item['line']} -> {item['snippet']}")
    print("=" * 80)

if __name__ == "__main__":
    detailed_search()
