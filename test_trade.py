import requests
import json
import uuid

base_url = "http://localhost:8000/api/v1"

def run_test():
    # 1. Register a new user
    user_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    user_pw = "Password123!"
    
    print(f"[*] Registering user {user_email}...")
    reg_response = requests.post(f"{base_url}/auth/register", json={
        "email": user_email,
        "password": user_pw,
        "full_name": "Test User",
        "risk_profile": "moderate"
    })
    
    if reg_response.status_code not in [200, 201]:
        print(f"[!] Registration failed: {reg_response.text}")
        return
        
    print("[+] Registration successful.")
    
    # 2. Login
    print("[*] Logging in...")
    login_response = requests.post(f"{base_url}/auth/login/access-token", data={
        "username": user_email,
        "password": user_pw
    })
    
    if login_response.status_code != 200:
        print(f"[!] Login failed: {login_response.text}")
        return
        
    token = login_response.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}
    print("[+] Login successful, token acquired.")
    
    # 3. Check Portfolio
    print("[*] Checking portfolio...")
    pf_response = requests.get(f"{base_url}/trading/portfolio/summary", headers=headers)
    print(f"Portfolio: {pf_response.status_code}")
    print(pf_response.json())
    
    # 4. Place BUY order
    print("[*] Placing BUY order for RELIANCE.NS...")
    buy_payload = {
        "ticker": "RELIANCE.NS",
        "type": "MARKET",
        "side": "BUY",
        "quantity": 5,
        "price": 2500.0
    }
    buy_response = requests.post(f"{base_url}/trading/orders", headers=headers, json=buy_payload)
    print(f"BUY Response: {buy_response.status_code}")
    print(buy_response.json())
    
    # 5. Place SELL order
    print("[*] Placing SELL order for RELIANCE.NS...")
    sell_payload = {
        "ticker": "RELIANCE.NS",
        "type": "MARKET",
        "side": "SELL",
        "quantity": 2,
        "price": 2510.0
    }
    sell_response = requests.post(f"{base_url}/trading/orders", headers=headers, json=sell_payload)
    print(f"SELL Response: {sell_response.status_code}")
    print(sell_response.json())
    
    # 6. Check Portfolio again
    print("[*] Checking portfolio after trades...")
    pf2_response = requests.get(f"{base_url}/trading/portfolio/summary", headers=headers)
    print(f"Portfolio: {pf2_response.status_code}")
    print(pf2_response.json())

if __name__ == "__main__":
    run_test()
