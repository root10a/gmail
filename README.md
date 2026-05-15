# gmail

Send Shopify order-confirmation emails through your own Gmail account via SMTP.

## Setup

```bash
pip install -r requirements.txt
cp .env.example .env   # then fill in your Gmail address + App Password
```

You need a Google **App Password** (not your normal password): enable
2-Step Verification, then create one at
https://myaccount.google.com/apppasswords. `.env` is gitignored — keep
credentials out of version control.

## Usage

The tool takes a JSON file containing a Shopify order payload (the raw
Shopify Admin API order object works, or a trimmed version with the same
keys — see `sample_order.json`).

Preview without sending:

```bash
python -m shopify_sender sample_order.json --dry-run
```

Send for real:

```bash
python -m shopify_sender path/to/order.json
```

Or from your own code:

```python
from shopify_sender import Order, send_order_confirmation

order = Order.from_json_file("order.json")
send_order_confirmation(order)
```

## Notes

This sends one transactional confirmation per order to that order's
customer. It is not a bulk/marketing mailer; sending unsolicited mail
through Gmail violates Google's policies and will get the account limited.
