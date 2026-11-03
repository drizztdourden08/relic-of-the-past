/* @layer electron-main @kind logic */
import { handle } from '@drizztdourden08/brock-electron/main';
import { writeDebugOutput } from './write-debug-output';

const parseDumpNavSlot = (): number | string | null => {
  for (const arg of process.argv) {
    const value = /^--dump-nav=(.+)$/.exec(arg)?.[1];
    if (value !== undefined) return /^\d+$/.test(value) ? parseInt(value, 10) : value;
  }
  return null;
};

const registerDumpNavHandler = (): void => {
  const slot = parseDumpNavSlot();

  handle('debug:getDumpNavSlot', () => slot);

  handle('debug:dumpNav', (_event, data: unknown) => writeDebugOutput('dump-nav', 'dump-nav.json', data));
};

export { registerDumpNavHandler };
