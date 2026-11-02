import urllib.request
import json
import sys

def diagnose(base_url="http://127.0.0.1:8000"):
    print(f"=== Diagnosing backend at {base_url} ===")
    
    # 1. Health check
    try:
        req = urllib.request.Request(f"{base_url}/health")
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = resp.read().decode()
            print(f"GET /health: {resp.status}\n  Body: {data}\n")
    except Exception as e:
        print(f"GET /health FAILED: {e}\n")

    # 2. Login all 5 roles
    roles = [
        ("scrutiny_officer", "scrutiny.officer@aicte-india.org", "AicteOfficer@2025"),
        ("senior_officer", "senior.officer@aicte-india.org", "AicteSenior@2025"),
        ("admin", "admin@aicte-india.org", "AicteAdmin@2025"),
        ("auditor", "auditor@aicte-india.org", "AicteAuditor@2025"),
        ("institution_user", "registrar@apextech.edu.in", "ApexPass@2025"),
    ]
    tokens = {}
    for role_name, email, pwd in roles:
        payload = json.dumps({"email": email, "password": pwd}).encode("utf-8")
        req = urllib.request.Request(
            f"{base_url}/api/v1/auth/login",
            data=payload,
            headers={"Content-Type": "application/json"}
        )
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                body = json.loads(resp.read().decode())
                token = body.get("access_token")
                user = body.get("user", {})
                tokens[role_name] = token
                print(f"POST /api/v1/auth/login ({role_name} - {email}): {resp.status}\n  Token: {token[:20]}... Role: {user.get('role')}\n")
        except Exception as e:
            print(f"POST /api/v1/auth/login ({role_name} - {email}) FAILED: {e}\n")

    officer_token = tokens.get("scrutiny_officer")
    headers = {"Authorization": f"Bearer {officer_token}"} if officer_token else {}

    # 3. Manual review queue endpoint
    try:
        req = urllib.request.Request(f"{base_url}/api/v1/verification/connector/manual-review-queue", headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            body = json.loads(resp.read().decode())
            print(f"GET /api/v1/verification/connector/manual-review-queue: {resp.status}\n  Count: {len(body)}")
            if body:
                print(f"  First Item: {json.dumps(body[0], indent=2)}\n")
            else:
                print("  Body: [] (Empty Queue)\n")
    except Exception as e:
        print(f"GET /api/v1/verification/connector/manual-review-queue FAILED: {e}\n")

    # 4. Dashboard (applications list)
    try:
        req = urllib.request.Request(f"{base_url}/api/v1/applications", headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            body = json.loads(resp.read().decode())
            print(f"GET /api/v1/applications (Dashboard): {resp.status}\n  Count: {len(body)}")
            if body:
                summary = [{"id": a.get("id"), "application_no": a.get("application_no"), "name": a.get("name"), "status": a.get("status")} for a in body[:3]]
                print(f"  Sample Apps: {json.dumps(summary, indent=2)}\n")
    except Exception as e:
        print(f"GET /api/v1/applications FAILED: {e}\n")

    # 5. Audit endpoints
    try:
        req = urllib.request.Request(f"{base_url}/api/v1/audit/logs?limit=3", headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            body = json.loads(resp.read().decode())
            print(f"GET /api/v1/audit/logs: {resp.status}\n  Sample: {json.dumps(body[:2], indent=2)}\n")
    except Exception as e:
        print(f"GET /api/v1/audit/logs FAILED: {e}\n")

    try:
        req = urllib.request.Request(f"{base_url}/api/v1/audit/verify-chain", headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            body = json.loads(resp.read().decode())
            print(f"GET /api/v1/audit/verify-chain: {resp.status}\n  Body: {json.dumps(body, indent=2)}\n")
    except Exception as e:
        print(f"GET /api/v1/audit/verify-chain FAILED: {e}\n")

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8000"
    diagnose(target)
