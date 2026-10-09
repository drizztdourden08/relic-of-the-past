/* @layer shared-asset-extraction @kind logic */
import { artImage } from './art-picture';
import { stampBadge } from './badge-stamp';
import type { ImageBuffer } from '../graphics/png-writer';
import type { ArtBadgeDef } from './art-badge.type';

const extractArtBadge = (def: ArtBadgeDef): ImageBuffer =>
  stampBadge(artImage(def.art), artImage(def.badge));

export { extractArtBadge };
