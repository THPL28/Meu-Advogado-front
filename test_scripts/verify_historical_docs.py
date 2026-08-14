import os
import sys
import glob
import re

sys.stdout.reconfigure(encoding='utf-8')
ROOT = r"c:\Users\Dell\Documents\Raquel e Mirtes"

def search_historical_docs():
    print("="*80)
    print("HISTORICAL DOCUMENTATION AUDIT FOR DIVERGENCES")
    print("="*80)
    
    doc_paths = glob.glob(os.path.join(ROOT, "docs", "handoff", "*.md")) + \
                glob.glob(os.path.join(ROOT, "docs", "progress", "*.md")) + \
                glob.glob(os.path.join(ROOT, "Regras de negócio", "*.md"))
                
    keywords = {
        "D-01 (Escrow / PIX)": ["escrow", "pix", "saque", "custódia", "pagamento"],
        "D-02 (Sigilo / Jobs)": ["sigilo", "confidencial", "jobs", "whitelist", "demanda"],
        "D-03 (Enums / Estados)": ["enum", "status", "submitted", "in_review", "disputed", "paid"],
        "D-04 (JobType)": ["jobtype", "hourly", "fixed", "remuneração", "especialidade"],
        "D-05 (Troca de Papel / Navbar)": ["perfil", "alternância", "role", "advogado", "cliente"],
        "D-06 (IA / 85% Êxito)": ["inteligência artificial", "ia", "gemini", "êxito", "probabilidade"],
        "D-07 (Documentos / Upload)": ["document", "upload", "procuração", "anexo"],
        "D-08 (Escritórios / lawyer_firms)": ["lawfirm", "escritório", "sócio", "advogado", "lawyer_firms"],
        "D-09 (Reviews / Blind)": ["review", "avaliação", "reputação", "blind"],
        "D-10 (Atomicidade Contrato)": ["contrato", "aceite", "proposta", "transação", "atômico"]
    }
    
    for topic, kw_list in keywords.items():
        print(f"\n--- Checking {topic} in Historical Docs ---")
        found_count = 0
        for dp in doc_paths:
            fname = os.path.relpath(dp, ROOT)
            with open(dp, "r", encoding="utf-8", errors="ignore") as f:
                text = f.read()
            matches = [kw for kw in kw_list if kw.lower() in text.lower()]
            if len(matches) >= 2:
                found_count += 1
                print(f"  Found in {fname} (matched: {', '.join(matches[:4])})")
        print(f"  Total historical files referencing topic: {found_count}")

if __name__ == "__main__":
    search_historical_docs()
