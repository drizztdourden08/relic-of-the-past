/* @layer renderer-components @kind logic */
import { sdlAxisNameForIndex, sdlButtonNameForIndex } from '../../../hid-calibration/diagnostics/sdl-names';
import type { PositionalCaptureRecord, PositionalTarget } from '../positional-capture.type';

const positionalNameFor = (target: PositionalTarget, index: number): string | null =>
  target.kind === 'button' ? sdlButtonNameForIndex(index) : sdlAxisNameForIndex(index);

const buildRecord = (
  target: PositionalTarget,
  status: PositionalCaptureRecord['status'],
  firedIndex: number | null,
): PositionalCaptureRecord => ({
  id: target.id,
  kind: target.kind,
  askedLabel: target.label,
  status,
  firedIndex,
  firedPositionalName: firedIndex === null ? null : positionalNameFor(target, firedIndex),
  expectedIndex: target.expectedIndex,
  mismatch: status === 'captured' && target.expectedIndex !== null && firedIndex !== null && firedIndex !== target.expectedIndex,
});

export { buildRecord };
