/* @layer shared-asset-extraction @kind logic */
import { ImageBuffer } from '../graphics/png-writer';

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
