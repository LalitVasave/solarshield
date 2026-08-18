from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    app_name: str = "SolarShield"
    debug: bool = False

    # Database
    database_url: str

    # Redis + Celery
    redis_url: str = "redis://localhost:6379/0"

    # JWT
    jwt_secret: str = "change-me"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440  # 24 hours

    # Storage
    image_storage_path: str = "./images"
    max_image_size_mb: int = 10

    # Rate limiting
    rate_limit_inspection: str = "30/minute"
    rate_limit_auth: str = "10/minute"

    # Maintenance Integrations (Jira)
    jira_url: str | None = None
    jira_email: str | None = None
    jira_api_token: str | None = None
    jira_project_key: str | None = None

    class Config:
        env_file = ".env"


settings = Settings()
