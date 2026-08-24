import os
import shutil
from abc import ABC, abstractmethod
from typing import Optional, Tuple
from fastapi import UploadFile

class BaseStorageService(ABC):
    @abstractmethod
    def save_file(self, file: UploadFile, student_id: str, doc_type: str) -> Tuple[str, str, int]:
        """Saves file and returns (file_path, file_name, file_size)"""
        pass

    @abstractmethod
    def get_file_path(self, relative_path: str) -> Optional[str]:
        """Gets absolute path or URL of file"""
        pass

    @abstractmethod
    def delete_file(self, relative_path: str) -> bool:
        """Deletes file from storage"""
        pass

class LocalStorageService(BaseStorageService):
    def __init__(self, base_dir: str = "uploads/documents"):
        self.base_dir = base_dir
        os.makedirs(self.base_dir, exist_ok=True)

    def save_file(self, file: UploadFile, student_id: str, doc_type: str) -> Tuple[str, str, int]:
        student_dir = os.path.join(self.base_dir, student_id)
        os.makedirs(student_dir, exist_ok=True)
        
        filename = f"{doc_type}_{file.filename}"
        filepath = os.path.join(student_dir, filename)
        
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        file_size = os.path.getsize(filepath)
        relative_path = f"uploads/documents/{student_id}/{filename}"
        return relative_path, file.filename, file_size

    def get_file_path(self, relative_path: str) -> Optional[str]:
        full_path = os.path.abspath(relative_path)
        if os.path.exists(full_path):
            return full_path
        return None

    def delete_file(self, relative_path: str) -> bool:
        full_path = os.path.abspath(relative_path)
        if os.path.exists(full_path):
            os.remove(full_path)
            return True
        return False

class S3StorageService(BaseStorageService):
    """Abstraction stub for cloud AWS S3 storage integration"""
    def __init__(self, bucket_name: str = "vsb-smartcampus-docs"):
        self.bucket_name = bucket_name

    def save_file(self, file: UploadFile, student_id: str, doc_type: str) -> Tuple[str, str, int]:
        # AWS S3 upload implementation goes here
        s3_key = f"documents/{student_id}/{doc_type}_{file.filename}"
        return f"s3://{self.bucket_name}/{s3_key}", file.filename, 1024

    def get_file_path(self, relative_path: str) -> Optional[str]:
        return f"https://{self.bucket_name}.s3.amazonaws.com/{relative_path}"

    def delete_file(self, relative_path: str) -> bool:
        return True

# Default active storage engine
storage_engine = LocalStorageService()
