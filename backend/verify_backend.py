import requests
import sys

def verify_api():
    base_url = "http://localhost:8000/api/v1"
    
    print("--- FinHQ Backend Verification ---")
    
    # 1. Check Health
    try:
        res = requests.get(f"http://localhost:8000/health")
        print(f"[1] Health Check: {'PASSED' if res.status_code == 200 else 'FAILED'}")
    except Exception as e:
        print(f"[1] Health Check: FAILED (Is backend running on port 8000?) - {e}")
        return

    # Note: Following tests require a valid token. 
    # We will skip auth for now and just check if the ENDPOINT order is correct by checking if /search returns 401 instead of 404
    # (If it's 401, the route exists. If it's 404, it might be shadowed)
    
    endpoints = ["/stocks/index-stocks", "/stocks/market-movers", "/stocks/search?q=RELIANCE"]
    
    print("\n[2] Checking Route Availability (Expecting 401 if unauthenticated, 200 if open):")
    for ep in endpoints:
        try:
            res = requests.get(base_url + ep)
            status = "AVAILABLE (401)" if res.status_code == 401 else f"OK ({res.status_code})" if res.status_code == 200 else f"ERROR ({res.status_code})"
            print(f"    {ep:30} -> {status}")
        except Exception as e:
            print(f"    {ep:30} -> CONNECT ERROR")

    print("\n--- Summary ---")
    print("If all routes show 401, the URL order fix is WORKING.")
    print("Please run 'python initial_data.py' to seed the 120+ stocks.")

if __name__ == "__main__":
    verify_api()
