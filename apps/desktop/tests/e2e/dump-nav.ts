/* @layer tests @kind helper */
import { join } from 'path';
import { existsSync, readFileSync, rmSync } from 'fs';
import { E2E_INSTANCE, STATE_SPEC_CONFIG, launchApp } from './isolated-app';
import { REPO_ROOT } from '../repo-root';

const DUMP_PATH = join(REPO_ROOT, 'debug-output', 'dump-nav.json');

const dumpNav = async <T>(state: string): Promise<T> => {
  if (existsSync(DUMP_PATH)) rmSync(DUMP_PATH);
  const { close } = await launchApp({
    instance: E2E_INSTANCE,
    openByDefault: true,
    config: STATE_SPEC_CONFIG,
    fixtures: [state],
    args: [`--dump-nav=${state}`],
  });
  try {
    for (let i = 0; i < 120 && !existsSync(DUMP_PATH); i++) {
      await new Promise((r) => setTimeout(r, 1000));
    }
    if (!existsSync(DUMP_PATH)) throw new Error(`--dump-nav=${state} wrote no dump`);
    return JSON.parse(readFileSync(DUMP_PATH, 'utf8')) as T;
  } finally {
    await close();
  }
};

export { dumpNav };
