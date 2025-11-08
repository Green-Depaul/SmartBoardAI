## SmartBoardAI dev helpers

.PHONY: backend frontend python python-setup dev

backend:
	cd smartboard-api && ./mvnw spring-boot:run

python-setup:
	cd smartboardai-python && python -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt

python:
	cd smartboardai-python && if [ -x .venv/bin/python ]; then .venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port 8081 --reload; else python -m uvicorn app.main:app --host 0.0.0.0 --port 8081 --reload; fi

frontend:
	cd smartboardai-frontend && npm install && npm run dev

# Run all three in parallel (requires GNU make -j or run in separate terminals)
dev:
	@echo "Run in separate terminals: make backend | make python | make frontend"
