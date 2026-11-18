/* @layer renderer-components @kind logic */
import { glyphArtUrl } from '../glyph-art';
import { spriteLabel } from './sprite-label';
import { spriteUrl } from './sprite-url';
import type { GlyphPack } from '@rotp/input-mapping';
import type { HudButtonFace } from '@rotp/hud';
import type { Translate } from '../translate.type';
import type { Translate } from '../translate.type';
import type { FaceArt } from './node-art.type';

const faceArtOf = (face: HudButtonFace | undefined, packs: readonly GlyphPack[], t: Translate): FaceArt | null => {
  if (face === undefined) return null;
  if (face.from === 'glyph') return { src: glyphArtUrl(packs, face.pack, face.glyph), name: face.glyph, kind: face.pack };
  return {
    src: face.file ? spriteUrl(face.file) : undefined,
    name: face.file ? spriteLabel(face.file) : t('hud-editing:art.choose-sprite'),
    kind: undefined,
  };
};

export { faceArtOf };
