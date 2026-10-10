/* @layer renderer-components @kind constants */
import type { ArrowStep } from '../GridEditor.type';

const ARROWS: Readonly<Record<string, ArrowStep>> = {
  ArrowLeft: { glyph: '←', dx: -1, dy: 0 },
  ArrowRight: { glyph: '→', dx: 1, dy: 0 },
  ArrowUp: { glyph: '↑', dx: 0, dy: -1 },
  ArrowDown: { glyph: '↓', dx: 0, dy: 1 },
};

export { ARROWS };
