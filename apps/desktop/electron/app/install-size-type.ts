/* @layer electron-main @kind logic */
/**
 * Makes Windows show the app's size in Apps & Features.
 *
 * Velopack writes EstimatedSize as a REG_QWORD. Windows only reads that value as a
 * REG_DWORD, so it is ignored and the size column stays blank next to every other
 * installed app. The number itself is right, so this rewrites it in the type Windows
 * reads, without working it out again.
 *
 * Runs on every launch because an update rewrites the key, which reintroduces the
 * wrong type. Costs one registry read when there is nothing to do.
 */
import { execFile } from 'child_process';
import { promisify } from 'util';

const run = promisify(execFile);

const KEY = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\relic-of-the-past';
const VALUE = 'EstimatedSize';

interface Reading {
  type: string;
  kilobytes: number;
}

/** The value as the registry currently holds it, or null when it is absent. */
const readSize = async (): Promise<Reading | null> => {
  const { stdout } = await run('reg', ['query', KEY, '/v', VALUE]);
  // reg prints "    EstimatedSize    REG_QWORD    0x529cd"
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
    // An absent key means this is not an installed copy, which is not a problem.
  }
};

export { registerInstallSize };
