# gmail — PayPal notification parser

Reads **your own** Gmail inbox via the official Gmail API and parses genuine
PayPal notification emails (invoices, money requests, payments received) into
structured data. Read-only: it requests only the `gmail.readonly` scope.

## Setup

1. Create a Google Cloud project and enable the **Gmail API**.
2. Create an **OAuth client ID** of type *Desktop app* and download it as
   `credentials.json` into the project root.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Authorize (opens a browser consent screen once, caches `token.json`):

   ```bash
   npm run auth
   ```

`credentials.json` and `token.json` are git-ignored — never commit them.

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

Heuristic extraction is tuned to PayPal's notification templates and may need
tweaks in `src/parser.js` for localized email formats.
