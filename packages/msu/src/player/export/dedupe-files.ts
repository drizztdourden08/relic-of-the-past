/* @layer renderer-lib @kind logic */
import { sha256Hex } from '@drizztdourden08/brock-core';
import type { DedupedFiles, LoadBytes } from './dedupe-files.type';

const dedupeByContent = async (names: string[], loadBytes: LoadBytes): Promise<DedupedFiles> => {
  const entries: DedupedFiles['entries'] = [];
  const canonical = new Map<string, string>();
  const byHash = new Map<string, string>();

  for (const name of names) {
    if (canonical.has(name)) continue;

    const bytes = await loadBytes(name);
    if (!bytes) throw new Error(`Cannot export: the pack no longer contains "${name}".`);

    const hash = await sha256Hex(bytes);
    const first = byHash.get(hash);
    if (first !== undefined) { canonical.set(name, first); continue; }

    byHash.set(hash, name);
    canonical.set(name, name);
    entries.push({ name, bytes });
  }

  return { entries, canonical };
};

export { dedupeByContent };
export type { LoadBytes };
