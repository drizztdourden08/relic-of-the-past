/* @layer shared-input @kind logic */
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
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
  l2: 'L2',
  r2: 'R2',
  l3: 'L3',
  r3: 'R3',
};

/** The text printed on a button that sends this emit. */
const emitLabel = (emit: TouchEmit): string => EMIT_LABELS[emit];

export { emitLabel };
