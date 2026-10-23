/* @layer renderer-components @kind logic */
import type { PartState } from '../PadOverlay.type';

const describeAnalog = (state: PartState | undefined): string => `${Math.round((state?.value ?? 0) * 100)}%`;

export { describeAnalog };
