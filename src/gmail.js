import { google } from 'googleapis';

// PayPal sends transactional notifications from these addresses.
const PAYPAL_FROM = [
  'service@paypal.com',
  'service@paypal.co.uk',
  'service@intl.paypal.com',
  'paypal@mail.paypal.com',
  'paypal@e.paypal.com',
];

function buildQuery({ days, extraQuery } = {}) {
  const from = PAYPAL_FROM.map((a) => `from:${a}`).join(' OR ');
  const parts = [`(${from})`];
  if (days) parts.push(`newer_than:${days}d`);
  if (extraQuery) parts.push(extraQuery);
  return parts.join(' ');
}

function decodeBody(part) {
  if (part?.body?.data) {
    return Buffer.from(part.body.data, 'base64url').toString('utf8');
  }
  return '';
}

// Walk the MIME tree and return the best text/html and text/plain bodies.
function extractBodies(payload) {
  let html = '';
  let text = '';
  const stack = [payload];
  while (stack.length) {
    const part = stack.pop();
    if (!part) continue;
    if (part.parts) stack.push(...part.parts);
    if (part.mimeType === 'text/html' && !html) html = decodeBody(part);
    if (part.mimeType === 'text/plain' && !text) text = decodeBody(part);
  }
  return { html, text };
}

function header(headers, name) {
  const h = headers.find((x) => x.name.toLowerCase() === name.toLowerCase());
  return h ? h.value : '';
}

export async function fetchPaypalMessages(auth, { days = 90, max = 50, extraQuery } = {}) {
  const gmail = google.gmail({ version: 'v1', auth });
  const list = await gmail.users.messages.list({
    userId: 'me',
    q: buildQuery({ days, extraQuery }),
    maxResults: max,
  });

  const ids = list.data.messages ?? [];
  const messages = [];
  for (const { id } of ids) {
    const { data } = await gmail.users.messages.get({ userId: 'me', id, format: 'full' });
    const headers = data.payload.headers ?? [];
    const { html, text } = extractBodies(data.payload);
    messages.push({
      id: data.id,
      threadId: data.threadId,
      from: header(headers, 'From'),
      subject: header(headers, 'Subject'),
      date: header(headers, 'Date'),
      snippet: data.snippet,
      html,
      text,
    });
  }
  return messages;
}
