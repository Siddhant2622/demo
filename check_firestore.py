import httpx
import json

FIRESTORE_REST_URL = "https://firestore.googleapis.com/v1/projects/skill-forge-df7fc/databases/(default)/documents/users"
FIREBASE_API_KEY = "AIzaSyCv0qZmIfGHkmxjZS5-I2vYwppLC29Y7Qc"

url = f"{FIRESTORE_REST_URL}?key={FIREBASE_API_KEY}"
print("Fetching all users...")
try:
    response = httpx.get(url)
    print(response.status_code)
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Error: {e}")
