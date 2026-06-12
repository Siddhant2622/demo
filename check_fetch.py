import httpx
import json

FIRESTORE_REST_URL = "https://firestore.googleapis.com/v1/projects/skill-forge-df7fc/databases/(default)/documents/users"
FIREBASE_API_KEY = "AIzaSyCv0qZmIfGHkmxjZS5-I2vYwppLC29Y7Qc"
user_id = "eKIQmghNTWgTMEtZD9SQhOrQ4j82"

url = f"{FIRESTORE_REST_URL}/{user_id}?key={FIREBASE_API_KEY}"
print("Fetching user profile...")
try:
    response = httpx.get(url)
    print(response.status_code)
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Error: {e}")
