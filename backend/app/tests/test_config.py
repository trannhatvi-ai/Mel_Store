from app.core.config import Settings


def test_development_cors_includes_loopback_aliases() -> None:
    settings = Settings(
        DATABASE_URL="postgresql+psycopg://postgres:postgres@localhost:5432/mel_store",
        CORS_ORIGINS="http://localhost:3000",
        APP_ENV="development",
    )

    assert settings.cors_origins_list == [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]


def test_configured_cors_origins_are_trimmed_and_deduplicated() -> None:
    settings = Settings(
        DATABASE_URL="postgresql+psycopg://postgres:postgres@localhost:5432/mel_store",
        CORS_ORIGINS=" http://localhost:3000/ , http://127.0.0.1:3000, http://localhost:3000 ",
        APP_ENV="production",
    )

    assert settings.cors_origins_list == [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
