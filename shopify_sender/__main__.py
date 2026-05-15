from __future__ import annotations

import argparse
import sys

from .config import Config
from .order import Order
from .sender import build_message, send_order_confirmation


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="shopify_sender",
        description="Send a Shopify order-confirmation email via Gmail SMTP.",
    )
    parser.add_argument(
        "order_json",
        help="Path to a JSON file containing the Shopify order payload.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Render and print the email instead of sending it.",
    )
    args = parser.parse_args(argv)

    order = Order.from_json_file(args.order_json)

    if args.dry_run:
        config = Config(
            gmail_address="dry-run@example.com",
            gmail_app_password="",
            sender_name="Dry Run",
            reply_to="dry-run@example.com",
        )
        msg = build_message(config, order)
        print(msg.as_string())
        return 0

    send_order_confirmation(order)
    print(f"Sent order {order.order_number} confirmation to {order.customer_email}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
