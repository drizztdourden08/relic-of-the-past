/* @layer electron-main @kind logic */
import { createHash } from 'crypto';
import { join } from 'path';
import { app } from 'electron';

const pipePath = (): string => {
  const userData = app.getPath('userData');
  if (process.platform !== 'win32') return join(userData, 'store-link.sock');
  const key = createHash('sha256').update(userData.toLowerCase()).digest('hex').slice(0, 16);
  return `\\\\.\\pipe\\rotp-store-${key}`;
};

export { pipePath };
