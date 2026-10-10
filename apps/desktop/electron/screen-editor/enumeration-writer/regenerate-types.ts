/* @layer electron-main @kind logic */
import { execFile } from 'child_process';
import { join } from 'path';
import { promisify } from 'util';
import { ENUM_TYPES_CLI } from './enumeration-writer.constants';

const run = promisify(execFile);

const regenerateTypes = async (root: string): Promise<void> => {
  try {
    await run(process.execPath, [join(root, ...ENUM_TYPES_CLI)], {
      cwd: root,
      env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' },
      windowsHide: true,
    });
  } catch (error) {
    console.error('enumeration-writer: failed to regenerate enumeration.type.ts', error);
  }
};

export { regenerateTypes };
