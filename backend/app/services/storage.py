import uuid
from pathlib import Path

from app.core.config import ROOT_DIR, settings


def save_resume_file(user_id: int, filename: str, content: bytes) -> str:
    upload_root = ROOT_DIR / settings.upload_dir
    user_dir = upload_root / str(user_id)
    user_dir.mkdir(parents=True, exist_ok=True)

    safe_filename = Path(filename).name
    stored_filename = f"{uuid.uuid4()}_{safe_filename}"
    file_path = user_dir / stored_filename
    file_path.write_bytes(content)

    return str(file_path.relative_to(ROOT_DIR)).replace("\\", "/")
