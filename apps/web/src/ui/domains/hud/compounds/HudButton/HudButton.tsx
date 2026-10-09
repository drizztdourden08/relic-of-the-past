/* @layer renderer-hud @kind component */
import { TILE } from '@shared/hud/engine';
import { HudGlyph } from '../../composites/HudGlyph';
import { HudSprite } from '../../primitives/HudSprite';
import { faceFor, stateFor } from './behavior/hud-button-state';
import type { HudGlyphSpec } from '../HudNodeRenderer/HudNodeRenderer.type';
import type { HudButtonProps } from './HudButton.type';

const HudButton = (props: HudButtonProps) => {
  const {
    spec, content, scale, spritesBase, pressed = false, held = false, unassigned = false,
  } = props;
  const face = faceFor(spec, stateFor({ pressed, held, unassigned }));
  const tile = TILE * scale;

  if (face.from === 'image') {
    return <HudSprite src={`${spritesBase}${face.file}`} width={tile} height={tile} outline scale={scale} />;
  }

  const glyphSpec: HudGlyphSpec = { type: 'glyph', position: face.glyph as HudGlyphSpec['position'], pack: face.pack };
  const source = content.glyph(glyphSpec);
  if (!source) return null;
  return <HudGlyph source={source} scale={scale} size={TILE} />;
};

export { HudButton };
