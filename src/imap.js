import process from 'node:process';
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';

// PayPal sends transactional notifications from these addresses.
const PAYPAL_FROM = [
  'service@paypal.com',
  'service@paypal.co.uk',
  'service@intl.paypal.com',
  'paypal@mail.paypal.com',
  'paypal@e.paypal.com',
];

function credentials() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    throw new Error(
      'Set GMAIL_USER and GMAIL_APP_PASSWORD (a Gmail app password) before running. ' +
        'See README for how to generate one.',
    );
  }
  return { user, pass };
}

// Read-only: connects to Gmail over IMAP, finds PayPal notifications, and
// returns their decoded headers/bodies. Never sends or modifies anything.
export async function fetchPaypalMessages({ days = 90, max = 50 } = {}) {
  const { user, pass } = credentials();
  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: { user, pass },
    logger: false,
  });

  const messages = [];
  await client.connect();
  try {
    const lock = await client.getMailboxLock('INBOX');
    try {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const uids = new Set();
      for (const from of PAYPAL_FROM) {
        const found = await client.search({ from, since }, { uid: true });
        if (Array.isArray(found)) found.forEach((uid) => uids.add(uid));
      }

      const selected = [...uids].sort((a, b) => b - a).slice(0, max);
      if (selected.length) {
        for await (const msg of client.fetch(selected, { uid: true, source: true }, { uid: true })) {
          const parsed = await simpleParser(msg.source);
          messages.push({
            id: String(msg.uid),
            from: parsed.from?.text ?? '',
            subject: parsed.subject ?? '',
            date: parsed.date ? parsed.date.toUTCString() : '',
            snippet: (parsed.text ?? '').replace(/\s+/g, ' ').trim().slice(0, 200),
            html: parsed.html || '',
            text: parsed.text || '',
          });
        }
      }
    } finally {
      lock.release();
    }
  } finally {
    await client.logout();
  }
  return messages;
}
