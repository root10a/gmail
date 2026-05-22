# gmail — PayPal notification parser (IMAP)

Reads **your own** Gmail inbox over IMAP and parses genuine PayPal notification
emails (invoices, money requests, payments received) into structured data.
**Read-only:** it only logs in and reads — it never sends or modifies mail.

## Setup

1. Turn on **2-Step Verification** on your Google account.
2. Create a **Gmail app password**: https://myaccount.google.com/apppasswords
   (pick "Mail" / "Other"). You get a 16-character password.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Provide your credentials as environment variables.

   Windows (cmd):
   ```bat
   set GMAIL_USER=you@gmail.com
   set GMAIL_APP_PASSWORD=your16charapppassword
   node index.js
   ```

   macOS / Linux:
   ```bash
   export GMAIL_USER=you@gmail.com
   export GMAIL_APP_PASSWORD=your16charapppassword
   node index.js
   ```

   Or put them in a `.env` file (git-ignored) and run with Node's loader:
   ```
   GMAIL_USER=you@gmail.com
   GMAIL_APP_PASSWORD=your16charapppassword
   ```
   ```bash
   node --env-file=.env index.js
   ```

## Usage

```bash
node index.js                       # last 90 days, table output
node index.js --days=30 --max=20    # narrow the window
node index.js --type=invoice        # only invoices
node index.js --type=money_request  # only money requests
node index.js --json                # machine-readable output
```

## Output fields

`type`, `from`, `subject`, `date`, `sender`, `amount`, `currency`,
`invoiceNumber`, `dueDate`, `paymentLink`.

## Notes

- The app password is read from the environment; it is never written to disk by
  this tool. Keep `.env` out of version control (already git-ignored).
- Heuristic extraction is tuned to PayPal's notification templates and may need
  tweaks in `src/parser.js` for localized email formats.
