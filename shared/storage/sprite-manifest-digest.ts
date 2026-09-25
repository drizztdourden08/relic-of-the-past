/* @layer shared-storage @kind logic */
/**
 * What the sprite manifest expects on disk, and a cheap fingerprint of it.
 *
 * Both halves of the app answer "are this ROM's sprites complete?". The
 * renderer over its FileStore (`storage/sprites.ts`) and the main process over
 * fs (`electron/sprites/extraction-state.ts`) both ask it and have to agree, so the
 * expected file list and the fingerprint are defined once, here.
 *
 * The fingerprint is FNV-1a, not a real hash: this file is imported by
 * the renderer, by the mobile host and by Node, so `node:crypto` is
 * not available to it, and nothing here is adversarial. The only question is
 * "is this the same manifest as last time". The file COUNT is carried alongside
 * the hash for the same reason, so a 32-bit collision would still have to also
 * land on the same number of sprites to go unnoticed.
 */
import { SPRITE_DEFINITIONS } from '../game/data/sprite-manifest/manifest';

/** Every filename the current manifest expects, unsorted (definition order). */
const expectedSpriteFiles = (): string[] => SPRITE_DEFINITIONS.map(def => `${def.file}.png`);

const fnv1a = (text: string): string => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
};

/** Sorted before hashing, so a reordered manifest is the same manifest. */
const spriteManifestDigest = (): string => {
  const files = expectedSpriteFiles();
  return `${files.length}-${fnv1a([...files].sort().join('\n'))}`;
};

export { expectedSpriteFiles, spriteManifestDigest };
