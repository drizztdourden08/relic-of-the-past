/* @layer renderer-components @kind constants */
import { GROUND_TILE_SPRITE_DEFINITIONS } from '@shared/game/data/sprite-manifest/ground-tiles';
import type { EditorGround, EditorRatio } from './HudLayoutEditor.type';

const GLYPH_IMAGE_TYPES = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];

const SNES_LINES = 224;

const ratio = (id: string, w: number, h: number): EditorRatio =>
  ({ id, label: id, view: { w: Math.round((SNES_LINES * w) / h), h: SNES_LINES } });

const EDITOR_RATIOS: readonly EditorRatio[] = [
  ratio('16:9', 16, 9),
  ratio('16:10', 16, 10),
  ratio('21:9', 21, 9),
  ratio('4:3', 4, 3),
];

const EDITOR_GROUNDS: readonly EditorGround[] = GROUND_TILE_SPRITE_DEFINITIONS
  .map((sprite) => ({ file: sprite.file, label: sprite.label }));

const GROUND_TILE = 32;

const COUNT_STEP = 1;
const ANGLE_STEP = 15;
const MS_STEP = 10;

export {
  ANGLE_STEP, COUNT_STEP, EDITOR_GROUNDS, EDITOR_RATIOS, GLYPH_IMAGE_TYPES,
  GROUND_TILE, MS_STEP, SNES_LINES,
};
export type { EditorGround, EditorRatio } from './HudLayoutEditor.type';
