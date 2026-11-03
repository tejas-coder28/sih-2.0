#!/usr/bin/env python3
"""
PRAMAAN-X Production & Staging Deployment Smoke Test Suite

Usage:
    python tools/deploy_smoke.py [BACKEND_URL] [--frontend-url FRONTEND_URL] [--skip-browser]

Examples:
    python tools/deploy_smoke.py http://127.0.0.1:8000
    python tools/deploy_smoke.py https://pramaan-backend.onrender.com --frontend-url https://pramaan-frontend.vercel.app
"""

import os
import sys
try:
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    if hasattr(sys.stderr, 'reconfigure'):
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass
import json
import argparse
import subprocess
from pathlib import Path
import urllib.request
import urllib.error
import urllib.parse

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent
DEFAULT_SAMPLE_PDF = REPO_ROOT / "audit_fixtures" / "live_test_digital.pdf"
import tempfile
DEFAULT_SCREENSHOTS_DIR = None

DEMO_ROLES = [
    ("scrutiny_officer", "scrutiny.officer@aicte-india.org", "AicteOfficer@2025"),
    ("senior_officer", "senior.officer@aicte-india.org", "AicteSenior@2025"),
    ("admin", "admin@aicte-india.org", "AicteAdmin@2025"),
    ("auditor", "auditor@aicte-india.org", "AicteAuditor@2025"),
    ("institution_user", "registrar@apextech.edu.in", "ApexPass@2025"),
]


def make_request(url, method="GET", headers=None, data=None, timeout=30):
    """Executes HTTP request and returns (status_code, response_data, headers, error_msg)."""
    headers = headers or {}
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            content = resp.read().decode("utf-8", errors="replace")
            try:
                parsed = json.loads(content)
            except Exception:
                parsed = content
            return resp.status, parsed, resp.headers, None
    except urllib.error.HTTPError as e:
        err_content = e.read().decode("utf-8", errors="replace")
        try:
            parsed = json.loads(err_content)
        except Exception:
            parsed = err_content
        return e.code, parsed, e.headers, str(e)
    except Exception as e:
        return 0, None, {}, str(e)


