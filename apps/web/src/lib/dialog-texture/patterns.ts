/* @layer renderer-lib @kind logic */
import type { DialogTexture } from '@shared/game/dialog/box-style';
import type { PatternSpec } from './patterns.type';
import { PATTERNS } from './pattern-table.constants';

const patternOf = (texture: DialogTexture): PatternSpec | null =>
  texture === 'none' ? null : PATTERNS[texture];

export { patternOf };
export type { PatternSpec };
