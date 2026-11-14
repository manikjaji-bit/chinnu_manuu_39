import os
import urllib.request
import urllib.error
import json
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
SUPABASE_STORAGE_BUCKET = os.getenv("SUPABASE_STORAGE_BUCKET", "campus-evidence")

class SupabaseService:
    def __init__(self):
        self.url = SUPABASE_URL
        self.anon_key = SUPABASE_ANON_KEY
        self.service_key = SUPABASE_SERVICE_ROLE_KEY
        self.bucket = SUPABASE_STORAGE_BUCKET

    def is_configured(self) -> bool:
        return bool(self.url and (self.service_key or self.anon_key))

    def upload_file(self, file_bytes: bytes, filename: str, content_type: str = "image/jpeg") -> Optional[str]:
        """Uploads a file to Supabase Storage and returns its public URL."""
        if not self.is_configured():
            return None

        # Sanitize filename
        safe_filename = filename.replace(" ", "_").replace("\\", "/").split("/")[-1]
        upload_endpoint = f"{self.url}/storage/v1/object/{self.bucket}/{safe_filename}"
        
        auth_key = self.service_key or self.anon_key
        headers = {
            "apikey": auth_key,
            "Authorization": f"Bearer {auth_key}",
            "Content-Type": content_type,
            "x-upsert": "true"
        }

        try:
            req = urllib.request.Request(upload_endpoint, data=file_bytes, headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=10) as resp:
                if resp.status in (200, 201):
                    public_url = f"{self.url}/storage/v1/object/public/{self.bucket}/{safe_filename}"
                    logger.info(f"Uploaded file to Supabase Storage: {public_url}")
                    return public_url
        except Exception as e:
            logger.warning(f"Supabase Storage upload fallback: {e}")

        return None

    def get_status(self) -> Dict[str, Any]:
        """Returns connection health and config info."""
        if not self.is_configured():
            return {
                "configured": False,
                "connected": False,
                "message": "Supabase credentials not configured"
            }

        auth_key = self.service_key or self.anon_key
        headers = {
            "apikey": auth_key,
            "Authorization": f"Bearer {auth_key}"
        }

        try:
            test_url = f"{self.url}/storage/v1/bucket/{self.bucket}"
            req = urllib.request.Request(test_url, headers=headers, method="GET")
            with urllib.request.urlopen(req, timeout=5) as resp:
                connected = (resp.status == 200)
                return {
                    "configured": True,
                    "connected": connected,
                    "project_url": self.url,
                    "bucket": self.bucket,
                    "storage_provider": "Supabase Cloud Storage (CDN Enabled)",
                    "auth_ready": True
                }
        except Exception as e:
            return {
                "configured": True,
                "connected": False,
                "project_url": self.url,
                "bucket": self.bucket,
                "error": str(e)
            }

supabase_service = SupabaseService()
