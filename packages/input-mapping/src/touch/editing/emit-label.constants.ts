/* @layer shared-input @kind constants */
import type { TouchEmit } from '@rotp/features';

const EMIT_LABELS: Readonly<Record<TouchEmit, string>> = {
  a: 'A',
  b: 'B',
  x: 'X',
  y: 'Y',
  l: 'L',
  r: 'R',
  start: 'START',
  select: 'SELECT',
  up: 'Up',
  down: 'Down',
  left: 'Left',
  right: 'Right',
  l2: 'L2',
  r2: 'R2',
  l3: 'L3',
  r3: 'R3',
};

export { EMIT_LABELS };