def upload_multipart_pdf(url, file_path, headers=None, timeout=30):
    """Performs multipart/form-data upload of a PDF file using standard library."""
    headers = headers or {}
    boundary = "----PramaanSmokeBoundary" + os.urandom(16).hex()
    headers["Content-Type"] = f"multipart/form-data; boundary={boundary}"

    filename = Path(file_path).name
    with open(file_path, "rb") as f:
        file_bytes = f.read()

    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'
        f"Content-Type: application/pdf\r\n\r\n"
    ).encode("utf-8") + file_bytes + f"\r\n--{boundary}--\r\n".encode("utf-8")

    req = urllib.request.Request(url, data=body, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            content = resp.read().decode("utf-8", errors="replace")
            try:
                parsed = json.loads(content)
            except Exception:
                parsed = content
            return resp.status, parsed, None
    except urllib.error.HTTPError as e:
        err_content = e.read().decode("utf-8", errors="replace")
        try:
            parsed = json.loads(err_content)
        except Exception:
            parsed = err_content
        return e.code, parsed, str(e)
    except Exception as e:
        return 0, None, str(e)


def run_smoke_tests(backend_url, frontend_url, skip_browser=False, screenshots_dir=None):
    backend_url = backend_url.rstrip("/")
    frontend_url = frontend_url.rstrip("/")
    print("=" * 75)
    print(" ⚡ PRAMAAN-X DEPLOYMENT SMOKE TEST RUNNER")
    print(f"    Backend URL  : {backend_url}")
    print(f"    Frontend URL : {frontend_url}")
    print("=" * 75)

    all_passed = True
    summary_results = []

    # ------------------------------------------------------------------------
    # 1. DEEP HEALTH CHECK
    # ------------------------------------------------------------------------
    print("\n[1/4] Running Deep Health Check...")
    health_url = f"{backend_url}/health"
    status, body, _, err = make_request(health_url)
    health_pass = (status == 200 and isinstance(body, dict) and body.get("status") in ("HEALTHY", "DEGRADED", "OK"))
    if health_pass:
        db_stat = body.get("db", "CONNECTED")
        mock_stat = body.get("mock_issuer", "CONNECTED")
        deg_reason = body.get("reason")
        print(f"  ✅ [PASS] GET /health (Status {status})")
        print(f"     Database: {db_stat} ({body.get('database_engine', 'SQLite')})")
        print(f"     Mock Issuer Gateway: {mock_stat}")
        if deg_reason:
            print(f"     Notice: State is DEGRADED ({deg_reason})")
        summary_results.append(("Deep Health Check (/health)", "PASS", f"HTTP {status} - {body.get('status')}"))
    else:
        print(f"  ❌ [FAIL] GET /health (Status {status}): {err or body}")
        all_passed = False
        summary_results.append(("Deep Health Check (/health)", "FAIL", f"HTTP {status} - {err or body}"))

    # ------------------------------------------------------------------------
    # 2. AUTHENTICATION & ROLE TOKENS (ALL 5 DEMO ROLES)
    # ------------------------------------------------------------------------
    print("\n[2/4] Testing Authentication for all 5 Demo Roles...")
    tokens = {}
    for role_name, email, password in DEMO_ROLES:
        login_url = f"{backend_url}/api/v1/auth/login"
        payload = json.dumps({"email": email, "password": password}).encode("utf-8")
        status, body, _, err = make_request(login_url, method="POST", headers={"Content-Type": "application/json"}, data=payload)
        
        if status == 200 and isinstance(body, dict) and "access_token" in body:
            token = body["access_token"]
            tokens[role_name] = token
            actual_role = body.get("user", {}).get("role")
            print(f"  ✅ [PASS] Login {role_name:<18} ({email}) -> Token OK (role={actual_role})")
            summary_results.append((f"Login Role: {role_name}", "PASS", f"HTTP 200 (Token issued)"))
        else:
            print(f"  ❌ [FAIL] Login {role_name:<18} ({email}) -> Status {status}: {err or body}")
            all_passed = False
            summary_results.append((f"Login Role: {role_name}", "FAIL", f"HTTP {status}: {err or body}"))

    officer_token = tokens.get("scrutiny_officer")
    officer_headers = {"Authorization": f"Bearer {officer_token}"} if officer_token else {}

    # ------------------------------------------------------------------------
    # 3. SCREEN MAIN ENDPOINTS
    # ------------------------------------------------------------------------
    print("\n[3/4] Verifying Main Endpoints for Every Application Screen...")
    screen_endpoints = [
        ("Dashboard (Applications List)", "GET", f"{backend_url}/api/v1/applications", None, False),
        ("Manual Review Queue", "GET", f"{backend_url}/api/v1/verification/connector/manual-review-queue", None, False),
        ("Evidence Lens (App #1)", "GET", f"{backend_url}/api/v1/applications/1/evidence-lens", None, False),
        ("Photo Radar Registry", "GET", f"{backend_url}/api/v1/forensics/photo-radar/registry", None, False),
        ("Impossibility Engine Graph", "GET", f"{backend_url}/api/v1/graph", None, False),
        ("Audit Verify Ledger Chain", "GET", f"{backend_url}/api/v1/audit/verify-chain", None, False),
        ("Regulation-as-Code Rules", "GET", f"{backend_url}/api/v1/rules", None, False),
        ("Pre-Flight Readiness Scan", "POST", f"{backend_url}/api/v1/applications/1/preflight", b"", False),
    ]

    for screen_name, method, url, payload, _ in screen_endpoints:
        status, body, resp_headers, err = make_request(url, method=method, headers=officer_headers, data=payload)
        
        # Validation rules per endpoint
        if status == 200:
            extra_info = ""
            if "manual-review-queue" in url:
                issuer_down = False
                if isinstance(body, list):
                    issuer_down = any(i.get("issuer_unavailable") for i in body)
                    extra_info = f" ({len(body)} queued items, issuer_down={issuer_down})"
                elif isinstance(body, dict):
                    issuer_down = body.get("issuer_unavailable", False)
                    extra_info = f" ({len(body.get('items', []))} items, issuer_down={issuer_down})"
            elif isinstance(body, list):
                extra_info = f" ({len(body)} records returned)"
            elif isinstance(body, dict):
                extra_info = f" ({len(body.keys())} keys)"
                
            print(f"  ✅ [PASS] {screen_name:<30} -> HTTP 200{extra_info}")
            summary_results.append((f"Screen: {screen_name}", "PASS", f"HTTP 200{extra_info}"))
        else:
            print(f"  ❌ [FAIL] {screen_name:<30} -> HTTP {status}: {err or body}")
            all_passed = False
            summary_results.append((f"Screen: {screen_name}", "FAIL", f"HTTP {status}: {err or body}"))

    # Document Ingest with sample PDF
    print("\n   Testing Document Ingest Endpoint with Statutory PDF...")
    sample_pdf = DEFAULT_SAMPLE_PDF
    if not sample_pdf.exists():
        # Fallback to any PDF in uploads or audit_fixtures
        candidates = list(REPO_ROOT.glob("uploads/**/*.pdf")) + list(REPO_ROOT.glob("audit_fixtures/**/*.pdf"))
        sample_pdf = candidates[0] if candidates else None

    if sample_pdf and sample_pdf.exists():
        ingest_url = f"{backend_url}/api/v1/documents/ingest"
        ingest_status, ingest_body, ingest_err = upload_multipart_pdf(ingest_url, sample_pdf, headers=officer_headers)
        if ingest_status in (200, 201):
            extracted_fields = ingest_body.get("extracted_fields", {}) if isinstance(ingest_body, dict) else {}
            print(f"  ✅ [PASS] Document Ingest ({sample_pdf.name}) -> HTTP {ingest_status} ({len(extracted_fields)} fields parsed)")
            summary_results.append(("Screen: Document Ingestion", "PASS", f"HTTP {ingest_status} ({sample_pdf.name})"))
        else:
            print(f"  ❌ [FAIL] Document Ingest ({sample_pdf.name}) -> HTTP {ingest_status}: {ingest_err or ingest_body}")
            all_passed = False
            summary_results.append(("Screen: Document Ingestion", "FAIL", f"HTTP {ingest_status}: {ingest_err or ingest_body}"))
    else:
        print("  ⚠️ [SKIP] Document Ingest: sample PDF not found on disk.")
        summary_results.append(("Screen: Document Ingestion", "SKIP", "Sample PDF fixture not found"))

    # ------------------------------------------------------------------------
    # 4. HEADLESS BROWSER UI VERIFICATION (EVERY SIDEBAR PAGE)
    # ------------------------------------------------------------------------
    if skip_browser:
        print("\n[4/4] Skipping Headless Browser Verification (--skip-browser enabled).")
    else:
        print(f"\n[4/4] Launching Headless Chrome to inspect {frontend_url}...")
        browser_script = SCRIPT_DIR / "browser_smoke.cjs"
        if not browser_script.exists():
            print(f"  ❌ [FAIL] Browser runner script '{browser_script}' not found.")
            all_passed = False
            summary_results.append(("Headless Browser Smoke", "FAIL", "browser_smoke.cjs not found"))
        else:
            try:
                if not screenshots_dir:
                    screenshots_dir = tempfile.mkdtemp(prefix="smoke_shots_")
                cmd = ["node", str(browser_script), frontend_url, str(screenshots_dir)]
                proc = subprocess.run(cmd, capture_output=True, text=True, timeout=90)
                
                browser_data = {}
                try:
                    browser_data = json.loads(proc.stdout.strip())
                except Exception:
                    # Search for JSON block in stdout
                    for line in proc.stdout.splitlines():
                        if line.strip().startswith("{"):
                            try:
                                browser_data = json.loads(line)
                                break
                            except Exception:
                                pass

                login_res = browser_data.get("login", {})
                if login_res.get("status") == "PASS":
                    print(f"  ✅ [PASS] Frontend Officer Login ({login_res.get('user')})")
                    summary_results.append(("UI Login: Scrutiny Officer", "PASS", "Interactive login successful"))
                else:
                    print(f"  ❌ [FAIL] Frontend Officer Login: {login_res.get('error') or proc.stderr}")
                    all_passed = False
                    summary_results.append(("UI Login: Scrutiny Officer", "FAIL", str(login_res.get("error"))))

                pages = browser_data.get("pages", [])
                for p in pages:
                    p_name = p.get("name")
                    p_status = p.get("status")
                    p_err = p.get("error")
                    p_shot = Path(p.get("screenshot") or "").name
                    
                    if p_status == "PASS":
                        print(f"  ✅ [PASS] Page: {p_name:<28} -> Screenshot: {p_shot}")
                        summary_results.append((f"UI Page: {p_name}", "PASS", f"Screenshot: {p_shot}"))
                    else:
                        print(f"  ❌ [FAIL] Page: {p_name:<28} -> Error: {p_err}")
                        all_passed = False
                        summary_results.append((f"UI Page: {p_name}", "FAIL", str(p_err)))

            except subprocess.TimeoutExpired:
                print("  ❌ [FAIL] Headless browser execution timed out after 90 seconds.")
                all_passed = False
                summary_results.append(("Headless Browser Smoke", "FAIL", "Timeout after 90s"))
            except Exception as e:
                print(f"  ❌ [FAIL] Headless browser execution failed: {e}")
                all_passed = False
                summary_results.append(("Headless Browser Smoke", "FAIL", str(e)))

    # ------------------------------------------------------------------------
    # FINAL SUMMARY REPORT
    # ------------------------------------------------------------------------
    print("\n" + "=" * 75)
    print(" 📋 DEPLOYMENT VERIFICATION SUMMARY REPORT")
    print("=" * 75)
    print(f"| {'Checkpoint':<36} | {'Result':<8} | {'Details':<24} |")
    print(f"|{'-'*38}|{'-'*10}|{'-'*26}|")
    for name, res, detail in summary_results:
        symbol = "✅" if res == "PASS" else ("⚠️" if res == "SKIP" else "❌")
        detail_trunc = (detail[:23] + "…") if len(detail) > 24 else detail
        print(f"| {name:<36} | {symbol} {res:<5} | {detail_trunc:<24} |")
    print("=" * 75)

    if all_passed:
        print("\n🎉 ALL DEPLOYMENT SMOKE CHECKS PASSED PERFECTLY!\n")
        return 0
    else:
        print("\n⚠️ SOME SMOKE CHECKS FAILED. Review errors above.\n")
        return 1


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="PRAMAAN-X Deployment Smoke Verification Suite")
    parser.add_argument("base_url", nargs="?", default=os.getenv("BACKEND_URL", "http://127.0.0.1:8000"), help="Backend Base URL")
    parser.add_argument("--backend-url", default=None, help="Explicit backend URL override")
    parser.add_argument("--frontend-url", default=os.getenv("FRONTEND_URL", "http://127.0.0.1:5173"), help="Frontend Base URL")
    parser.add_argument("--skip-browser", action="store_true", help="Skip headless browser tests")
    parser.add_argument("--screenshots-dir", default=None, help="Optional path to save screenshots (defaults to temporary directory)")

    args = parser.parse_args()
    target_backend = args.backend_url or args.base_url

    exit_code = run_smoke_tests(
        backend_url=target_backend,
        frontend_url=args.frontend_url,
        skip_browser=args.skip_browser,
        screenshots_dir=args.screenshots_dir
    )
    sys.exit(exit_code)
