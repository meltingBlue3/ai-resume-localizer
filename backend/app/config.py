from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    dify_base_url: str = "https://api.dify.ai/v1"
    dify_extraction_api_key: str = ""
    dify_translation_api_key: str = ""

    @property
    def base_dir(self) -> Path:
        return Path(__file__).parent

    @property
    def fonts_dir(self) -> Path:
        return self.base_dir / "fonts"

    @property
    def templates_dir(self) -> Path:
        return self.base_dir / "templates"


settings = Settings()

# Backward-compatible aliases for existing imports
BASE_DIR = settings.base_dir
FONTS_DIR = settings.fonts_dir
TEMPLATES_DIR = settings.templates_dir
