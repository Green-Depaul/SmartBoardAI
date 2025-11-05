# SmartBoardAI Threat Model

## 1. Overview
SmartBoardAI is an AI-powered project planning assistant designed for businesses and project managers. It transforms project ideas into actionable tasks using LLMs, integrating a React frontend, Java backend, and Python AI adapter.

This document identifies key assets, trust boundaries, and potential threats — and documents mitigations we’ve put in place.

---

## 2. Key Assets
- API keys (Together.ai, internal shared keys, DB credentials)
- User authentication data (JWTs, sessions)
- Project data (tasks, sprints, metadata)
- Internal service communications
- Infrastructure configuration files and logs

---

## 3. Trust Boundaries
| Boundary                        | Description                                               | Threats                                                  |
|-----------------------------------|-----------------------------------------------------------|----------------------------------------------------------|
| Frontend → Backend (Public API)  | End-user interaction through browser                      | Unauthorized access, injection, CORS abuse               |
| Backend → AI Adapter (Internal)  | Server-to-server communication                             | API key leakage, replay attacks                          |
| Backend ↔ Database               | Persistent storage                                        | Credential theft, injection, data exposure               |
| Backend/Adapter → External AI    | Third-party provider                                      | Prompt injection, data leakage, misconfiguration         |

---

## 4. Threat Categories (STRIDE)

| Category          | Example Threat in SmartBoardAI                                               | Mitigation                                                                                       |
|--------------------|------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------|
| Spoofing           | User fakes auth token to access `/api/ai`                                   | JWT validation, short TTL, HTTPS only                                                              |
| Tampering          | Malicious actor modifies prompt or task payload                             | Input validation, schema enforcement, signed JWT                                                   |
| Repudiation        | Malicious actor denies activity                                             | Access logs with user IDs, timestamps, request IDs                                                |
| Information Disclosure | Secrets leaked via logs or CORS misconfig                             | .env handling, redacted logs, strict CORS                                                          |
| Denial of Service  | Flooding endpoints with bogus requests                                      | Rate limiting, request throttling                                                                 |
| Elevation of Privilege | Accessing admin endpoints without authorization                       | Role-based access control, server-side validation                                                 |

---

## 5. Prompt Injection Risks
- **Threat:** End users or external actors inject hidden instructions to override system behavior.
- **Impact:** Disclosure of system prompt, unauthorized actions, data exposure.
- **Mitigations:**
  - Input sanitization
  - Schema validation of AI output
  - Context isolation
  - Logging and monitoring unusual prompts

---

## 6. Attack Surface Summary
- Public Web API endpoints (`/api/ai/*`)
- Admin endpoints (future: project mgmt dashboards)
- Internal adapter endpoints (`/projects/generate-steps`)
- Authentication flows (JWT handling)
- Secrets and configuration management

---

## 7. Risk Ranking
| Risk                              | Likelihood | Impact | Priority | Mitigation |
|------------------------------------|------------|--------|----------|------------|
| API key leakage                   | High       | High   | 🚨 Critical | Secrets rotation, no client exposure |
| Prompt injection                  | High       | Medium | 🔸 High | Sanitization, schema validation |
| CORS misconfiguration             | Medium     | High   | 🔸 High | Restricted origins |
| Credential brute force            | Medium     | High   | 🔸 High | Rate limiting |
| Supply chain vulnerabilities      | Medium     | Medium | 🟡 Medium | Dependabot, CodeQL |

---

## 8. Review & Update
This threat model should be reviewed **quarterly** or:
- After significant architecture changes
- When introducing new third-party integrations
- After a security incident
