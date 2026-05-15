import { parse as parseHtml } from 'node-html-parser';

function textFrom(message) {
  if (message.text && message.text.trim()) return message.text;
  if (message.html) return parseHtml(message.html).textContent;
  return message.snippet ?? '';
}

// "$1,234.56", "USD 1,234.56", "1.234,56 EUR", "£12.00"
const AMOUNT_RE =
  /(?:(USD|EUR|GBP|CAD|AUD|JPY)\s*)?([$£€])?\s*([\d.,]+\d)\s*(USD|EUR|GBP|CAD|AUD|JPY)?/;

const SYMBOL_CURRENCY = { $: 'USD', '£': 'GBP', '€': 'EUR' };

function normalizeAmount(raw) {
  // Last separator is the decimal separator when followed by exactly 2 digits.
  const m = raw.match(/^(.*)([.,])(\d{2})$/);
  if (m) {
    const intPart = m[1].replace(/[.,]/g, '');
    return Number(`${intPart}.${m[3]}`);
  }
  return Number(raw.replace(/[.,]/g, ''));
}

function parseMoney(body) {
  const m = body.match(AMOUNT_RE);
  if (!m) return { amount: null, currency: null };
  const currency = m[1] || m[4] || SYMBOL_CURRENCY[m[2]] || null;
  return { amount: normalizeAmount(m[3]), currency };
}

function classify(subject = '', body = '') {
  const s = `${subject} ${body}`.toLowerCase();
  if (/\binvoice\b/.test(s) && !/money request/.test(s)) return 'invoice';
  if (/money request|requested .*payment|is requesting|requested money/.test(s)) {
    return 'money_request';
  }
  if (/sent you|you (?:received|got) a payment/.test(s)) return 'payment_received';
  return 'unknown';
}

function extractSender(subject = '', body = '') {
  let m =
    subject.match(/invoice from (.+?)\s*(?:\(|#|$)/i) ||
    subject.match(/^(.+?) sent you (?:an invoice|a money request)/i) ||
    subject.match(/^(.+?) is requesting/i) ||
    body.match(/(?:from|requested by)\s*[:\-]?\s*(.+?)\s*(?:\n|\(|$)/i);
  return m ? m[1].trim() : null;
}

function extractInvoiceNumber(subject = '', body = '') {
  const m =
    `${subject}\n${body}`.match(/invoice\s*(?:#|number|no\.?|id)\s*[:#]?\s*([A-Za-z0-9][A-Za-z0-9\-]*)/i);
  return m ? m[1] : null;
}

function extractDueDate(body = '') {
  const m = body.match(/due\s*(?:date|by|on)?\s*[:\-]?\s*([A-Za-z0-9 ,\/\-]+?)(?:\n|\.|$)/i);
  return m ? m[1].trim() : null;
}

function extractPayLink(html = '') {
  if (!html) return null;
  const root = parseHtml(html);
  for (const a of root.querySelectorAll('a')) {
    const href = a.getAttribute('href') || '';
    if (/paypal\.com\/.*(invoice|pay|money-request|myaccount)/i.test(href)) return href;
  }
  return null;
}

// Parse a single fetched message into a structured PayPal notification record.
export function parseMessage(message) {
  const body = textFrom(message);
  const type = classify(message.subject, body);
  const { amount, currency } = parseMoney(body) ;
  return {
    id: message.id,
    type,
    from: message.from,
    subject: message.subject,
    date: message.date,
    sender: extractSender(message.subject, body),
    amount,
    currency,
    invoiceNumber: type === 'invoice' ? extractInvoiceNumber(message.subject, body) : null,
    dueDate: extractDueDate(body),
    paymentLink: extractPayLink(message.html),
  };
}

export function parseMessages(messages) {
  return messages.map(parseMessage);
}
