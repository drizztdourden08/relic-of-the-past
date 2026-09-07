/* @layer shared-asset-extraction @kind logic */
/**
 * Stamping one picture onto the corner of another. Two composites want this:
 * the capacity upgrades stamp an up-arrow on an item's own picture, and the
 * multiworld pool icons stamp the Archipelago mark on a game's icon. Badge
 * pixels overwrite the base; the badge's transparent pixels leave it alone.
 */
import { ImageBuffer } from '../graphics/png-writer';

/** A copy of `base` with `badge` anchored to its bottom-right corner. */
const stampBadge = (base: ImageBuffer, badge: ImageBuffer): ImageBuffer => {
  if (badge.width > base.width || badge.height > base.height) {
    throw new Error(`badge ${badge.width}x${badge.height} does not fit on ${base.width}x${base.height}`);
  }
  const out = new ImageBuffer(base.width, base.height);
  base.data.copy(out.data);
  out.paste(badge, base.width - badge.width, base.height - badge.height);
  return out;
};

export { stampBadge };
