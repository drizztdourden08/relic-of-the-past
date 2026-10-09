/* @layer electron-main @kind logic */
import { execFile } from 'child_process';
import { promisify } from 'util';
import { KEY, VALUE } from './install-size-type.constants';
import type { Reading } from './install-size-type.type';

const run = promisify(execFile);

const readSize = async (): Promise<Reading | null> => {
  const { stdout } = await run('reg', ['query', KEY, '/v', VALUE]);
  const match = stdout.match(new RegExp(`${VALUE}\\s+(REG_\\w+)\\s+(\\S+)`));
  if (!match) return null;
  return { type: match[1], kilobytes: Number.parseInt(match[2], 16) };
};

const registerInstallSize = async (): Promise<void> => {
  if (process.platform !== 'win32') return;

  try {
    const current = await readSize();
    if (!current || current.type === 'REG_DWORD' || !Number.isFinite(current.kilobytes)) return;

    await run('reg', [
      'add', KEY, '/v', VALUE, '/t', 'REG_DWORD', '/d', String(current.kilobytes), '/f',
    ]);
  } catch {
    return;
  }
};

export { registerInstallSize };
