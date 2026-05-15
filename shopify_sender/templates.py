from __future__ import annotations

from html import escape

from .order import Order


def _money(amount: float, currency: str) -> str:
    return f"{amount:,.2f} {currency}"


def render_subject(order: Order) -> str:
    return f"Order {order.order_number} confirmed"


def render_plain(order: Order) -> str:
    lines = [
        f"Hi {order.customer_name},",
        "",
        f"Thanks for your order {order.order_number}. Here's a summary:",
        "",
    ]
    for item in order.items:
        lines.append(
            f"  {item.quantity} x {item.title} "
            f"- {_money(item.line_total, order.currency)}"
        )
    lines += [
        "",
        f"Total: {_money(order.total, order.currency)}",
        "",
        "We'll let you know when it ships.",
    ]
    return "\n".join(lines)


def render_html(order: Order) -> str:
    rows = "".join(
        f"<tr>"
        f"<td>{escape(item.title)}</td>"
        f"<td align='center'>{item.quantity}</td>"
        f"<td align='right'>{escape(_money(item.line_total, order.currency))}</td>"
        f"</tr>"
        for item in order.items
    )
    return f"""\
<html><body style="font-family: Arial, sans-serif; color: #222;">
  <p>Hi {escape(order.customer_name)},</p>
  <p>Thanks for your order <strong>{escape(order.order_number)}</strong>.
     Here's a summary:</p>
  <table cellpadding="6" cellspacing="0"
         style="border-collapse: collapse; width: 100%; max-width: 480px;">
    <thead>
      <tr style="border-bottom: 1px solid #ccc; text-align: left;">
        <th>Item</th><th align="center">Qty</th><th align="right">Total</th>
      </tr>
    </thead>
    <tbody>{rows}</tbody>
    <tfoot>
      <tr style="border-top: 1px solid #ccc; font-weight: bold;">
        <td colspan="2">Total</td>
        <td align="right">{escape(_money(order.total, order.currency))}</td>
      </tr>
    </tfoot>
  </table>
  <p>We'll let you know when it ships.</p>
</body></html>"""
