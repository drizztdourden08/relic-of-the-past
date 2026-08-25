/* @layer renderer-lib @kind logic */
/**
 * Content-hash dedupe for pack export.
 *
 * Packs collect duplicates naturally: an author copies `wind.flac` per area, or the same silent
 * stub sits under a dozen names. Those are byte-identical, so storing one copy and pointing every
 * reference at it is free — and on a gigabyte-scale pack it is the difference between an archive
 * a user can share and one they cannot.
 *
 * The output is a name→name map covering EVERY referenced name, not just the deduped ones, so a
 * caller rewriting the manifest can map each reference unconditionally and cannot leave one
 * pointing at a file that was never written. See ./remap-manifest.
 */
import { sha256Hex } from '@shared/storage/hash';

interface DedupedFiles {
  /** The bytes actually stored, in first-reference order. */
  entries: { name: string; bytes: Uint8Array }[];
  /** Referenced name → the name it is stored under. Every referenced name has an entry. */
  canonical: Map<string, string>;
}

type LoadBytes = (fileName: string) => Promise<Uint8Array | null>;

const dedupeByContent = async (names: string[], loadBytes: LoadBytes): Promise<DedupedFiles> => {
  const entries: DedupedFiles['entries'] = [];
  const canonical = new Map<string, string>();
  const byHash = new Map<string, string>();

  for (const name of names) {
    if (canonical.has(name)) continue;

    const bytes = await loadBytes(name);
    // Writing a manifest that names a file the archive does not contain would produce a pack
    // that fails on import instead of here, where the cause is still obvious.
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
export type { DedupedFiles, LoadBytes };
