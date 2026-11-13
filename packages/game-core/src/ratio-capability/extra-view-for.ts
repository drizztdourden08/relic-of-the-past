/* @layer bridge-wasm @kind logic */
import type { GameSettings } from '@rotp/features';
import { allowedRatio } from './allowed-ratio';
import type { ExtraView } from './extra-view.type';
import { ratioToString } from './ratio-to-string';
import { renderHeight } from './render-height';
import { BASE_HEIGHT, BASE_WIDTH } from './ratio-capability.constants';

const NO_EXTRA: ExtraView = { cols: 0, rows: 0 };

// The extra columns and rows per side the core derives from the ExtendedAspectRatio INI value: the same
// integer maths as the custom "W:H" branch of the parser in core/zelda3/src/config.c. The core clamps both
// to what the enabled features and the build allow.
const extraViewFor = (s: GameSettings): ExtraView => {
  if (s.vanillaSafe || !s.extendedRendering || s.aspectRatio === 'original') return NO_EXTRA;
  const rowsAtRatio = renderHeight(s);
  const [w = 0, h = 0] = ratioToString(allowedRatio(s), rowsAtRatio).split(':').map(Number);
  if (w <= 0 || h <= 0) return NO_EXTRA;
  const cols = Math.trunc((Math.trunc((rowsAtRatio * w) / h) - BASE_WIDTH) / 2);
  if (cols > 0) return { cols, rows: 0 };
  const fullRows = Math.trunc((BASE_WIDTH * h) / w);
  return { cols: 0, rows: Math.max(0, Math.trunc((fullRows - BASE_HEIGHT) / 2)) };
};

export { extraViewFor };
