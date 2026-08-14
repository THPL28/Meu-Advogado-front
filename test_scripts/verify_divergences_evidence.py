import os
import sys
import re
import glob

sys.stdout.reconfigure(encoding='utf-8')

ROOT = r"c:\Users\Dell\Documents\Raquel e Mirtes"

def verify_divergences_deep():
    print("="*80)
    print("DETAILED EVIDENCE EXTRACTION FOR D-01 TO D-10")
    print("="*80)
    
    # D-01: AddBalanceModal.tsx / PayoutModal.tsx
    ab_path = os.path.join(ROOT, "front", "components", "AddBalanceModal.tsx")
    if os.path.exists(ab_path):
        with open(ab_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
        for idx, l in enumerate(lines, 1):
            if "localStorage" in l or "pix" in l.lower() or "balance" in l.lower():
                if any(k in l for k in ["setItem", "getItem", "qr", "payload", "00020126", "pixKey"]):
                    print(f"[D-01 Evidence] AddBalanceModal.tsx:{idx}: {l.strip()}")
                    
    po_path = os.path.join(ROOT, "front", "components", "PayoutModal.tsx")
    if os.path.exists(po_path):
        with open(po_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
        for idx, l in enumerate(lines, 1):
            if "localStorage" in l or "payout" in l.lower() or "pix" in l.lower():
                if any(k in l for k in ["setItem", "getItem", "balance", "sucesso", "withdraw"]):
                    print(f"[D-01 Evidence] PayoutModal.tsx:{idx}: {l.strip()}")

    # D-02: SecurityConfig.java
    sc_path = os.path.join(ROOT, "upwork-clone", "src", "main", "java", "com", "activecourses", "upwork", "config", "security", "SecurityConfig.java")
    with open(sc_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    for idx, l in enumerate(lines, 1):
        if any(p in l for p in ["/api/jobs", "/api/users/profile", "AUTH_WHITELIST"]):
            print(f"[D-02 Evidence] SecurityConfig.java:{idx}: {l.strip()}")

    # D-03: Enums
    model_dir = os.path.join(ROOT, "upwork-clone", "src", "main", "java", "com", "activecourses", "upwork", "model")
    for en in ["JobStatus.java", "ProposalStatus.java", "ContractStatus.java", "MilestoneStatus.java", "PaymentStatus.java"]:
        with open(os.path.join(model_dir, en), "r", encoding="utf-8") as f:
            content = f.read().replace("\n", " ")
        print(f"[D-03 Evidence] {en}: {content.strip()}")

    # D-04: JobType vs Specialty
    with open(os.path.join(model_dir, "JobType.java"), "r", encoding="utf-8") as f:
        print(f"[D-04 Evidence Backend] JobType.java: {f.read().strip()}")
    front_types = os.path.join(ROOT, "front", "types.ts")
    if os.path.exists(front_types):
        with open(front_types, "r", encoding="utf-8") as f:
            c = f.read()
        match = re.search(r'type\s+JobType\s*=.*?;', c, re.DOTALL)
        if match:
            print(f"[D-04 Evidence Frontend] types.ts JobType: {match.group(0)}")
        else:
            for fp in glob.glob(os.path.join(ROOT, "front", "src", "**", "*.ts*"), recursive=True):
                with open(fp, "r", encoding="utf-8") as f:
                    c2 = f.read()
                m2 = re.search(r'enum\s+JobType\s*\{[^\}]+\}|type\s+JobType\s*=[^;]+;', c2)
                if m2:
                    print(f"[D-04 Evidence Frontend] {os.path.basename(fp)}: {m2.group(0)}")

    # D-05: Role switching in Navbar
    nav_path = os.path.join(ROOT, "front", "components", "Navbar.tsx")
    if os.path.exists(nav_path):
        with open(nav_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
        for idx, l in enumerate(lines, 1):
            if "switch" in l.lower() or "role" in l.lower() or ("client" in l.lower() and "lawyer" in l.lower()):
                if "setUserRole" in l or "localStorage" in l or "toggle" in l.lower() or "onClick" in l:
                    print(f"[D-05 Evidence] Navbar.tsx:{idx}: {l.strip()}")

    # D-06: AI Assistant 85%
    ai_path = os.path.join(ROOT, "front", "components", "LegalAiAssistantModal.tsx")
    if os.path.exists(ai_path):
        with open(ai_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
        for idx, l in enumerate(lines, 1):
            if "85%" in l or "85" in l or "probabilidade" in l.lower() or "êxito" in l.lower():
                print(f"[D-06 Evidence] LegalAiAssistantModal.tsx:{idx}: {l.strip()}")

    # D-07: Documents API
    for fp in glob.glob(os.path.join(ROOT, "front", "**", "*document*.ts*"), recursive=True):
        if "api" in fp.lower() or "service" in fp.lower() or "documents" in fp.lower():
            with open(fp, "r", encoding="utf-8") as f:
                snippet = f.read()[:400].replace("\n", " ")
            print(f"[D-07 Evidence] {os.path.relpath(fp, ROOT)}:\n  {snippet}")

    # D-08: lawyer_firms missing
    lf_service = os.path.join(ROOT, "upwork-clone", "src", "main", "java", "com", "activecourses", "upwork", "service", "firm", "LawFirmServiceImpl.java")
    with open(lf_service, "r", encoding="utf-8") as f:
        lines = f.readlines()
    for idx, l in enumerate(lines, 1):
        if "lawyer_firms" in l:
            print(f"[D-08 Evidence] LawFirmServiceImpl.java:{idx}: {l.strip()}")

    # D-09: Review immediate publication
    rev_service = os.path.join(ROOT, "upwork-clone", "src", "main", "java", "com", "activecourses", "upwork", "service", "review", "ReviewServiceImpl.java")
    if os.path.exists(rev_service):
        with open(rev_service, "r", encoding="utf-8") as f:
            lines = f.readlines()
        for idx, l in enumerate(lines, 1):
            if "save" in l or "status" in l or "publish" in l or "reviewRepository" in l:
                print(f"[D-09 Evidence] ReviewServiceImpl.java:{idx}: {l.strip()}")

    # D-10: Accept proposal vs Create Contract
    prop_ctrl = os.path.join(ROOT, "upwork-clone", "src", "main", "java", "com", "activecourses", "upwork", "controller", "proposal", "ProposalController.java")
    with open(prop_ctrl, "r", encoding="utf-8") as f:
        lines = f.readlines()
    for idx, l in enumerate(lines, 1):
        if "accept" in l.lower():
            print(f"[D-10 Evidence] ProposalController.java:{idx}: {l.strip()}")
            
    cont_ctrl = os.path.join(ROOT, "upwork-clone", "src", "main", "java", "com", "activecourses", "upwork", "controller", "contract", "ContractController.java")
    with open(cont_ctrl, "r", encoding="utf-8") as f:
        lines = f.readlines()
    for idx, l in enumerate(lines, 1):
        if "create" in l.lower():
            print(f"[D-10 Evidence] ContractController.java:{idx}: {l.strip()}")

if __name__ == "__main__":
    verify_divergences_deep()
