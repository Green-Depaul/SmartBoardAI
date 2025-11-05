# SmartBoardAI Security Review Guide

## 1. Purpose
To ensure all code merged into main adheres to security best practices, especially around auth, secrets, and data protection.

---

## 2. Reviewers
- All security-impacting changes must be reviewed by a **security reviewer**.
- See `.github/CODEOWNERS` for enforcement.

---

## 3. Red Flags to Look For
- ❌ Hardcoded secrets or API keys
- ❌ CORS set to `*`
- ❌ No input validation on new endpoints
- ❌ Missing `X-API-Key` on internal routes
- ❌ Excessive or sensitive logging

---

## 4. Positive Indicators
- ✅ Secrets pulled from environment variables
- ✅ Strict auth and role checks
- ✅ Proper rate limiting
- ✅ Schema validation on AI outputs
- ✅ Redacted logs

---

## 5. Required Checks
- [ ] Security checklist in PR filled out
- [ ] CodeQL and Dependabot checks passing
- [ ] No secrets detected in diff
- [ ] Tests cover auth failure paths
- [ ] Threat model updated if introducing new flows

---

## 6. When to Escalate
- If new external service integration is added
- If security-sensitive logic (auth, encryption, API keys) is changed
- If a known CVE or dependency vulnerability is detected

---

## 7. Reference
- [SECURITY.md](../SECURITY.md)
- [THREAT_MODEL.md](./THREAT_MODEL.md)
- [API_HARDENING_CHECKLIST.md](./API_HARDENING_CHECKLIST.md)
