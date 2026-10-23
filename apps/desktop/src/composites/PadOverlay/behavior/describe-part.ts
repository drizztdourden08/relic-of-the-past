/* @layer renderer-components @kind logic */
import type { OverlayPartKind, PartState } from '../PadOverlay.type';
import { describeAnalog } from './describe-analog';
import { describeDpad } from './describe-dpad';
import { describeStick } from './describe-stick';

const describePart = (kind: OverlayPartKind, state: PartState | undefined): string | undefined => {
  if (kind === 'analog') return describeAnalog(state);
  if (kind === 'stick') return describeStick(state);
  if (kind === 'dpad') return describeDpad(state);
  return undefined;
};

export { describePart };
