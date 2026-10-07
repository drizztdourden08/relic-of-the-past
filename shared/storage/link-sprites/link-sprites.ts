/* @layer shared-storage @kind logic */
/**
 * The custom player sprite library over the FileStore port: a global, profile-independent
 * folder, `link-sprites/`, under the Data root. A profile's `linkSprite` setting selects one
 * file by name; the renderer stages the chosen file for the core at boot.
 *
 * Two containers live here side by side: `.zspr`, which other tools produce, and `.rsp`,
 * ours. File names become path segments, so every one that comes from outside passes
 * through safeFileName before it is joined.
 */
import type { FileStore } from '@shared/platform';
import { isRspName } from './parse-rsp';

const LINK_SPRITES_DIR = 'link-sprites';
const SPRITE_RE = /\.(zspr|rsp)$/i;

const spritePath = (name: string): string => `${LINK_SPRITES_DIR}/${name}`;

const listLinkSprites = async (files: FileStore): Promise<string[]> => {
  const all = await files.list(LINK_SPRITES_DIR);
  return all.filter((f) => SPRITE_RE.test(f)).sort((a, b) => a.localeCompare(b));
};

/** Strips the container extension to give what the UI shows as the sprite's name. */
const spriteStem = (name: string): string => name.replace(SPRITE_RE, '');

/** One path segment, word characters, dots and dashes only, keeping the container extension. */
const safeFileName = (name: string): string => {
  const ext = isRspName(name) ? 'rsp' : 'zspr';
  const base = spriteStem(name).replace(/[^\w.-]+/g, '_') || 'sprite';
  return `${base}.${ext}`;
};

/** safeFileName, then a numbered suffix until the name is free, so nothing is overwritten. */
const freeSpriteName = async (files: FileStore, name: string): Promise<string> => {
  const safe = safeFileName(name);
  if (!(await files.exists(spritePath(safe)))) return safe;
  const ext = isRspName(safe) ? 'rsp' : 'zspr';
  const stem = spriteStem(safe);
  for (let n = 2; n < 1000; n += 1) {
    const candidate = `${stem}-${n}.${ext}`;
    if (!(await files.exists(spritePath(candidate)))) return candidate;
  }
  return `${stem}-${Date.now()}.${ext}`;
};

/** Writes under the given name as is; callers pass a name that went through safeFileName. */
const writeLinkSprite = (files: FileStore, name: string, bytes: Uint8Array): Promise<void> =>
  files.writeBytes(spritePath(name), bytes);

const deleteLinkSprite = (files: FileStore, name: string): Promise<void> => files.remove(spritePath(name));

const readLinkSprite = (files: FileStore, name: string): Promise<Uint8Array | null> =>
  files.readBytes(spritePath(name));

export {
  LINK_SPRITES_DIR, listLinkSprites, spriteStem, safeFileName, freeSpriteName,
  writeLinkSprite, deleteLinkSprite, readLinkSprite,
};
