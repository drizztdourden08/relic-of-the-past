/* @layer renderer-lib @kind logic */
import { getPlatform } from '@drizztdourden08/brock-react';
import type { GlyphPosition } from './custom-glyph-store.type';
import { MIME_BY_EXT } from './custom-glyph-store.constants';

const extensionOf = (name: string): string => {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  return MIME_BY_EXT[ext] ? ext : 'png';
};

const glyphFiles = {
  store: () => getPlatform().files,
  packsPath: (profileId: string): string => `profiles/${profileId}/hud-glyph-packs.json`,
  imagePath: (profileId: string, fileKey: string): string => `profiles/${profileId}/hud-glyphs/${fileKey}`,
  fileKeyFor: (packId: string, position: GlyphPosition, ext: string): string => `${packId}__${position}.${ext}`,
  extensionOf,
};

export { glyphFiles };
