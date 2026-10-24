/* @layer renderer-components @kind logic */
import type { PartState } from '../PadOverlay.type';
import { signedText } from './signed-text';

const describeStick = (state: PartState | undefined): string =>
  `${signedText(state?.x)}, ${signedText(state?.y)}`;

export { describeStick };
