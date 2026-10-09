/* @layer shared-asset-extraction @kind logic */
import { artImage } from './art-picture';
import { stampBadge } from './badge-stamp';
import type { ImageBuffer } from '../graphics/png-writer';
import type { BaseResolver } from './base-resolver.type';
import type { UpgradeCompositeDef } from './upgrade-composite.type';

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
