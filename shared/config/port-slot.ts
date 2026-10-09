/* @layer shared-config @kind logic */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const PORT_SLOT_FILE = '.rotp-port-slot';
const PORT_SLOT_ENV = 'ROTP_PORT_SLOT';

const parseSlot = (text: string | undefined): number | null => {
  const slot = Number(text?.trim());
  return text?.trim() && Number.isInteger(slot) && slot >= 0 ? slot : null;
};

const readPortSlot = (checkoutRoot: string, env: NodeJS.ProcessEnv = process.env): number => {
  const fromEnv = parseSlot(env[PORT_SLOT_ENV]);
  if (fromEnv !== null) return fromEnv;
  const file = join(checkoutRoot, PORT_SLOT_FILE);
  return existsSync(file) ? (parseSlot(readFileSync(file, 'utf8')) ?? 0) : 0;
};

export { readPortSlot };
