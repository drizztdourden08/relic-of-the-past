/* @layer tests @kind helper */
import { createHash } from 'crypto';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { ZELDA3_SHA1_US } from '@rotp/asset-extraction';
import { bodyOf } from './body-of';
import { CANDIDATE_DIRS, REPO } from './rom-fixture.constants';

const isUsRom = (bytes: Buffer): boolean =>
  createHash('sha1').update(bodyOf(bytes)).digest('hex').toUpperCase() === ZELDA3_SHA1_US;

const candidatePaths = (): string[] => {
  const named = process.env.ROTP_ROM ? [process.env.ROTP_ROM] : [];
  const scanned = CANDIDATE_DIRS.flatMap((dir) => {
    const full = join(REPO, dir);
    if (!existsSync(full)) return [];
    return readdirSync(full).filter((name) => name.toLowerCase().endsWith('.sfc')).map((name) => join(full, name));
  });
  return [...named, ...scanned];
};

const findUsRom = (): Buffer | null => {
  for (const path of candidatePaths()) {
    if (!existsSync(path)) continue;
    const bytes = readFileSync(path);
    if (isUsRom(bytes)) return bodyOf(bytes);
  }
  return null;
};

export { findUsRom };
