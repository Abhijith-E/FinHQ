# FinHQ Security Architecture

This document describes the security protocols and architecture implemented in the FinHQ application, specifically focusing on our enhanced authentication system.

## 1. Password Storage
All passwords are mathematically protected using **Argon2id**, the winner of the Password Hashing Competition.
We previously used simpler hashes (`sha256_crypt`), but have overhauled the mechanism:
- New users will immediately have their passwords hashed with Argon2id.
- Existing users still using legacy hashes will be seamlessly upgraded to Argon2id upon their next successful login.
- Argon2id provides immense resistance against dictionary attacks, brute forcing, and GPU-based parallel cracking.

## 2. Zero-Trust Password Policy
To ensure robust account security, the application enforces the following complexity rules on all new passwords:
- **Minimum 14 characters**
- Must contain at least one **uppercase letter**.
- Must contain at least one **lowercase letter**.
- Must contain at least one **numeric digit**.
- Must contain at least one **special character**.
- **Entropy Requirement**: The system utilizes the ZXCVBN algorithm to ensure that the mathematical entropy of the password is at least 70 bits.

## 3. Real-time Breach Detection
We integrate with the **Have I Been Pwned (HIBP)** API to actively prevent users from selecting passwords that have appeared in known data breaches. 
- *Privacy First*: We utilize **k-Anonymity**. Only the first 5 characters of the SHA-1 hash of the password are sent to the API. The actual password never leaves our servers.

## 4. Account Lockout & Brute-Force Protection
To protect users from credential stuffing and automated brute-force attacks:
- **Rate Limiting**: Authentication endpoints strictly limit the number of rapid requests from a single IP.
- **Account Lockout**: After 5 consecutive failed login attempts, the target account is hard-locked at the database level for exactly 15 minutes. Attempting to log in during this window gracefully notifies the user without revealing sensitive information.

## 5. Password Repurposing Prevention
Users are prohibited from reusing any of their last 10 passwords when performing a password reset or change. This prevents cyclic password changes.

## 6. Multi-Factor Authentication (MFA/2FA)
The backend enforces Time-based One-Time Passwords (TOTP). 
Once a user enables 2FA, the standard login flow is interrupted:
1. Valid credentials yield a temporary, restricted token flagged with `requires_2fa`.
2. The UI intercepts this token and prompts for an authenticator code.
3. Upon validating the TOTP code against the `/verify-2fa` endpoint, the actual access and refresh tokens are securely issued.

## 7. Secure Password Resets
Password reset links rely on highly localized JWT tokens that strictly expire after 15 minutes. Upon a successful reset, all actively logged-in sessions for that user are immediately invalidated, forcing a re-authentication across all devices.

---

### Deployment & Operation Security Notes
- Ensure `NEXT_PUBLIC_API_URL` and `SECRET_KEY` are securely managed in production via environment keys.
- Run the python backend behind an SSL/TLS terminating reverse proxy (like NGINX) to ensure passwords are encrypted in transit.
