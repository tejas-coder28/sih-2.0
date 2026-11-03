import os

def update_file(path, replacements):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    initial = content
    for target, replacement in replacements:
        if target not in content:
            print(f"WARNING: Target not found in {path}: {target[:50]}...")
        else:
            content = content.replace(target, replacement)
    
    if content != initial:
        with open(path, 'w', encoding='utf-8', newline='') as f:
            f.write(content)
        print(f"Updated {path}")
    else:
        print(f"No changes in {path}")

# 1. AuditAndReceiptsPage.jsx
update_file('frontend/src/pages/AuditAndReceiptsPage.jsx', [
    (
        "<span>Ed25519 Signed: {receipt.ed25519_signature ? `${receipt.ed25519_signature.slice(0, 14)}...` : 'Valid'}</span>",
        "<span>Ed25519 Signed: {receipt.ed25519_signature ? `${receipt.ed25519_signature.slice(0, 14)}...` : 'Valid'}</span>\n                          <span className=\"text-[9px] text-indigo-600 font-sans italic ml-1\">(byte-range inspection real, PKI chain validation stubbed)</span>"
    ),
    (
        "? 'bg-emerald-500 text-white border-emerald-400 animate-pulse'",
        "? 'bg-emerald-800 text-white border-emerald-700 animate-pulse'"
    ),
    (
        "? 'bg-emerald-500 text-white ring-4 ring-emerald-400/50 shadow-emerald-500/40 scale-102'",
        "? 'bg-emerald-700 text-white ring-4 ring-emerald-500/50 shadow-emerald-700/40 scale-102'"
    ),
    (
        ": 'bg-emerald-600 hover:bg-emerald-700 text-white'",
        ": 'bg-emerald-700 hover:bg-emerald-800 text-white'"
    ),
    (
        "? 'bg-emerald-600 text-white scale-105 shadow-emerald-500/30'",
        "? 'bg-emerald-700 text-white scale-105 shadow-emerald-700/30'"
    ),
    (
        ": 'bg-emerald-600 text-white shadow-emerald-500/20'",
        ": 'bg-emerald-700 text-white shadow-emerald-700/20'"
    ),
    (
        "? 'bg-emerald-600 text-white border-emerald-200 scale-105 shadow-emerald-500/30 ring-2 ring-emerald-400/40'",
        "? 'bg-emerald-700 text-white border-emerald-200 scale-105 shadow-emerald-700/30 ring-2 ring-emerald-500/40'"
    )
])

# 2. RuleConfigPage.jsx (Add visible footnote)
update_file('frontend/src/pages/RuleConfigPage.jsx', [
    (
        "      {/* \n        ============================================================\n        PUBLISH NEW RULE VERSION MODAL (CONFIRMATION REQUIRED)\n        ============================================================\n      */}",
        "      {/* Footnote on rule parameter placeholders */}\n      <div className=\"mt-8 pt-4 border-t border-border text-center text-xs text-text-muted\">\n        <p>\n          * <strong>Regulatory Note:</strong> Handbook parameter values are placeholders pending official AICTE sign-off.\n        </p>\n      </div>\n\n      {/* \n        ============================================================\n        PUBLISH NEW RULE VERSION MODAL (CONFIRMATION REQUIRED)\n        ============================================================\n      */}"
    )
])

# 3. DocumentForensicsView.jsx (Label synthetic benchmark)
update_file('frontend/src/components/DocumentForensicsView.jsx', [
    (
        '<span className="text-[10px] font-mono text-text-subtle">8 Curated Cases (F1: 1.0 @ 0.80)</span>',
        '<span className="text-[10px] font-mono text-text-subtle" title="Synthetic benchmark (tuned seed 42, tested seed 7), not field accuracy">8 Curated Cases (F1: 1.0 @ 0.80, synthetic benchmark)</span>'
    ),
    (
        '            <div className="bg-surface-2 p-2.5 rounded-xl border border-border">\n              <div className="text-[10px] text-text-subtle font-bold uppercase">False Positive Rate</div>\n              <div className="text-base font-bold text-text font-mono mt-0.5">0.0% @ 0.80</div>\n            </div>\n          </div>',
        '            <div className="bg-surface-2 p-2.5 rounded-xl border border-border">\n              <div className="text-[10px] text-text-subtle font-bold uppercase">False Positive Rate</div>\n              <div className="text-base font-bold text-text font-mono mt-0.5">0.0% @ 0.80</div>\n            </div>\n          </div>\n          <div className="text-[10px] text-text-muted mt-2 italic text-center">\n            * Synthetic benchmark (tuned seed 42, tested seed 7), not field accuracy.\n          </div>'
    )
])

