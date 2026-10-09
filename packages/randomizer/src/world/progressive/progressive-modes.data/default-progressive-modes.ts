/* @layer shared-game @kind logic */
import { DEFAULT_PROGRESSIVE_MODES } from './progressive-modes.data';
import type { ProgressiveModeSetting } from '../progressive.type';

const defaultProgressiveModes = (): ProgressiveModeSetting => ({ ...DEFAULT_PROGRESSIVE_MODES });

export { defaultProgressiveModes };
