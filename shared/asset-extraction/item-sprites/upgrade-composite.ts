/* @layer shared-asset-extraction @kind logic */
/**
 * Capacity-upgrade composites: a base picture with our up-arrow badge stamped
 * in its bottom-right corner. The base is either another definition's output
 * (by file name, resolved by the caller) or one of our own drawings. Badge
 * pixels overwrite the base; the badge's transparent pixels leave it alone.
 */
import { ImageBuffer } from '../graphics/png-writer';
import { artImage } from './art-picture';
import type { BaseResolver } from './base-resolver';

interface UpgradeCompositeDef {
  /** File name of the definition whose picture is the base. */
  baseFile?: string;
  /** One of our own drawings as the base, when no extracted sprite fits. */
  art?: string;
  /** The drawing stamped bottom-right. */
  badge: string;
}

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

const resolveBase = (def: UpgradeCompositeDef, resolve: BaseResolver): ImageBuffer => {
  const { baseFile, art } = def;
  if (baseFile !== undefined) {
    const base = resolve(baseFile);
    if (!base) throw new Error(`base sprite ${baseFile} produced no picture`);
    return base;
  }
  if (art !== undefined) return artImage(art);
  throw new Error('upgrade-composite needs a baseFile or an art name');
};

const extractUpgradeComposite = (def: UpgradeCompositeDef, resolve: BaseResolver): ImageBuffer =>
  stampBadge(resolveBase(def, resolve), artImage(def.badge));

export { extractUpgradeComposite, stampBadge };
export type { UpgradeCompositeDef };
