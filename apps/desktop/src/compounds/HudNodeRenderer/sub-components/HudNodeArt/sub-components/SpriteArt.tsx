/* @layer renderer-hud @kind component */
import { HudSprite } from '../../../../../primitives/HudSprite';
import type { SpriteArtProps } from '../HudNodeArt.type';

const SpriteArt = ({ spec, rect, displayScale, scale, spritesBase }: SpriteArtProps) => (
  <HudSprite
    src={`${spritesBase}${spec.file}.png`}
    width={rect.w * displayScale} height={rect.h * displayScale}
    outline scale={scale}
  />
);

export { SpriteArt };
