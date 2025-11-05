# SmartBoardAI API Hardening Checklist

This checklist must be reviewed **before each release**.

## 1. Authentication & Authorization
- [ ] All public endpoints require auth (JWT/session)
- [ ] Internal endpoints require `X-API-Key` header
- [ ] Tokens are validated server-side
- [ ] Admin endpoints (if any) require RBAC

## 2. Transport Security
- [ ] HTTPS enforced
- [ ] CORS restricted to trusted domains
- [ ] No wildcard origins in production

## 3. Input Validation
- [ ] All inputs are validated and sanitized
- [ ] AI prompts are cleaned and escaped
- [ ] AI outputs match expected schema

## 4. Logging
- [ ] No secrets in logs
- [ ] Request IDs and timestamps logged
- [ ] Sensitive fields redacted

## 5. Rate Limiting & Error Handling
- [ ] Rate limits on login and sensitive endpoints
- [ ] Generic error messages (no stack traces to users)

## 6. Secrets
- [ ] All secrets stored in secret manager or GitHub Secrets
- [ ] No secrets in repo history
- [ ] Keys rotated on schedule

## 7. Code Review
- [ ] Security review done for new endpoints
- [ ] Threat model updated if needed
- [ ] CI/CD scans (CodeQL, Dependabot) passing
