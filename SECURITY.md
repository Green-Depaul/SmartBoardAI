# 🛡️ SmartBoardAI Security Policy

This document outlines the security practices, responsibilities, and expectations for the SmartBoardAI project.  
Our goal is to protect users, businesses, and project managers who rely on SmartBoardAI for task planning, Kanban board management, and AI-driven project automation.

---

## 1. Supported Versions

The SmartBoardAI team only provides security updates and patches for active versions.  
Older versions may contain unpatched vulnerabilities and should not be used in production.

| Version | Supported |
|---------|------------|
| 5.1.x   | ✅         |
| 5.0.x   | ❌         |
| 4.0.x   | ✅         |
| < 4.0   | ❌         |

- ✅ = Security updates and patches provided
- ❌ = End of support (no patches or security fixes)

---

## 2. Threat Model & Security Philosophy

SmartBoardAI is designed to handle sensitive project planning data.  
Our security measures are focused on:
- Protecting **project data integrity** and **confidentiality**.
- Ensuring **reliable and authenticated** access to our services.
- Mitigating risks from **prompt injection**, **unauthorized API access**, and **data leakage**.
- Limiting exposure of secrets (e.g., API keys) through **server-side storage** and **least privilege access**.

Primary threat considerations:
- Unauthorized API access (frontend to backend)
- Credential compromise (login / JWT tokens)
- AI prompt injection attacks
- CORS misconfiguration / open endpoints
- Insecure storage or logging of project data
- Secret leakage in frontend repositories

---

## 3. Reporting a Vulnerability

We strongly encourage responsible disclosure.

To report a vulnerability:
- Email: **security@smartboardai.com**
- Subject line: `Security Vulnerability Report`
- Include details: affected component, steps to reproduce, potential impact, and any suggested fixes.

**Our response timeline:**
- ⏱ Acknowledgement within 48 hours
- 🧪 Investigation within 5 business days
- 🛠️ Patch or mitigation plan within 14 business days (critical issues prioritized)
- 📢 Coordinated disclosure with reporter where applicable

We do **not** support public disclosure of vulnerabilities without prior coordination.

---

## 4. Secure Development Practices

We follow a **security-first development process** across all layers:

### Frontend (Vite + React + TypeScript)
- No secrets stored in the frontend codebase.
- All API calls use HTTPS and include authentication headers.
- CORS policy strictly limited to trusted origins.
- Sanitization of user inputs to mitigate injection attacks.

### Backend (Java Spring Boot)
- Strict authentication & authorization checks on `/api/*` endpoints.
- API key & token validation for AI adapter communication.
- Structured and secure logging with sensitive data redaction.
- Rate limiting and retries configured to prevent brute-force abuse.

### Python AI Adapter (FastAPI)
- Server-side storage of API keys and environment variables.
- Input/output validation on all AI calls.
- Context isolation to prevent prompt injection exploitation.
- Enforced HTTPS and authentication from backend only.

---

## 5. Data Protection and Privacy

- All communication between services (Frontend ↔ Backend ↔ AI Adapter) is encrypted (TLS).
- No raw prompts or project data are logged without redaction.
- Secrets (e.g., `TOGETHER_API_KEY`) are stored **only on the server**.
- Access to production environments is restricted through role-based access controls.
- No personal user data is sold or shared with third parties.

Data retention:
- Project data is stored only as long as required by users.
- Logs containing metadata are retained for security auditing and debugging for 30 days.
- Data deletion requests are processed within 7 business days.

---

## 6. Dependency & Patch Management

- Dependencies in Java, Python, and JavaScript are scanned weekly with automated Dependabot alerts.
- Vulnerabilities rated **High** or **Critical** are patched within 72 hours.
- Internal components are reviewed quarterly for security posture.
- Secrets are rotated every 90 days.

---

## 7. Authentication & Authorization

- User authentication handled via secure JWT with short expiration and refresh tokens.
- Strict access controls for administrative actions.
- Internal service communication uses **X-API-KEY** headers with rotation schedules.
- Multi-Factor Authentication (MFA) recommended for admin accounts.

---

## 8. Incident Response Plan

In the event of a security incident:
1. **Triage** – Identify affected systems and isolate the issue.  
2. **Containment** – Block malicious actors or compromised components.  
3. **Mitigation** – Patch or roll back vulnerable components.  
4. **Communication** – Notify affected users and relevant parties if necessary.  
5. **Post-mortem** – Document lessons learned and strengthen defenses.

---

## 9. Secure API Usage & Key Management

- **Frontend never exposes API keys.**
- All external provider keys (e.g., Together.ai) are stored in environment variables:
  - `TOGETHER_API_KEY`
  - `TOGETHER_MODEL`
  - `JAVA_BASE_URL`
  - `CORS_ORIGINS`
- Backend enforces **header-based API key validation** for middleware access.
- Rotations are logged and verified.

---

## 10. AI Model Security Considerations

Because SmartBoardAI uses LLMs to generate structured project tasks:
- Inputs are sanitized and checked for malicious instructions.
- Outputs are validated before persistence to avoid injection or code execution risks.
- Prompts are **context-scoped**, and no external injection is allowed.
- Logging excludes sensitive content (e.g., project strategy, client names).

---

## 11. Responsible Disclosure & Safe Harbor

We support ethical security research.  
We will not pursue legal action against security researchers who:
- Follow responsible disclosure practices
- Act in good faith and do not exploit vulnerabilities
- Do not access, modify, or delete user data

---

## 12. Contact

For any security-related concerns:

📧 **security@smartboardai.com**  
🔐 PGP Key: Available upon request

---

## 13. Future Security Enhancements

We are committed to improving security as SmartBoardAI grows:
- Implementing OAuth2/OpenID Connect for external integrations
- Integrating SAST/DAST CI/CD scanning
- Adding audit logging and anomaly detection for suspicious activities
- Strengthening AI model output validation

---

*Last updated: October 27, 2025*  
*Maintained by the SmartBoardAI Security Team*
