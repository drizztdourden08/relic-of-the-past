/* @layer renderer-hud @kind component */
import { publicAsset } from '@app/lib/assets/public-asset';
import { customGlyphUrl } from '@app/lib/hud/custom-glyph-store';
import { HudImage } from '../../primitives/HudImage';
import { GLYPH_SIZE } from './HudGlyph.constants';
import type { HudGlyphProps } from './HudGlyph.type';

const HudGlyph = (props: HudGlyphProps) => {
  const { source, scale, size = GLYPH_SIZE } = props;

  const src = source.kind === 'built-in' ? publicAsset(source.assetPath) : customGlyphUrl(source.fileKey);
  if (!src) return null;

  const px = size * scale;

  return (
    <HudImage
      src={src}
      width={px}
      height={px}
      style={{ display: 'block', width: px, height: px }}
    />
  );
};

export { HudGlyph };
