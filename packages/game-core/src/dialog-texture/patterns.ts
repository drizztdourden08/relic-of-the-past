/* @layer renderer-lib @kind logic */
import type { DialogTexture } from '@rotp/game-data';
import type { PatternSpec } from './patterns.type';
import { PATTERNS } from './pattern-table.constants';

const patternOf = (texture: DialogTexture): PatternSpec | null =>
  texture === 'none' ? null : PATTERNS[texture];

export { patternOf };
