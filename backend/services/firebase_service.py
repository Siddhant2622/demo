import os
import json
import logging
import httpx

logger = logging.getLogger(__name__)

# Firebase Web API Config provided by the user
FIREBASE_PROJECT_ID = "skill-forge-df7fc"
FIREBASE_API_KEY = "AIzaSyCv0qZmIfGHkmxjZS5-I2vYwppLC29Y7Qc"

FIRESTORE_REST_URL = f"https://firestore.googleapis.com/v1/projects/{FIREBASE_PROJECT_ID}/databases/(default)/documents/users"

def _format_firestore_document(data: dict) -> dict:
    """Helper to convert a normal Python dict into Firestore REST API format."""
    fields = {}
    for key, value in data.items():
        if isinstance(value, str):
            fields[key] = {"stringValue": value}
        elif isinstance(value, int):
            fields[key] = {"integerValue": str(value)}
        elif isinstance(value, float):
            fields[key] = {"doubleValue": value}
        elif isinstance(value, bool):
            fields[key] = {"booleanValue": value}
        elif isinstance(value, dict):
            fields[key] = {"mapValue": {"fields": _format_firestore_document(value)}}
        elif value is None:
            fields[key] = {"nullValue": None}
    return fields

def _parse_firestore_document(fields: dict) -> dict:
    """Helper to convert Firestore REST API format back into a normal Python dict."""
    data = {}
    for key, value_dict in fields.items():
        if "stringValue" in value_dict:
            data[key] = value_dict["stringValue"]
        elif "integerValue" in value_dict:
            data[key] = int(value_dict["integerValue"])
        elif "doubleValue" in value_dict:
            data[key] = float(value_dict["doubleValue"])
        elif "booleanValue" in value_dict:
            data[key] = value_dict["booleanValue"]
        elif "mapValue" in value_dict:
            data[key] = _parse_firestore_document(value_dict["mapValue"].get("fields", {}))
    return data

def get_user_profile(user_id: str) -> dict:
    """
    Fetches the user profile from the 'users' collection using Firestore REST API.
    """
    url = f"{FIRESTORE_REST_URL}/{user_id}?key={FIREBASE_API_KEY}"
    try:
        response = httpx.get(url)
        if response.status_code == 200:
            doc = response.json()
            if "fields" in doc:
                return _parse_firestore_document(doc["fields"])
        return None
    except Exception as e:
        logger.error(f"Failed to fetch profile via REST: {e}")
        return None

def update_user_profile(user_id: str, data: dict) -> None:
    """
    Updates or creates a user profile in the 'users' collection using Firestore REST API.
    """
    url = f"{FIRESTORE_REST_URL}/{user_id}?key={FIREBASE_API_KEY}"
    
    # Format the data into Firestore's specific document structure
    firestore_payload = {
        "fields": _format_firestore_document(data)
    }
    
    # Add updateMask for each field to ensure a partial update instead of overwrite
    for key in firestore_payload["fields"].keys():
        url += f"&updateMask.fieldPaths={key}"
    
    try:
        # Using PATCH to create or update the document
        response = httpx.patch(url, json=firestore_payload)
        response.raise_for_status()
    except Exception as e:
        logger.error(f"Failed to update profile via REST: {e}")
        if hasattr(e, 'response') and e.response:
            logger.error(e.response.text)
        raise
