/* @layer test @kind helper */
import { existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { ROOT } from './core-harness.constants';

const assetBlobPath = (): string | undefined => {
  if (process.env.ROTP_ASSETS_DAT !== undefined && existsSync(process.env.ROTP_ASSETS_DAT)) return process.env.ROTP_ASSETS_DAT;
  const dirs = [resolve(ROOT, '.user-data/Data/assets'), join(process.env.APPDATA ?? '', 'relic-of-the-past/Data/assets')];
  for (const dir of dirs) {
    if (!existsSync(dir)) continue;
    const dat = readdirSync(dir).find((name) => name.endsWith('.dat'));
    if (dat !== undefined) return join(dir, dat);
  }
  return undefined;
};

export { assetBlobPath };
