from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class LineItem:
    title: str
    quantity: int
    price: float

    @property
    def line_total(self) -> float:
        return self.quantity * self.price


@dataclass(frozen=True)
class Order:
    order_number: str
    customer_name: str
    customer_email: str
    currency: str
    items: list[LineItem]

    @property
    def total(self) -> float:
        return sum(item.line_total for item in self.items)

    @classmethod
    def from_dict(cls, data: dict) -> "Order":
        """Parse the relevant fields from a Shopify order payload.

        Accepts either the raw Shopify Admin API order object or a trimmed
        dict with the same key names.
        """
        customer = data.get("customer") or {}
        customer_name = " ".join(
            part
            for part in (customer.get("first_name"), customer.get("last_name"))
            if part
        ).strip()
        email = data.get("email") or customer.get("email") or ""
        if not email:
            raise ValueError("Order is missing a customer email address")

        items = [
            LineItem(
                title=li["title"],
                quantity=int(li.get("quantity", 1)),
                price=float(li.get("price", 0.0)),
            )
            for li in data.get("line_items", [])
        ]

        return cls(
            order_number=str(data.get("name") or data.get("order_number") or "?"),
            customer_name=customer_name or "there",
            customer_email=email,
            currency=data.get("currency", "USD"),
            items=items,
        )

    @classmethod
    def from_json_file(cls, path: str | Path) -> "Order":
        return cls.from_dict(json.loads(Path(path).read_text(encoding="utf-8")))
