"""
SkillMap System — OCR API Router
===============================
Endpoints for document upload and OCR processing.
"""

import time
from typing import List, Optional
from fastapi import APIRouter, File, UploadFile, HTTPException, Query
from pydantic import BaseModel

from ..services.ocr_engine import process_document

router = APIRouter(prefix="/api/ocr", tags=["OCR"])


class OCRField(BaseModel):
    field: str
    label: str
    value: str
    display_value: str
    confidence: float
    source: str


class OCRResponse(BaseModel):
    filename: str
    status: str
    processing_time_seconds: float
    raw_text: str
    raw_text_length: int
    average_confidence: float
    fields_extracted: int
    fields: List[OCRField]
    languages_used: List[str]
    preprocessing: str
    ocr_engine: str


@router.post("/process", response_model=OCRResponse)
async def process_ocr(
    file: UploadFile = File(...),
    languages: Optional[str] = Query("en,hi", description="Comma-separated language codes"),
):
    """
    Process an uploaded document through the OCR pipeline.

    Accepts: PDF, JPG, JPEG, PNG files
    Returns: Extracted text, structured fields, and confidence scores
    """
    # Validate file type
    allowed_types = {"application/pdf", "image/jpeg", "image/png", "image/jpg"}
    allowed_extensions = {".pdf", ".jpg", ".jpeg", ".png"}

    filename = file.filename or "unknown"
    ext = "." + filename.lower().split(".")[-1] if "." in filename else ""

    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {ext}. Allowed: {', '.join(allowed_extensions)}"
        )

    # Read file bytes
    try:
        file_bytes = await file.read()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading file: {str(e)}")

    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty file uploaded")

    if len(file_bytes) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=400, detail="File too large. Maximum size: 10MB")

    # Parse languages
    lang_list = [l.strip() for l in languages.split(",")]

    # Process document
    try:
        result = process_document(file_bytes, filename, lang_list)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")

    return result


@router.post("/demo")
async def demo_ocr():
    """
    Run OCR on built-in demo document (no file upload needed).
    Perfect for hackathon demos and testing.
    """
    from ..services.ocr_engine import _get_demo_result
    result = _get_demo_result("demo_aadhaar_resume.pdf", time.time())
    return result
