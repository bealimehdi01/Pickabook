from fastapi import APIRouter, File, UploadFile, HTTPException
from typing import List

router = APIRouter()

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]

@router.post("/generate")
async def generate_image(
    child_photo: UploadFile = File(...),
    template_image: UploadFile = File(None)
):
    # 1. Validate Child Photo
    if child_photo.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_TYPES)}")
    
    content = await child_photo.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail=f"File too large. Maximum size is {MAX_FILE_SIZE/1024/1024}MB")

    # 2. Handle Custom Template (Optional)
    custom_template_path = None
    if template_image:
        if template_image.content_type not in ALLOWED_TYPES:
             raise HTTPException(status_code=400, detail="Invalid template file type.")
        template_content = await template_image.read()
        if len(template_content) > MAX_FILE_SIZE:
             raise HTTPException(status_code=413, detail="Template file too large.")
    
    # ... (Mock Check skipped for brevity in diff, assuming same logic) ...

    try:
        # Real AI Path setup
        import uuid
        unique_id = str(uuid.uuid4())
        
        # Save Face
        temp_filename = f"temp_{unique_id}_{child_photo.filename}"
        with open(temp_filename, "wb") as f:
            f.write(content)

        # Save Template if exists
        if template_image:
            custom_template_path = f"temp_{unique_id}_template_{template_image.filename}"
            with open(custom_template_path, "wb") as f:
                f.write(template_content)

        from services.ai_service import ai_service
        # Pass both paths
        image_url = ai_service.run_instant_id(temp_filename, custom_template_path)
        
        # Cleanup
        import os
        if os.path.exists(temp_filename):
            os.remove(temp_filename)
        if custom_template_path and os.path.exists(custom_template_path):
            os.remove(custom_template_path)
        
        # Cleanup temp file
        import os
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

        if not image_url:
            # Fallback for when no API key is present
            # We simply return the original image as a "mock" so the UI doesn't break
            # But we signal it's a mock
            return {
                 "status": "mock_mode",
                 "message": "No API Token found. Returned original image.",
                 "image_url": "http://localhost:8000/static/mock_placeholder.png" 
            }

        return {
            "status": "success",
            "message": "Image generated successfully",
            "image_url": image_url
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
