// Refreshes openapi/ticketing-api.v1.json from event-ticketing-api, then `npm run api:types`
// regenerates src/api/schema.d.ts from it. Point API_CONTRACT_URL at a branch or fork to preview
// an unreleased API change, or API_CONTRACT_PATH at a local checkout's file.
import { readFile, writeFile } from 'node:fs/promises';

const defaultUrl =
  'https://raw.githubusercontent.com/ryanlakner/event-ticketing-api/main/openapi/ticketing-api.v1.json';
const target = new URL('../openapi/ticketing-api.v1.json', import.meta.url);

const localPath = process.env.API_CONTRACT_PATH;
let contract;
if (localPath) {
  contract = await readFile(localPath, 'utf8');
} else {
  const url = process.env.API_CONTRACT_URL ?? defaultUrl;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not download the API contract from ${url}: ${response.status}`);
  }
  contract = await response.text();
}

JSON.parse(contract); // Fail loudly on anything that isn't JSON.
await writeFile(target, contract);
process.stdout.write(`Updated ${target.pathname}\n`);
