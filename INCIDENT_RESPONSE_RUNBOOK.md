# SmartBoardAI Incident Response Runbook

## 1. Objectives
- Contain security incidents rapidly
- Minimize impact on users and data
- Maintain transparency and accountability

---

## 2. Severity Levels
| Level | Description | Example |
|-------|-------------|---------|
| Critical 🚨 | Active exploit of production secrets or APIs | Leaked API key, auth bypass |
| High 🔥 | Vulnerability discovered with potential exploit | CORS misconfig |
| Medium ⚠️ | Limited exposure or development-only issue | Dev token exposure |
| Low 🟡 | No exploit, informational | Security warning |

---

## 3. Response Workflow
1. **Detection** — Automated alert, user report, internal review.
2. **Triage** — Determine severity and affected components.
3. **Containment** — Revoke keys, isolate affected systems.
4. **Mitigation** — Patch vulnerability, apply firewall or code fix.
5. **Recovery** — Redeploy with rotated secrets, validate access control.
6. **Post-Mortem** — Document incident, timeline, lessons learned.

---

## 4. Roles & Responsibilities
- **Incident Commander:** Lead coordination
- **Engineering:** Patch and fix systems
- **Security:** Analysis, forensic logging, disclosure
- **Comms:** User notification if needed

---

## 5. Communication Plan
- Critical incidents are escalated via Slack #security-incident and email to engineering leads.
- User notification via email or in-app banners (if required).

---

## 6. Documentation
- Incident logged in `incident_log.md` (private)
- Timeline, severity, systems affected, fixes, follow-up actions

---

## 7. Lessons Learned
- Update `THREAT_MODEL.md` if attack vector was new
- Add regression tests to prevent recurrence
- Consider security automation enhancements
