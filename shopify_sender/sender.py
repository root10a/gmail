from __future__ import annotations

import smtplib
import ssl
from email.message import EmailMessage
from email.utils import formataddr

from .config import GMAIL_SMTP_HOST, GMAIL_SMTP_PORT, Config
from .order import Order
from .templates import render_html, render_plain, render_subject


def build_message(config: Config, order: Order) -> EmailMessage:
    msg = EmailMessage()
    msg["From"] = formataddr((config.sender_name, config.gmail_address))
    msg["To"] = order.customer_email
    msg["Reply-To"] = config.reply_to
    msg["Subject"] = render_subject(order)
    msg.set_content(render_plain(order))
    msg.add_alternative(render_html(order), subtype="html")
    return msg


def send_order_confirmation(
    order: Order, config: Config | None = None
) -> None:
    """Send a single order-confirmation email via Gmail SMTP (STARTTLS)."""
    config = config or Config.from_env()
    msg = build_message(config, order)

    context = ssl.create_default_context()
    with smtplib.SMTP(GMAIL_SMTP_HOST, GMAIL_SMTP_PORT, timeout=30) as smtp:
        smtp.starttls(context=context)
        smtp.login(config.gmail_address, config.gmail_app_password)
        smtp.send_message(msg)
