import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { authenticate } from '@google-cloud/local-auth';
import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const ROOT = process.cwd();
const TOKEN_PATH = path.join(ROOT, 'token.json');
const CREDENTIALS_PATH = path.join(ROOT, 'credentials.json');

async function loadSavedCredentials() {
  try {
    const content = await fs.readFile(TOKEN_PATH, 'utf8');
    return google.auth.fromJSON(JSON.parse(content));
  } catch {
    return null;
  }
}

async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH, 'utf8');
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  await fs.writeFile(
    TOKEN_PATH,
    JSON.stringify({
      type: 'authorized_user',
      client_id: key.client_id,
      client_secret: key.client_secret,
      refresh_token: client.credentials.refresh_token,
    }),
  );
}

// Returns an authorized OAuth2 client for the gmail.readonly scope.
// On first run this opens a browser consent screen and caches the token.
export async function authorize() {
  let client = await loadSavedCredentials();
  if (client) return client;

  client = await authenticate({ scopes: SCOPES, keyfilePath: CREDENTIALS_PATH });
  if (client.credentials.refresh_token) {
    await saveCredentials(client);
  }
  return client;
}
