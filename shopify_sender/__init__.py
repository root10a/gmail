"""Send Shopify order-confirmation emails via Gmail SMTP."""

__all__ = ["Config", "Order", "send_order_confirmation"]

from .config import Config
from .order import Order
from .sender import send_order_confirmation