# 4. LoginPage.jsx (Offline message)
update_file('frontend/src/pages/LoginPage.jsx', [
    (
        "      const detail = err.response?.data?.detail || err.message || 'Authentication failed. Please verify credentials.';\n      setErrorMessage(detail);",
        "      let detail = err.response?.data?.detail;\n      if (!detail) {\n        if (isOfflineOrDeploymentError) {\n          detail = 'Backend service is currently unreachable (offline). Please check that the API server is running on http://127.0.0.1:8000, or choose a demo role below.';\n        } else {\n          detail = err.message || 'Authentication failed. Please verify credentials.';\n        }\n      }\n      setErrorMessage(detail);"
    )
])

# 5. AlertBellDrawer.jsx
update_file('frontend/src/components/AlertBellDrawer.jsx', [
    (
        "? 'bg-amber-600 text-white border-amber-600'",
        "? 'bg-amber-900 text-amber-50 border-amber-800'"
    )
])

# 6. DocumentBoundingBoxViewer.jsx
update_file('frontend/src/components/DocumentBoundingBoxViewer.jsx', [
    (
        "bg-amber-600 text-white text-[9px] font-bold font-sans px-2 py-0.5 rounded shadow-sm flex items-center space-x-1 whitespace-nowrap z-20",
        "bg-amber-400 text-slate-950 text-[9px] font-bold font-sans px-2 py-0.5 rounded shadow-sm flex items-center space-x-1 whitespace-nowrap z-20"
    ),
    (
        '<span className="bg-amber-600 text-white px-1 rounded text-[8px]">',
        '<span className="bg-slate-900 text-amber-300 font-bold px-1 rounded text-[8px]">'
    )
])

# 7. PhotoComparisonPanel.jsx
update_file('frontend/src/components/PhotoComparisonPanel.jsx', [
    (
        '<span className="absolute -top-5 left-0 bg-amber-600 text-white text-[8px] font-mono px-1.5 py-0.2 rounded">',
        '<span className="absolute -top-5 left-0 bg-amber-400 text-slate-950 font-bold text-[8px] font-mono px-1.5 py-0.2 rounded shadow-xs">'
    )
])

# 8. PreFlightScorecard.jsx
update_file('frontend/src/components/PreFlightScorecard.jsx', [
    (
        "? 'bg-emerald-600 text-white'",
        "? 'bg-emerald-700 text-white'"
    )
])

# 9. index.css (--warning-text)
update_file('frontend/src/index.css', [
    (
        "  --warning: #B45309;\n  --warning-bg: #FDF1E1;\n  --warning-text: #B45309;",
        "  --warning: #92400E;\n  --warning-bg: #FDF1E1;\n  --warning-text: #92400E;"
    )
])

# 10. README.md & evaluation_report.md (speedup claims)
update_file('README.md', [
    (
        "- **Processing Turnaround**: 2.04s per dossier (5,289x acceleration vs. 180 min manual baseline)",
        "- **Processing Turnaround**: 2.04s per dossier (illustrative model, assumed baseline, not measured)"
    )
])

update_file('evaluation_report.md', [
    (
        "| **5289x Speedup** (180.0 min saved) |",
        "| **5289x Speedup (illustrative model, assumed baseline, not measured)** |"
    ),
    (
        "- **Speedup Factor:** **5289x Faster**",
        "- **Speedup Factor:** **5289x Faster (illustrative model, assumed baseline, not measured)**"
    )
])
