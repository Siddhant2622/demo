import os
import shutil
import tempfile
import subprocess
import zipfile
import json
import stat
from pathlib import Path
from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from pydantic import BaseModel

try:
    from backend.services.gemini_service import gemini_service
except ImportError:
    gemini_service = None

router = APIRouter(
    prefix="/api/github-injector",
    tags=["GitHub Injector"]
)

class InjectRequest(BaseModel):
    repo_url: str
    user_data: dict

def cleanup_temp(path: str):
    if os.path.exists(path):
        # Handle read-only files on Windows
        for root, dirs, files in os.walk(path):
            for fname in files:
                full_path = os.path.join(root, fname)
                os.chmod(full_path, stat.S_IWRITE)
        shutil.rmtree(path, ignore_errors=True)

@router.post("/clone-and-inject")
async def clone_and_inject(req: InjectRequest, background_tasks: BackgroundTasks):
    repo_url = req.repo_url
    if not repo_url.startswith("https://github.com/"):
        raise HTTPException(status_code=400, detail="Must be a valid GitHub URL")
        
    temp_dir = tempfile.mkdtemp()
    
    # Clone the repo
    try:
        subprocess.run(["git", "clone", "--depth", "1", repo_url, "repo"], cwd=temp_dir, check=True, capture_output=True)
    except subprocess.CalledProcessError as e:
        cleanup_temp(temp_dir)
        raise HTTPException(status_code=400, detail=f"Failed to clone repository: {e.stderr.decode('utf-8', errors='ignore')}")
        
    repo_path = os.path.join(temp_dir, "repo")
    
    # Let's find potential data files
    target_files = []
    for root, dirs, files in os.walk(repo_path):
        # Ignore node_modules
        if "node_modules" in root or ".git" in root:
            continue
        for file in files:
            if file.lower() in ["index.html", "data.json", "config.js", "sitemetadata.js", "portfolio.js", "data.ts", "data.js", "constants.js"]:
                target_files.append(os.path.join(root, file))
                
    # Use LLM to rewrite the files if found
    for file_path in target_files:
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
            
            # Use System to intelligently rewrite the file content with the user data
            prompt = f"""
You are an expert web developer. 
I have a file from a portfolio repository. It contains placeholder developer data.
Please rewrite this file content, replacing the placeholder data with the user's actual data below.
Do not change the file structure, variable names, or JSON keys. Only change the values.
If a field doesn't have an exact match in the user data, leave the original placeholder or invent a safe default.

User Data:
{json.dumps(req.user_data, indent=2)}

File Content:
```
{content}
```

Output ONLY the raw rewritten file content without any markdown backticks or explanations.
"""
            
            if gemini_service:
                try:
                    rewritten_content = gemini_service.generate_content(prompt)
                    # Clean up markdown code blocks if system added them anyway
                    rewritten_content = rewritten_content.strip()
                    if rewritten_content.startswith("```"):
                        lines = rewritten_content.split("\n")
                        # Find the closing backticks
                        if lines[-1].startswith("```"):
                            rewritten_content = "\n".join(lines[1:-1])
                        else:
                            rewritten_content = "\n".join(lines[1:])
                            
                    with open(file_path, "w", encoding="utf-8") as f:
                        f.write(rewritten_content)
                except Exception as e:
                    print(f"System failed to rewrite {file_path}: {e}")
        except Exception:
            pass
            
    # Remove .git folder to save space and avoid nested git issues
    git_dir = os.path.join(repo_path, ".git")
    if os.path.exists(git_dir):
        for root, dirs, files in os.walk(git_dir):
            for fname in files:
                full_path = os.path.join(root, fname)
                os.chmod(full_path, stat.S_IWRITE)
        shutil.rmtree(git_dir, ignore_errors=True)
            
    # Zip it up
    zip_filename = "portfolio-template.zip"
    zip_filepath = os.path.join(temp_dir, zip_filename)
    
    with zipfile.ZipFile(zip_filepath, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(repo_path):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, repo_path)
                zipf.write(file_path, arcname)
                
    # Schedule cleanup after sending response
    background_tasks.add_task(cleanup_temp, temp_dir)
    
    user_first_name = req.user_data.get('personalInfo', {}).get('firstName', 'portfolio').lower()
    return FileResponse(
        path=zip_filepath, 
        filename=f"{user_first_name}-portfolio-template.zip",
        media_type="application/zip"
    )
