/* @layer electron-main @kind logic */
import { readFile } from 'fs/promises';
import { KIND_ID_PREFIXES } from '@rotp/game-data';
import { collectKindFiles } from '../data-files';
import { KIND_ROOTS } from './id-allocator.constants';
import type { AllocatableKind } from './id-allocator.type';

const highestUsed = async (root: string, kind: AllocatableKind): Promise<number> => {
  const files = await collectKindFiles(root, KIND_ROOTS[kind]);
  const prefix = KIND_ID_PREFIXES[kind];
  const pattern = new RegExp(`'${prefix}-(\\d+)'`, 'g');
  let highest = 0;
  for (const file of files) {
    const content = await readFile(file, 'utf-8');
    for (const match of content.matchAll(pattern)) {
      const n = Number(match[1]);
      if (n > highest) highest = n;
    }
  }
  return highest;
};

export { highestUsed };
