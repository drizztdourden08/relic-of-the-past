/* @layer shared-asset-extraction @kind logic */
/**
 * Capacity-upgrade composites: a base picture with our up-arrow badge stamped
 * in its bottom-right corner (badge-stamp.ts). The base is either another
 * definition's output (by file name, resolved by the caller) or one of our own
 * drawings.
 */
import { artImage } from './art-picture';
import { stampBadge } from './badge-stamp';
import type { ImageBuffer } from '../graphics/png-writer';
import type { BaseResolver } from './base-resolver';

interface UpgradeCompositeDef {
  /** File name of the definition whose picture is the base. */
  baseFile?: string;
  /** One of our own drawings as the base, when no extracted sprite fits. */
  art?: string;
  /** The drawing stamped bottom-right. */
  badge: string;
}

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

export { extractUpgradeComposite };
export type { UpgradeCompositeDef };
