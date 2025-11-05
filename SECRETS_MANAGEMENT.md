# SmartBoardAI Secrets Management

## 1. Guiding Principles
- No secrets are ever stored in the frontend.
- Secrets are **injected at runtime** through `.env` files or secure secret stores.
- Secrets are **never committed to Git** — enforced through `.gitignore` and secret scanning.

---

## 2. Secrets Inventory
| Secret Name              | Used In                   | Type       | Storage Location                     | Rotation |
|---------------------------|----------------------------|------------|----------------------------------------|-----------|
| TOGETHER_API_KEY          | Python Adapter             | External API | GitHub Secrets / .env (dev)           | 90 days |
| INTERNAL_SHARED_KEY       | Java & Python              | Internal API | GitHub Secrets / .env (dev)          | 90 days |
| DB_URL / DB_USER / DB_PASS| Java Backend              | Database   | Secret Manager / .env (dev)           | 90 days |
| JWT_SECRET                | Java Backend              | Auth Token | Secret Manager / .env (dev)           | 90 days |

---

## 3. Storage & Access
- **Dev**: `.env` (ignored in git)
- **CI/CD**: GitHub Actions Secrets
- **Prod**: Secret Manager (AWS, GCP, or Vault)

Only the backend and adapter services have access to secrets.  
Access is restricted to CI/CD runners and production containers.

---

## 4. Rotation Policy
- Rotation occurs every **90 days** or upon suspected compromise.
- Documented in internal rotation log.
- Post-rotation checklist:
  - ✅ Rotate value
  - ✅ Redeploy services
  - ✅ Test endpoints
  - ✅ Invalidate old keys

---

## 5. Detection
- GitHub Secret Scanning enabled
- PR template includes secret exposure check
- Regular scanning of repo with `trufflehog` or similar tool
