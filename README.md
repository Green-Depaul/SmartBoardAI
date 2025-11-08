# SmartBoardAI

A full-stack project planning assistant that turns ideas into actionable tasks. The app combines:

- Frontend: Vite + React + TypeScript UI for landing/login/signup, AI chat, and Kanban board
- Backend (Java/Spring Boot): MVC API, domain, persistence, and auth
- Python AI Adapter (FastAPI): Calls AI providers (Together.ai) and integrates with Java for context and logging


## Architecture

High-level flow:

1) User interacts with the React app (chat to describe projects, view/manage Kanban tasks)
2) Frontend calls Java MVC endpoints under `/api/*`
3) Java fetches domain context (users/projects), applies business logic, and calls the Python AI adapter for LLM tasks
4) Python AI adapter talks to Together.ai (or other providers), returns structured results to Java
5) Java maps AI outputs to domain models (Tasks, Steps) and persists as needed

Key benefits:
- Secrets stay on the server
- One place to rate-limit, retry, and log AI calls
- Clear contracts between layers for easier testing and iteration


## Repos and folders

- `smartboardai-frontend/` — React + Vite app
- `smartboard-api/` — Spring Boot MVC backend
- `smartboardai-python/` — FastAPI AI adapter (Together.ai integration)


## Getting started

Prereqs:
- Node.js 18+ and npm
- Java 17+ and Maven
- Python 3.11+ (or 3.12) and pip

Environment variables (recommended via shell or `.env`):

- For Python (AI adapter):
	- `TOGETHER_API_KEY` — Together.ai API key
	- `TOGETHER_MODEL` — e.g. `meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo`
	- `JAVA_BASE_URL` — default `http://localhost:8080` (Java backend URL)
	- `CORS_ORIGINS` — dev: `http://localhost:3000`

- For Java (backend):
	- Any DB creds or feature flags as needed later

Ports used (dev):
- Frontend: 3000 (Vite)
- Java backend: 8080 (Spring Boot)
- Python AI adapter: 8081 (FastAPI default in this project)


### Run the frontend

In `smartboardai-frontend/`:

```bash
npm install
npm run dev
```

Open http://localhost:3000


### Run the Java backend

In `smartboard-api/`:

```bash
./mvnw spring-boot:run
```

The server starts at http://localhost:8080


### Run the Python AI adapter

In `smartboardai-python/`:

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

export TOGETHER_API_KEY=sk-...
export JAVA_BASE_URL=http://localhost:8080
export CORS_ORIGINS=http://localhost:3000

uvicorn app.main:app --host 0.0.0.0 --port 8081 --reload
```

The adapter serves http://localhost:8081


## Demo login (dev)

For quick verification in development, a demo user is seeded automatically on backend startup.

- Frontend (Vite): http://localhost:3000
- Backend (Spring Boot): http://localhost:8080
- H2 Console: http://localhost:8080/h2-console (JDBC URL: `jdbc:h2:mem:smartboard`, user: `sa`, password: empty)
- Health check via proxy: http://localhost:3000/api/users/health

Demo credentials:

- Email: `demo@smartboard.ai`
- Password: `demo1234`

Notes:

- The frontend dev server proxies API calls to the backend. Requests to `/api/*` are forwarded to the Spring app with the `/api` prefix stripped (e.g., `/api/users/login` → `/users/login`).
- The `users` table is created automatically in the in-memory H2 database (`spring.jpa.hibernate.ddl-auto=update`). The demo user is inserted on startup if it doesn't already exist.


## API contracts (proposed)

Frontend → Java (public):
- POST `/api/ai/suggest-tasks`
	- Req: `{ projectDescription: string, context?: {...} }`
	- Res: `{ tasks: Array<{ id: string, title: string, description?: string, priority?: "low"|"medium"|"high" }> }`

- POST `/api/ai/chat` (or SSE `/api/ai/chat/stream`)
	- Req: `{ messages: Array<{ role: "user"|"assistant"|"system", content: string }>, sessionId?: string }`
	- Res (non-stream): `{ message: { role: "assistant", content: string } }`
	- Res (stream): `text/event-stream` chunks of `data: ...` ending with `data: [DONE]`

Java → Python (internal):
- POST `/prompt` — generic chat completion
- POST `/projects/generate-steps` — specialized steps generation returning structured JSON


## Frontend notes

- Tech: React 18 + TypeScript, Vite, utility-first CSS (Tailwind v4 build output in `index.css`)
- Pages: Landing, Login, Signup, Chat, Kanban
- Current navigation uses local state in `src/App.tsx` (no URL routing). We can optionally move to React Router for deep links.
- For dev, point fetches to `http://localhost:8080/api/...` (configure proxy if desired)


## Backend notes (Java)

- Spring Boot 3.5.x, Java 17
- Add a controller `AiController` exposing `/api/ai/*` endpoints
- Use `WebClient` to call the Python adapter at `http://localhost:8081` (configurable)
- Add CORS for `http://localhost:3000` during dev
- Consider Resilience4j for retries/timeouts and SLF4J for structured logs


## AI adapter notes (Python)

- FastAPI with CORS enabled
- Reads Together.ai settings from env via `app/config.py`
- Services: `app/services/java_client.py` (calls Java) and `app/services/together.py` (calls AI)
- Endpoints: `/health`, `/prompt`, `/projects/generate-steps`


## Development workflow

1) Run all three services locally (frontend 3000, Java 8080, Python 8081)
2) Build UI changes in `smartboardai-frontend/` (HMR via Vite)
3) Add/modify Java endpoints and DTOs in `smartboard-api/`
4) Modify prompts/provider settings in `smartboardai-python/`
5) Keep contracts stable; add integration tests at Java boundary


## Troubleshooting

- CORS errors: ensure Java allows `http://localhost:3000`, and Python’s `CORS_ORIGINS` includes it
- 401/403 from AI: verify `TOGETHER_API_KEY`
- Timeouts: check Python adapter is up on 8081 and Java’s `JAVA_BASE_URL` env in Python points to 8080
- Port conflicts: Vite shows the dev URL; use that


## License

For academic/capstone use. Add license terms as needed.
