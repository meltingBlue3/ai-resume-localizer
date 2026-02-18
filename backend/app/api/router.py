from fastapi import APIRouter

from app.api.routes.preview import router as preview_router
from app.api.routes.translate import router as translate_router
from app.api.routes.upload import router as upload_router

api_router = APIRouter()
api_router.include_router(upload_router)
api_router.include_router(translate_router)
api_router.include_router(preview_router)
