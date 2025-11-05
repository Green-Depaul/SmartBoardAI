import requests

# URL of your running FastAPI server
BASE_URL = "http://127.0.0.1:8000"
ENDPOINT = "/api/projects/generate_plan"  # <-- make sure this matches your FastAPI route

def test_generate_plan():
    payload = {
        "prompt": "Build a mobile app for food delivery",
        "project_type": "software",
        "complexity": "high",
        "max_tasks": 5
    }

    try:
        response = requests.post(f"{BASE_URL}{ENDPOINT}", json=payload)
        response.raise_for_status()  # Raise error for 4xx/5xx responses
        data = response.json()
        print("✅ Response from AI service:")
        print(data)
    except requests.exceptions.HTTPError as http_err:
        print(f"❌ HTTP error occurred: {http_err}")
        print(response.text)
    except requests.exceptions.RequestException as req_err:
        print(f"❌ Request error occurred: {req_err}")

if __name__ == "__main__":
    test_generate_plan()

