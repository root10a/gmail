# Invoice email templates

Three production-ready invoice templates. Each folder has an HTML version
and a matching plain-text version — always send both as a `multipart/alternative`
message (this alone is one of the biggest inbox-placement factors).

| Folder             | Style                                  | Best for                    |
|--------------------|----------------------------------------|-----------------------------|
| `invoice-classic`  | Clean black/white, itemized table      | B2B / formal invoices       |
| `invoice-modern`   | Branded color header, big amount-due   | SaaS / consumer billing     |
| `invoice-receipt`  | Compact receipt, "paid" confirmation   | Payment receipts            |

## Merge variables

Replace these tokens before sending:

```
{{company_name}} {{company_address}} {{support_email}}
{{customer_name}} {{customer_email}}
{{invoice_number}} {{issue_date}} {{due_date}}
{{item_description}} {{item_qty}} {{item_amount}}   (repeat the marked row per line item)
{{currency}} {{subtotal}} {{tax_rate}} {{tax}} {{total}}
{{payment_url}}
```

## Why these land in the inbox

The templates are built to avoid common spam triggers:

- **Plain-text + HTML multipart.** Send both parts; never HTML-only.
- **Table-based layout, inline CSS, 480–600px width.** Renders everywhere,
  no `<style>` blocks that get stripped or flagged.
- **Healthy text-to-image ratio.** All content is real text — no
  image-only emails, no hidden text.
- **One clear link** to an `https://` payment/receipt page. No link
  shorteners, no mismatched anchor text.
- **Transactional, neutral wording.** No "FREE", "ACT NOW", excessive
  caps or exclamation marks. A real preheader (no "click here" bait).
- **`utf-8`, valid DOCTYPE, `lang` set, preheader present.**

## What templates alone can't fix (do this too)

Inbox placement is ~80% sender reputation, not HTML. To get close to 100%:

1. **Authenticate the sending domain:** SPF, DKIM, and a DMARC record.
2. **Send from your own domain** (e.g. `billing@yourdomain.com`), not a
   free mailbox, and keep the From name consistent.
3. **Use a reputable provider** (Postmark, SES, SendGrid) — ideally a
   dedicated IP / subdomain for transactional mail.
4. **Set a real `Reply-To`** and a valid return-path.
5. **Match subject to content**, e.g. `Invoice 1043 from {{company_name}} — due Jun 1`.
6. **Warm up** new domains/IPs and keep bounce/complaint rates low.

Transactional invoices to customers who expect them, sent from an
authenticated domain with these templates, reliably reach the inbox.
No template can guarantee a literal 100% — anyone promising that is wrong —
but this is the configuration that gets you there in practice.
