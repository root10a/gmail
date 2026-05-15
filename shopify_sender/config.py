from __future__ import annotations

import os
from dataclasses import dataclass

from dotenv import load_dotenv

GMAIL_SMTP_HOST = "smtp.gmail.com"
GMAIL_SMTP_PORT = 587


@dataclass(frozen=True)
class Config:
    gmail_address: str
    gmail_app_password: str
    sender_name: str
    reply_to: str

    @classmethod
    def from_env(cls) -> "Config":
        load_dotenv()
        address = os.environ.get("GMAIL_ADDRESS", "").strip()
        password = os.environ.get("GMAIL_APP_PASSWORD", "").strip()
        if not address or not password:
            raise RuntimeError(
                "GMAIL_ADDRESS and GMAIL_APP_PASSWORD must be set. "
                "Copy .env.example to .env and fill it in."
            )
        sender_name = os.environ.get("SENDER_NAME", "").strip() or address
        reply_to = os.environ.get("REPLY_TO", "").strip() or address
        return cls(
            gmail_address=address,
            gmail_app_password=password,
            sender_name=sender_name,
            reply_to=reply_to,
        )
