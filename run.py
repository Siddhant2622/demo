import uvicorn
import sys
import os

if __name__ == "__main__":
    print("Starting SkillMap AI Backend Server...")
    print("Frontend will be available at: http://127.0.0.1:8000")
    print("API Docs will be available at: http://127.0.0.1:8000/docs")
    
    # Run the FastAPI server
    uvicorn.run(
        "backend.main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )
