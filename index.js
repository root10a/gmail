#!/usr/bin/env node
import process from 'node:process';
import { authorize } from './src/auth.js';
import { fetchPaypalMessages } from './src/gmail.js';
import { parseMessages } from './src/parser.js';

function arg(name, fallback) {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split('=')[1] : fallback;
}

async function main() {
  const cmd = process.argv[2];
  const auth = await authorize();

  if (cmd === 'auth') {
    console.log('Authorized. token.json saved.');
    return;
  }

  const days = Number(arg('days', '90'));
  const max = Number(arg('max', '50'));
  const onlyType = arg('type'); // invoice | money_request | payment_received

  const messages = await fetchPaypalMessages(auth, { days, max });
  let parsed = parseMessages(messages);
  if (onlyType) parsed = parsed.filter((p) => p.type === onlyType);

  if (arg('json') !== undefined || process.argv.includes('--json')) {
    console.log(JSON.stringify(parsed, null, 2));
    return;
  }

  if (!parsed.length) {
    console.log('No matching PayPal notifications found.');
    return;
  }

  for (const p of parsed) {
    const money = p.amount != null ? `${p.amount} ${p.currency ?? ''}`.trim() : 'n/a';
    console.log(`[${p.type}] ${p.subject}`);
    console.log(`  from:    ${p.sender ?? p.from}`);
    console.log(`  amount:  ${money}`);
    if (p.invoiceNumber) console.log(`  invoice: ${p.invoiceNumber}`);
    if (p.dueDate) console.log(`  due:     ${p.dueDate}`);
    if (p.paymentLink) console.log(`  link:    ${p.paymentLink}`);
    console.log(`  date:    ${p.date}`);
    console.log('');
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
