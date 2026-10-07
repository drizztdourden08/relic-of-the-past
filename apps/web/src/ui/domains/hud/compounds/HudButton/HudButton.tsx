/* @layer renderer-hud @kind component */
/**
 * HudButton draws a control's own face, picked per state.
 *
 * A FACE IS A PICTURE THE AUTHOR CHOSE, not an auto-resolved binding - unlike
 * the old `glyph` element, `states.idle` names a specific pack and glyph (or a
 * file), so the button always draws exactly what was picked in the states
 * editor. `unassigned` is the one state this component computes instead of
 * receives as a picture: `props.unassigned` says whether the bound slot fires
 * anything right now, and `dimWhenEmpty` never enters into it - the validator
 * already derived that flag from this same node's own `bind`
 * (`validate-node.ts`), so nothing here has to re-ask the question.
 *
 * A MISSING STATE FALLS BACK TO `idle`, full stop - no automatic dimming
 * stands in for a face nobody drew, matching the plan's own note that
 * `unassigned` supersedes the old flag instead of merely reproducing it.
 */
import { TILE } from '@shared/hud/engine';
import { HudGlyph } from '../../composites/HudGlyph';
import { HudSprite } from '../../primitives/HudSprite';
import { faceFor, stateFor } from './behavior/hud-button-state';
import type { HudButtonSpec } from '@shared/types/hud';
import type { HudGlyphSpec, HudNodeContent } from '../HudNodeRenderer/HudNodeRenderer.type';

interface HudButtonProps {
  spec: HudButtonSpec;
  content: HudNodeContent;
  /** The bound slot/verb fires nothing right now. Computed by the caller from
   *  the placed node's own `dimmed` (see the file header) - never from
   *  `content.slots`, which answers a different question (item ownership). */
  unassigned: boolean;
  /** Live press/hold detection is not wired yet - both default false, so
   *  every button reads as idle-or-unassigned until a later phase feeds real
   *  input state through. The state PICTURE is ready either way. */
  pressed?: boolean;
  held?: boolean;
  scale: number;
  spritesBase: string;
}

const HudButton = (props: HudButtonProps) => {
  const {
    spec, content, scale, spritesBase, pressed = false, held = false, unassigned = false,
  } = props;
  const face = faceFor(spec, stateFor({ pressed, held, unassigned }));
  const tile = TILE * scale;

  if (face.from === 'image') {
    return <HudSprite src={`${spritesBase}${face.file}`} width={tile} height={tile} outline scale={scale} />;
  }

  // `face.glyph` is a plain string in the document (`HudButtonFace`, chosen
  // from the same picker grid a `glyph` element's position is) - validated
  // against the same SDL-position-or-'DPAD' set at load time
  // (`validate-button-node.ts`), so this narrowing is safe, not
  // optimistic.
  const glyphSpec: HudGlyphSpec = { type: 'glyph', position: face.glyph as HudGlyphSpec['position'], pack: face.pack };
  const source = content.glyph(glyphSpec);
  if (!source) return null;
  return <HudGlyph source={source} scale={scale} size={TILE} />;
};

export { HudButton };
export type { HudButtonProps };
