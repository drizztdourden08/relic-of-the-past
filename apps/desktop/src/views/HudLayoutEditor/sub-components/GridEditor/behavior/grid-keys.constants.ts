/* @layer renderer-components @kind constants */
import type { ArrowStep } from '../GridEditor.type';

const ARROWS: Readonly<Record<string, ArrowStep>> = {
  ArrowLeft: { dx: -1, dy: 0 },
  ArrowRight: { dx: 1, dy: 0 },
  ArrowUp: { dx: 0, dy: -1 },
  ArrowDown: { dx: 0, dy: 1 },
};

export { ARROWS };
