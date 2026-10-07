/* @layer renderer-components @kind constants */
/** Static choices the editor offers. */
import { GROUND_TILE_SPRITE_DEFINITIONS } from '@shared/game/data/sprite-manifest/ground-tiles';
import type { Size } from '@shared/hud/layouts';

/** What a glyph import will accept. */
const GLYPH_IMAGE_TYPES = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];

/** The console's own line count. Every ratio is that height and a width to match,
 *  because the HUD is authored in SNES pixels and only the width ever moves. */
const SNES_LINES = 224;

interface EditorRatio {
  id: string;
  label: string;
  view: Size;
}

const ratio = (id: string, w: number, h: number): EditorRatio =>
  ({ id, label: id, view: { w: Math.round((SNES_LINES * w) / h), h: SNES_LINES } });

/**
 * The displays a layout has to survive.
 *
 * 16:9 is the narrowest a host-drawn style runs at and is where a layout is
 * tightest; 21:9 is where a corner-anchored group drifts furthest from the
 * middle; 4:3 is narrower than a host-drawn style allows and is here on purpose, because
 * a layout that only works at one ratio should be visible while it is being
 * authored, not after a resize in play.
 */
const EDITOR_RATIOS: readonly EditorRatio[] = [
  ratio('16:9', 16, 9),
  ratio('16:10', 16, 10),
  ratio('21:9', 21, 9),
  ratio('4:3', 4, 3),
];

interface EditorGround {
  file: string;
  label: string;
}

/**
 * The surfaces the HUD actually has to stay legible over, enumerated from the
 * extraction definitions instead of listed again here: the manifest owns which
 * grounds exist and what each is called, and a second list would be the one
 * that goes stale the day a sixth is cut.
 *
 * The DEFINITIONS are read instead of `SPRITE_MANIFEST`, because the manifest
 * is empty in a checkout with no vault records (it deliberately reports "no
 * definitions" instead of a partial set), while the ground blocks are our own
 * and are always there.
 */
const EDITOR_GROUNDS: readonly EditorGround[] = GROUND_TILE_SPRITE_DEFINITIONS
  .map((sprite) => ({ file: sprite.file, label: sprite.label }));

/** One extracted ground block, in game pixels. */
const GROUND_TILE = 32;

/**
 * THE STEPS THAT ARE A FACT ABOUT THE PROPERTY, NOT ABOUT THE SESSION (§56).
 *
 * Every number in the inspector with no `step` of its own now moves by the
 * editor's global step (1, 2, 4 or 8), because every one of those numbers is
 * in HUD pixels and 8 is the game's own grid. These three are not in pixels, so
 * they say what they are: a repeat's `count` is a whole number of children, a
 * gradient's `angle` is degrees, and a duration or a delay is milliseconds,
 * where a session-wide 8 would nudge a 200ms fade by 4 % at a time.
 */
const COUNT_STEP = 1;
const ANGLE_STEP = 15;
const MS_STEP = 10;

export {
  ANGLE_STEP, COUNT_STEP, EDITOR_GROUNDS, EDITOR_RATIOS, GLYPH_IMAGE_TYPES,
  GROUND_TILE, MS_STEP, SNES_LINES,
};
export type { EditorGround, EditorRatio };
