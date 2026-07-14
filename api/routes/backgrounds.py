from fastapi import APIRouter, File, UploadFile

from api.schemas import ResponseModel
from core.services.background_service import list_backgrounds, save_uploaded_background


router = APIRouter()


@router.get("/backgrounds", response_model=ResponseModel)
async def get_backgrounds():
    backgrounds = [item.to_dict() for item in list_backgrounds()]
    return {
        "code": 200,
        "message": "success",
        "data": {"backgrounds": backgrounds},
    }


@router.post("/backgrounds/upload", response_model=ResponseModel)
async def upload_background(file: UploadFile = File(...)):
    background = save_uploaded_background(file)
    return {
        "code": 200,
        "message": "上传成功",
        "data": {
            "filename": background.filename,
            "display_name": background.display_name,
        },
    }
