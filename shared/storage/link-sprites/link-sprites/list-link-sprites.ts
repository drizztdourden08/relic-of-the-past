/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { LINK_SPRITES_DIR, SPRITE_RE } from './link-sprites.constants';

const listLinkSprites = async (files: FileStore): Promise<string[]> => {
  const all = await files.list(LINK_SPRITES_DIR);
  return all.filter((f) => SPRITE_RE.test(f)).sort((a, b) => a.localeCompare(b));
};

export { listLinkSprites };
