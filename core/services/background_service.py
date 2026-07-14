from __future__ import annotations

import re
import uuid
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import BinaryIO

from fastapi import HTTPException, UploadFile
from PIL import Image, ImageOps, UnidentifiedImageError


BACKGROUND_DIR = Path(__file__).resolve().parents[2] / "frontend" / "public" / "BG"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_UPLOAD_BYTES = 20 * 1024 * 1024
TARGET_WIDTH = 1920
TARGET_HEIGHT = 1080


@dataclass(frozen=True)
class BackgroundImage:
    filename: str
    display_name: str

    def to_dict(self) -> dict[str, str]:
        return asdict(self)


def list_backgrounds() -> list[BackgroundImage]:
    BACKGROUND_DIR.mkdir(parents=True, exist_ok=True)
    files = [
        BackgroundImage(filename=path.name, display_name=path.stem)
        for path in BACKGROUND_DIR.iterdir()
        if path.is_file() and path.suffix.lower() in ALLOWED_EXTENSIONS
    ]
    return sorted(files, key=lambda item: item.filename.lower())


def validate_upload_file(file: UploadFile) -> None:
    original_name = file.filename or ""
    ext = Path(original_name).suffix.lower()
    content_type = (file.content_type or "").lower()

    if not original_name:
        raise HTTPException(status_code=400, detail="缺少文件名")
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="仅支持 JPG、PNG、WebP 图片")
    if content_type and content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="上传文件不是受支持的图片类型")


def save_uploaded_background(file: UploadFile) -> BackgroundImage:
    validate_upload_file(file)
    BACKGROUND_DIR.mkdir(parents=True, exist_ok=True)

    try:
        file.file.seek(0, 2)
        size = file.file.tell()
        file.file.seek(0)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="无法读取上传文件") from exc

    if size <= 0:
        raise HTTPException(status_code=400, detail="上传文件为空")
    if size > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=400, detail="图片不能超过 20MB")

    output_name = build_output_filename(file.filename or "background")
    output_path = BACKGROUND_DIR / output_name

    try:
        crop_to_16_9(file.file, output_path)
    except UnidentifiedImageError as exc:
        raise HTTPException(status_code=400, detail="无法识别图片文件") from exc
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail="背景图片处理失败") from exc

    return BackgroundImage(filename=output_name, display_name=Path(output_name).stem)


def build_output_filename(original_filename: str) -> str:
    stem = Path(original_filename).stem.strip() or "background"
    safe_stem = re.sub(r"[^A-Za-z0-9_-]+", "_", stem).strip("_") or "background"
    safe_stem = safe_stem[:40]
    return f"{safe_stem}_{uuid.uuid4().hex[:8]}.jpg"


def crop_to_16_9(
    image_file: BinaryIO,
    output_path: Path,
    target_w: int = TARGET_WIDTH,
    target_h: int = TARGET_HEIGHT,
) -> None:
    with Image.open(image_file) as source:
        img = ImageOps.exif_transpose(source)
        width, height = img.size
        if width <= 0 or height <= 0:
            raise HTTPException(status_code=400, detail="图片尺寸无效")

        target_ratio = target_w / target_h
        current_ratio = width / height

        if current_ratio > target_ratio:
            new_width = int(height * target_ratio)
            left = (width - new_width) // 2
            img = img.crop((left, 0, left + new_width, height))
        else:
            new_height = int(width / target_ratio)
            top = (height - new_height) // 2
            img = img.crop((0, top, width, top + new_height))

        if img.mode in ("RGBA", "LA") or "transparency" in img.info:
            rgba = img.convert("RGBA")
            background = Image.new("RGB", rgba.size, (255, 255, 255))
            background.paste(rgba, mask=rgba.getchannel("A"))
            img = background
        else:
            img = img.convert("RGB")

        img = img.resize((target_w, target_h), Image.Resampling.LANCZOS)
        img.save(output_path, format="JPEG", quality=95, optimize=True)
