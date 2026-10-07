/* @layer shared-asset-extraction @kind logic */
/**
 * Two of our own drawings composited: a base picture with a smaller one
 * stamped in its bottom-right corner. This is the multiworld pool icon path,
 * where the base is a game's icon and the stamp is the Archipelago mark, so
 * the drawings themselves stay unbadged and usable on their own.
 *
 * It stays separate from upgrade-composite even though the two share the
 * stamp, because the colour regimes differ: an upgrade composite also reaches
 * a binary the core draws with one fixed sprite palette row, so its drawings
 * are constrained to that row. These become PNGs only, and carry any colours
 * the artist chose. One method per regime keeps a free-colour drawing from
 * reaching the quantized path by accident.
 */
import { artImage } from './art-picture';
import { stampBadge } from './badge-stamp';
import type { ImageBuffer } from '../graphics/png-writer';

interface ArtBadgeDef {
  /** Art-library name of the base picture. */
  art: string;
  /** Art-library name of the drawing stamped bottom-right; must fit the base. */
  badge: string;
}

const extractArtBadge = (def: ArtBadgeDef): ImageBuffer =>
  stampBadge(artImage(def.art), artImage(def.badge));

export { extractArtBadge };
export type { ArtBadgeDef };
