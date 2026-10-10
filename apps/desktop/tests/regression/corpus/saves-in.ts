/* @layer test @kind helper */
import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import type { SaveEntry } from './corpus.type';

const savesIn = (kind: string, dir: string): SaveEntry[] =>
  (existsSync(dir) ? readdirSync(dir) : [])
    .filter((file) => file.endsWith('.sav')).sort()
    .map((file) => ({ name: `${kind}/${file}`, path: resolve(dir, file) }));

export { savesIn };
